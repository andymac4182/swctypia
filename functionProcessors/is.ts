import {CallExpression, Expression, parse} from "@swc/core";
import {resolveTsType} from "../tsTypeResolver";
import {Context} from "../index";
import {generateValidationCode} from "../validation-ast";

export async function isProcessor(ctx: Context, expression: CallExpression): Promise<Expression | undefined> {
  if (expression.callee.type === "Identifier") {
    expression.callee.value = `__swctypia.${expression.callee.value}`;
  }
  const firstTypeParam = expression?.typeArguments?.params?.[0];
  if(firstTypeParam){
    const result = await resolveTsType(ctx, firstTypeParam);
    const generatedCode = generateValidationCode(result, "test1");
    console.log(generatedCode);
    const replacementAST = await parse(generatedCode, {
      syntax: "typescript",
      comments: true,
      target: 'esnext',
    });
    if(replacementAST.body[0].type === "ExpressionStatement"){
      return replacementAST.body[0].expression;
    }
  }
}