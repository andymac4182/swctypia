import {CallExpression} from "@swc/core";
import {resolveTsType} from "../tsTypeResolver";
import {Context} from "../index";

export async function isProcessor(ctx: Context, expression: CallExpression) {
  if (expression.callee.type === "Identifier") {
    expression.callee.value = `__swctypia.${expression.callee.value}`;
  }
  const firstTypeParam = expression.typeArguments.params[0];
  if(firstTypeParam){
    await resolveTsType(firstTypeParam);
  }
}