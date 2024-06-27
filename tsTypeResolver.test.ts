import {resolveTsType} from "./tsTypeResolver";
import {Module, parse, TsType} from "@swc/core";


async function parseStringExtractType(code: string): Promise<{ fileAST: Module, testType: TsType }> {
  const result = await parse(code, {
    syntax: "typescript",
    comments: true,
    target: 'esnext',
  });

  for (const statement of result.body) {
    if (statement.type === 'TsTypeAliasDeclaration' && statement.id.value === 'testType'){
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
// TODO: Move to TypeReferences   'type testType = Array<{ test: string}>',
  ]
  it.each(tsTypeLiteralTestCases)('should resolve self contained types', async (testCase) => {
    const typeAST = await parseStringExtractType(testCase);
    const result = await resolveTsType(typeAST.fileAST, typeAST.testType);
    expect(result).toMatchSnapshot();
  });
});