import {resolveTsType} from "./tsTypeResolver";
import {parse} from "@swc/core";


async function parseStringExtractType(code: string) {
  const result = await parse(code, {
    syntax: "typescript",
    comments: true,
    target: 'esnext',
  });

  for (const statement of result.body) {
    if (statement.type === 'TsTypeAliasDeclaration' && statement.id.value === 'testType'){
      return statement.typeAnnotation;
    }
  }
}


describe('tsTypeResolver', () => {
  it('should resolve a type', async () => {
    const typeAST = await parseStringExtractType('type testType = {test: string}');
    const result = await resolveTsType(typeAST);
    expect(result).toMatchSnapshot();
  });
});