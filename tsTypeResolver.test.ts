import {resolveTsType} from "./tsTypeResolver";
import {Module, parse, TsType} from "@swc/core";


async function parseStringExtractType(code: string, typeName: string): Promise<{ fileAST: Module, testType: TsType }> {
  const result = await parse(code, {
    syntax: "typescript",
    comments: true,
    target: 'esnext',
  });

  for (const statement of result.body) {
    if (statement.type === 'TsTypeAliasDeclaration' && statement.id.value === typeName){
      return { fileAST: result, testType: statement.typeAnnotation};
    }
  }
}


describe('tsTypeResolver', () => {
  const tsTypeLiteralTestCases = [
    'type testType = {test: string}',
    'type testType = {test: {testNested: number}}',
    'type testType = {test: {testNested: number}, test2: string}',
    'type testType = string',
    'type testType = number',
    'type testType = boolean',
    'type testType = { test: string } | { test2: number }',
    'type testType = { test: string } & { test2: number }',
    'type testType = { test: string}[]',
    'type testType = [string, number]',
    'type testType = { test: \'test\' }',
    'type ReferencedType = {test: string }; type testType = ReferencedType;',
    'interface ReferencedInterface { test: string }; type testType = ReferencedInterface;',
    'export type ReferencedType = {test: string }; type testType = ReferencedType;',
    'export interface ReferencedInterface { test: string }; type testType = ReferencedInterface;',
// TODO: Support TemplateLiteral in resolveTsLiteralType 'export type ReferencedType = `${number}px`; export type testType = ReferencedType;',
// TODO: Move to TypeReferences   'type testType = Array<{ test: string}>',
  ]
  it.each(tsTypeLiteralTestCases)('should resolve self contained types', async (testCase) => {
    const typeAST = await parseStringExtractType(testCase, 'testType');
    const result = await resolveTsType({module: typeAST.fileAST, resolve: (path) => Promise.resolve({path, module: undefined})}, typeAST.testType);
    expect(result).toMatchSnapshot();
  });


  const tsFileTestCases = [
    {'entrypoint.ts': 'import {type ReferencedType} from \'types.ts\'; type testType = ReferencedType;', 'types.ts': 'export type ReferencedType = {test: string };'},
    {'entrypoint.ts': 'import {type ReferencedType} from \'barrel.ts\'; type testType = ReferencedType;', 'barrel.ts': 'export {ReferencedType} from \'types.ts\'', 'types.ts': 'export type ReferencedType = {test: string };'},
  ]
  it.each(tsFileTestCases)('should resolve types from another file', async (files) => {
    const typeAST = await parseStringExtractType(files['entrypoint.ts'], 'testType');

    const resolverFn = async (path: string) => {
      console.log('resolving', path);
      const result = await parse(files[path] ?? "", {
        syntax: "typescript",
        comments: true,
        target: 'esnext',
      });

      return { path, module: result };
    }

    const result = await resolveTsType({module: typeAST.fileAST, resolve: resolverFn}, typeAST.testType);
    expect(result).toMatchSnapshot();
  });

  const tsGenericTestCases = [
    {'entrypoint.ts': 'interface ReferencedType<T> { testPropT: T }; type testType = ReferencedType<ReferencedType<{testProp: string}>>;'},
  ];
  it.each(tsGenericTestCases)('should resolve generic types', async (testCase) => {
    const typeAST = await parseStringExtractType(testCase['entrypoint.ts'], 'testType');
    const result = await resolveTsType({module: typeAST.fileAST, resolve: (path) => Promise.resolve({path, module: undefined})}, typeAST.testType);
    expect(result).toMatchSnapshot();
  });
});