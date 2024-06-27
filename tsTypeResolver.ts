import {
  Expression,
  TsArrayType, TsConditionalType,
  TsConstructorType,
  TsFunctionType, TsImportType, TsIndexedAccessType, TsInferType, TsIntersectionType,
  TsKeywordType, TsLiteralType, TsMappedType, TsOptionalType, TsParenthesizedType, TsPropertySignature, TsRestType,
  TsThisType, TsTupleType, TsType,
  TsTypeLiteral, TsTypeOperator, TsTypePredicate,
  TsTypeQuery,
  TsTypeReference, TsUnionType
} from "@swc/core";
import {TsTypeElement} from "@swc/types";
import {ASTNode} from "./validation-ast";

async function resolveTsPropertySignature(member: TsPropertySignature) {
  if(member.computed){
    return undefined;
  }
  const prop =  {
    key: await resolveExpression(member.key),
    optional: member.optional,
    typeInfo: await resolveTsType(member.typeAnnotation.typeAnnotation),
  }
  console.log({prop});
  return prop;
}

async function resolveExpression(expr: Expression){
  switch (expr.type) {
    case "ThisExpression":
      break;
    case "ArrayExpression":
      break;
    case "ObjectExpression":
      break;
    case "FunctionExpression":
      break;
    case "UnaryExpression":
      break;
    case "UpdateExpression":
      break;
    case "BinaryExpression":
      break;
    case "AssignmentExpression":
      break;
    case "MemberExpression":
      break;
    case "SuperPropExpression":
      break;
    case "ConditionalExpression":
      break;
    case "CallExpression":
      break;
    case "NewExpression":
      break;
    case "SequenceExpression":
      break;
    case "Identifier":
      return expr.value;
    case "StringLiteral":
      break;
    case "BooleanLiteral":
      break;
    case "NullLiteral":
      break;
    case "NumericLiteral":
      break;
    case "BigIntLiteral":
      break;
    case "RegExpLiteral":
      break;
    case "JSXText":
      break;
    case "TemplateLiteral":
      break;
    case "TaggedTemplateExpression":
      break;
    case "ArrowFunctionExpression":
      break;
    case "ClassExpression":
      break;
    case "YieldExpression":
      break;
    case "MetaProperty":
      break;
    case "AwaitExpression":
      break;
    case "ParenthesisExpression":
      break;
    case "JSXMemberExpression":
      break;
    case "JSXNamespacedName":
      break;
    case "JSXEmptyExpression":
      break;
    case "JSXElement":
      break;
    case "JSXFragment":
      break;
    case "TsTypeAssertion":
      break;
    case "TsConstAssertion":
      break;
    case "TsNonNullExpression":
      break;
    case "TsAsExpression":
      break;
    case "TsSatisfiesExpression":
      break;
    case "TsInstantiation":
      break;
    case "PrivateName":
      break;
    case "OptionalChainingExpression":
      break;
    case "Invalid":
      break;

  }
}

async function resolveTsTypeElement(member: TsTypeElement) {
  switch (member.type) {
    case "TsCallSignatureDeclaration":
      break;
    case "TsConstructSignatureDeclaration":
      break;
    case "TsPropertySignature":
      return await resolveTsPropertySignature(member);
    case "TsGetterSignature":
      break;
    case "TsSetterSignature":
      break;
    case "TsMethodSignature":
      break;
    case "TsIndexSignature":
      break;
  }
}

async function resolveTsTypeLiteral(tsType: TsTypeLiteral): Promise<ASTNode> {
  const properties: { [key: string]: ASTNode } = {};
  for (const member of tsType.members) {
    const result = await resolveTsTypeElement(member);
    if (result) {
      properties[result.key] = result.typeInfo
    }
  }
  return {
    type: 'object',
    properties,
  }
}

async function resolveTsKeywordType(tsType: TsKeywordType): Promise<ASTNode | undefined> {
  switch (tsType.kind) {
  case "string":
    return { type: 'string' }
  case "number":
    return { type: 'number' }
  case "bigint":
    break;
  case "boolean":
    return { type: 'boolean' };
  case "symbol":
    break;
  case "undefined":
    break;
  case "object":
    break;
  case "any":
    break;
  case "unknown":
    break;
  case "void":
    break;
  case "null":
    break;
  case "never":
    break;
  case "intrinsic":
    break;

}
}

export async function resolveTsType(tsType: TsType): Promise<ASTNode | undefined> {
  switch (tsType.type) {
    case "TsKeywordType":
      return await resolveTsKeywordType(tsType);
    case "TsThisType":
      break;
    case "TsFunctionType":
      break;
    case "TsConstructorType":
      break;
    case "TsTypeReference":
      break;
    case "TsTypeQuery":
      break;
    case "TsTypeLiteral":
      return await resolveTsTypeLiteral(tsType);
    case "TsArrayType":
      break;
    case "TsTupleType":
      break;
    case "TsOptionalType":
      break;
    case "TsRestType":
      break;
    case "TsUnionType":
      break;
    case "TsIntersectionType":
      break;
    case "TsConditionalType":
      break;
    case "TsInferType":
      break;
    case "TsParenthesizedType":
      break;
    case "TsTypeOperator":
      break;
    case "TsIndexedAccessType":
      break;
    case "TsMappedType":
      break;
    case "TsLiteralType":
      break;
    case "TsTypePredicate":
      break;
    case "TsImportType":
      break;
  }
  return undefined;
}