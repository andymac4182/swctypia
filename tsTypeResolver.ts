import {
  Expression, Module,
  TsArrayType, TsConditionalType,
  TsConstructorType,
  TsFunctionType, TsImportType, TsIndexedAccessType, TsInferType, TsInterfaceBody, TsIntersectionType,
  TsKeywordType, TsLiteralType, TsMappedType, TsOptionalType, TsParenthesizedType, TsPropertySignature, TsRestType,
  TsThisType, TsTupleType, TsType,
  TsTypeLiteral, TsTypeOperator, TsTypePredicate,
  TsTypeQuery,
  TsTypeReference, TsUnionType
} from "@swc/core";
import {TsTypeElement} from "@swc/types";
import {ASTNode} from "./validation-ast";

async function resolveTsPropertySignature(fileAST: Module, member: TsPropertySignature) {
  if(member.computed){
    return undefined;
  }
  const prop =  {
    key: await resolveExpression(member.key),
    optional: member.optional,
    typeInfo: await resolveTsType(fileAST, member.typeAnnotation.typeAnnotation),
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

async function resolveTsTypeElement(fileAST: Module, member: TsTypeElement) {
  switch (member.type) {
    case "TsCallSignatureDeclaration":
      break;
    case "TsConstructSignatureDeclaration":
      break;
    case "TsPropertySignature":
      return await resolveTsPropertySignature(fileAST, member);
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

async function resolveTsTypeLiteral(fileAST: Module, tsType: TsTypeLiteral): Promise<ASTNode | undefined> {
  const properties: { [key: string]: ASTNode } = {};
  for (const member of tsType.members) {
    const result = await resolveTsTypeElement(fileAST, member);
    if (result) {
      properties[result.key] = result.typeInfo
    }
  }
  return {
    type: 'object',
    properties,
  }
}

async function resolveTsKeywordType(fileAST: Module, tsType: TsKeywordType): Promise<ASTNode | undefined> {
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

async function resolveTsIntersectionType(fileAST: Module, tsType: TsIntersectionType): Promise<ASTNode | undefined> {
  const properties: { [key: string]: ASTNode } = {};
  for (const type of tsType.types) {
    const result = await resolveTsType(fileAST, type);
    if (result && result.type === 'object') {
      for (const [key, value] of Object.entries(result.properties)) {
        properties[key] = value;
      }
    }
  }
  return {
    type: 'object',
    properties,
  }
}

async function resolveTsUnionType(fileAST: Module, tsType: TsUnionType): Promise<ASTNode | undefined> {
  const types: ASTNode[] = [];
  for (const type of tsType.types) {
    const result = await resolveTsType(fileAST, type);
    if (result) {
      types.push(result);
    }
  }
  return {
    type: 'union',
    types,
  }
}

async function resolveTsArrayType(fileAST: Module, tsType: TsArrayType): Promise<ASTNode | undefined> {
  const elementType = await resolveTsType(fileAST, tsType.elemType);
  if (elementType) {
    return {
      type: 'array',
      elementType,
    }
  }
}

async function resolveTsTupleType(fileAST: Module, tsType: TsTupleType): Promise<ASTNode | undefined> {
  const types: ASTNode[] = [];
  for (const type of tsType.elemTypes) {
    const result = await resolveTsType(fileAST, type.ty);
    if (result) {
      types.push(result);
    }
  }
  return {
    type: 'tuple',
    types,
  }
}

async function resolveTsLiteralType(tsType: TsLiteralType): Promise<ASTNode | undefined> {
  switch (tsType.literal.type) {
    case "NumericLiteral":
      return { type: 'literal', value: tsType.literal.value }
    case "StringLiteral":
      return { type: 'literal', value: tsType.literal.value }
    case "BooleanLiteral":
      return { type: 'literal', value: tsType.literal.value }
    case "BigIntLiteral":
      return { type: 'literal', value: tsType.literal.value }
    case "TemplateLiteral":
      break;
  }
}

async function resolveTsInterfaceBody(fileAST: Module, body: TsInterfaceBody): Promise<ASTNode | undefined> {
  const properties: { [key: string]: ASTNode } = {};
  for (const member of body.body) {
    const result = await resolveTsTypeElement(fileAST, member);
    if (result) {
      properties[result.key] = result.typeInfo
    }
  }
  return {
    type: 'object',
    properties,
  }
}

async function resolveTsTypeReference(fileAST: Module, tsType: TsTypeReference): Promise<ASTNode | undefined> {
  switch (tsType.typeName.type) {
    case "Identifier":
      const typeName = tsType.typeName.value;
      for (const statement of fileAST.body) {
        if (statement.type === 'TsTypeAliasDeclaration' && statement.id.value === typeName) {
          return await resolveTsType(fileAST, statement.typeAnnotation);
        }
        if (statement.type === 'TsInterfaceDeclaration' && statement.id.value === typeName) {
          return await resolveTsInterfaceBody(fileAST, statement.body);
        }
      }
      break;
    case "TsQualifiedName":
      break;
  }
}

export async function resolveTsType(fileAST: Module, tsType: TsType): Promise<ASTNode | undefined> {
  switch (tsType.type) {
    case "TsKeywordType":
      return await resolveTsKeywordType(fileAST, tsType);
    case "TsThisType":
      break;
    case "TsFunctionType":
      break;
    case "TsConstructorType":
      break;
    case "TsTypeReference":
      return await resolveTsTypeReference(fileAST, tsType);
    case "TsTypeQuery":
      break;
    case "TsTypeLiteral":
      return await resolveTsTypeLiteral(fileAST, tsType);
    case "TsArrayType":
      return await resolveTsArrayType(fileAST, tsType);
    case "TsTupleType":
      return await resolveTsTupleType(fileAST, tsType);
    case "TsOptionalType":
      break;
    case "TsRestType":
      break;
    case "TsUnionType":
      return await resolveTsUnionType(fileAST, tsType);
    case "TsIntersectionType":
      return await resolveTsIntersectionType(fileAST, tsType);
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
      return await resolveTsLiteralType(tsType);
    case "TsTypePredicate":
      break;
    case "TsImportType":
      break;
  }
  return undefined;
}