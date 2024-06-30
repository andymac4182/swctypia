import {
  Expression,
  TsArrayType,
  TsInterfaceBody,
  TsIntersectionType,
  TsKeywordType,
  TsLiteralType,
  TsPropertySignature,
  TsTupleType,
  TsType,
  TsTypeLiteral,
  TsTypeReference,
  TsUnionType
} from "@swc/core";
import {TsTypeElement} from "@swc/types";
import {ASTNode} from "./validation-ast";
import {Context} from "./index";

async function resolveTsPropertySignature(ctx: Context, member: TsPropertySignature) {
  if(member.computed){
    return undefined;
  }
  return {
    key: await resolveExpression(member.key),
    optional: member.optional,
    typeInfo: await resolveTsType(ctx, member.typeAnnotation.typeAnnotation),
  };
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

async function resolveTsTypeElement(ctx: Context, member: TsTypeElement) {
  switch (member.type) {
    case "TsCallSignatureDeclaration":
      break;
    case "TsConstructSignatureDeclaration":
      break;
    case "TsPropertySignature":
      return await resolveTsPropertySignature(ctx, member);
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

async function resolveTsTypeLiteral(ctx: Context, tsType: TsTypeLiteral): Promise<ASTNode | undefined> {
  const properties: { [key: string]: ASTNode } = {};
  for (const member of tsType.members) {
    const result = await resolveTsTypeElement(ctx, member);
    if (result) {
      properties[result.key] = result.typeInfo
    }
  }
  return {
    type: 'object',
    properties,
  }
}

async function resolveTsKeywordType(ctx: Context, tsType: TsKeywordType): Promise<ASTNode | undefined> {
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

async function resolveTsIntersectionType(ctx: Context, tsType: TsIntersectionType): Promise<ASTNode | undefined> {
  const properties: { [key: string]: ASTNode } = {};
  for (const type of tsType.types) {
    const result = await resolveTsType(ctx, type);
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

async function resolveTsUnionType(ctx: Context, tsType: TsUnionType): Promise<ASTNode | undefined> {
  const types: ASTNode[] = [];
  for (const type of tsType.types) {
    const result = await resolveTsType(ctx, type);
    if (result) {
      types.push(result);
    }
  }
  return {
    type: 'union',
    types,
  }
}

async function resolveTsArrayType(ctx: Context, tsType: TsArrayType): Promise<ASTNode | undefined> {
  const elementType = await resolveTsType(ctx, tsType.elemType);
  if (elementType) {
    return {
      type: 'array',
      elementType,
    }
  }
}

async function resolveTsTupleType(ctx: Context, tsType: TsTupleType): Promise<ASTNode | undefined> {
  const types: ASTNode[] = [];
  for (const type of tsType.elemTypes) {
    const result = await resolveTsType(ctx, type.ty);
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

async function resolveTsInterfaceBody(ctx: Context, body: TsInterfaceBody): Promise<ASTNode | undefined> {
  const properties: { [key: string]: ASTNode } = {};
  for (const member of body.body) {
    const result = await resolveTsTypeElement(ctx, member);
    if (result) {
      properties[result.key] = result.typeInfo
    }
  }
  return {
    type: 'object',
    properties,
  }
}

async function resolveTypeFromFile(ctx: Context, source: string, typeName: string){
  const importedModule = await ctx.resolve(source);
  console.log('importedModule', importedModule.module.body);
  if (importedModule) {
    for (const importedStatement of importedModule.module.body) {
      if (importedStatement.type === 'ExportDeclaration' && importedStatement.declaration.type === 'TsTypeAliasDeclaration' && importedStatement.declaration.id.value === typeName) {
        return await resolveTsType(ctx, importedStatement.declaration.typeAnnotation);
      }
      if (importedStatement.type === 'ExportDeclaration' && importedStatement.declaration.type === 'TsInterfaceDeclaration' && importedStatement.declaration.id.value === typeName) {
        return await resolveTsInterfaceBody(ctx, importedStatement.declaration.body);
      }
      if (importedStatement.type === "ExportNamedDeclaration"){
        return await resolveTypeFromFile(ctx, importedStatement.source.value, typeName);
      }
    }
  }
}

async function resolveTsTypeReference(ctx: Context, tsType: TsTypeReference): Promise<ASTNode | undefined> {
  switch (tsType.typeName.type) {
    case "Identifier":
      const typeName = tsType.typeName.value;
      const typeParams = tsType.typeParams;
      for (const statement of ctx.module.body) {
        if (statement.type === 'ImportDeclaration' && statement.specifiers.some(specifier => specifier.local.value === typeName)) {
          return await resolveTypeFromFile(ctx, statement.source.value, typeName);
        }
        if (statement.type === 'TsTypeAliasDeclaration' && statement.id.value === typeName) {
          return await resolveTsType(ctx, statement.typeAnnotation);
        }
        if (statement.type === 'TsInterfaceDeclaration' && statement.id.value === typeName) {
          return await resolveTsInterfaceBody(ctx, statement.body);
        }
        if (statement.type === 'ExportDeclaration' && statement.declaration.type === 'TsTypeAliasDeclaration' && statement.declaration.id.value === typeName) {
          return await resolveTsType(ctx, statement.declaration.typeAnnotation);
        }
        if (statement.type === 'ExportDeclaration' && statement.declaration.type === 'TsInterfaceDeclaration' && statement.declaration.id.value === typeName) {
          return await resolveTsInterfaceBody(ctx, statement.declaration.body);
        }
      }
      break;
    case "TsQualifiedName":
      break;
  }
}

export async function resolveTsType(ctx: Context, tsType: TsType): Promise<ASTNode | undefined> {
  switch (tsType.type) {
    case "TsKeywordType":
      return await resolveTsKeywordType(ctx, tsType);
    case "TsThisType":
      break;
    case "TsFunctionType":
      break;
    case "TsConstructorType":
      break;
    case "TsTypeReference":
      return await resolveTsTypeReference(ctx, tsType);
    case "TsTypeQuery":
      break;
    case "TsTypeLiteral":
      return await resolveTsTypeLiteral(ctx, tsType);
    case "TsArrayType":
      return await resolveTsArrayType(ctx, tsType);
    case "TsTupleType":
      return await resolveTsTupleType(ctx, tsType);
    case "TsOptionalType":
      break;
    case "TsRestType":
      break;
    case "TsUnionType":
      return await resolveTsUnionType(ctx, tsType);
    case "TsIntersectionType":
      return await resolveTsIntersectionType(ctx, tsType);
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