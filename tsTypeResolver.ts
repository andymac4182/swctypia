import {
  Expression,
  TsArrayType,
  TsInterfaceBody, TsInterfaceDeclaration,
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

async function resolveTsPropertySignature(ctx: Context, member: TsPropertySignature, typeParams: KeyToASTNode) {
  if(member.computed){
    return undefined;
  }
  const typeInfoToResolve = member.typeAnnotation?.typeAnnotation;

  return {
    key: await resolveExpression(member.key),
    optional: member.optional,
    typeInfo: typeInfoToResolve ? await resolveTsType(ctx, typeInfoToResolve, typeParams) : undefined,
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

async function resolveTsTypeElement(ctx: Context, member: TsTypeElement, typeParams: KeyToASTNode) {
  switch (member.type) {
    case "TsCallSignatureDeclaration":
      break;
    case "TsConstructSignatureDeclaration":
      break;
    case "TsPropertySignature":
      return await resolveTsPropertySignature(ctx, member, typeParams);
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

async function resolveTsTypeElementArrayToObject(ctx: Context, members: TsTypeElement[], typeParams: KeyToASTNode): Promise<ASTNode | undefined> {
  const properties: { [key: string]: ASTNode } = {};
  for (const member of members) {
    const result = await resolveTsTypeElement(ctx, member, {});
    if (result && result.key && result.typeInfo) {
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

interface KeyToASTNode { [key: string]: ASTNode }

async function resolveTsInterfaceDeclaration(ctx: Context, statement: TsInterfaceDeclaration, resolvedTypeParams?: ASTNode[]) {
  const typeParams: KeyToASTNode = {};
  if(statement.typeParams && resolvedTypeParams){
    for (let i = 0; i < statement.typeParams.parameters.length; i++) {
      typeParams[statement.typeParams.parameters[i].name.value] = resolvedTypeParams[i];
    }

  }

  return await resolveTsTypeElementArrayToObject(ctx, statement.body.body, typeParams);
}

async function resolveTypeFromFile(ctx: Context, source: string, typeName: string): Promise<ASTNode | undefined> {
  const importedModule = await ctx.resolve(source);
  if (importedModule) {
    for (const importedStatement of importedModule.module.body) {
      if (importedStatement.type === 'ExportDeclaration' && importedStatement.declaration.type === 'TsTypeAliasDeclaration' && importedStatement.declaration.id.value === typeName) {
        return await resolveTsType(ctx, importedStatement.declaration.typeAnnotation);
      }
      if (importedStatement.type === 'ExportDeclaration' && importedStatement.declaration.type === 'TsInterfaceDeclaration' && importedStatement.declaration.id.value === typeName) {
        return await resolveTsInterfaceDeclaration(ctx, importedStatement.declaration);
      }
      if (importedStatement.type === "ExportNamedDeclaration"){
        const fileToResolveFrom = importedStatement.source?.value;
        return fileToResolveFrom ? await resolveTypeFromFile(ctx, fileToResolveFrom, typeName) : undefined;
      }
    }
  }
}



async function resolveTsTypeReference(ctx: Context, tsType: TsTypeReference): Promise<ASTNode | undefined> {
  switch (tsType.typeName.type) {
    case "Identifier":
      const typeName = tsType.typeName.value;
      const typeParams = tsType.typeParams;
      const resolvedTypeParams: ASTNode[] | undefined = [];
      if (typeParams) {
        for (const typeParam of typeParams.params) {
          const result = await resolveTsType(ctx, typeParam);
          if(result) {
            resolvedTypeParams.push(result);
          }
        }
      }
      for (const statement of ctx.module.body) {
        if (statement.type === 'ImportDeclaration' && statement.specifiers.some(specifier => specifier.local.value === typeName)) {
          return await resolveTypeFromFile(ctx, statement.source.value, typeName);
        }
        if (statement.type === 'TsTypeAliasDeclaration' && statement.id.value === typeName) {
          return await resolveTsType(ctx, statement.typeAnnotation);
        }
        if (statement.type === 'ExportDeclaration' && statement.declaration.type === 'TsTypeAliasDeclaration' && statement.declaration.id.value === typeName) {
          return await resolveTsType(ctx, statement.declaration.typeAnnotation);
        }
        if (statement.type === 'TsInterfaceDeclaration' && statement.id.value === typeName) {
          return await resolveTsInterfaceDeclaration(ctx, statement, resolvedTypeParams);
        }
        if (statement.type === 'ExportDeclaration' && statement.declaration.type === 'TsInterfaceDeclaration' && statement.declaration.id.value === typeName) {
          return await resolveTsInterfaceDeclaration(ctx, statement.declaration, resolvedTypeParams);
        }
      }
      break;
    case "TsQualifiedName":
      break;
  }
}

export async function resolveTsType(ctx: Context, tsType: TsType, typeParams?: KeyToASTNode): Promise<ASTNode | undefined> {
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
      if(typeParams && tsType.typeName.type === 'Identifier' && typeParams[tsType.typeName.value]){
        return typeParams[tsType.typeName.value];
      }
      return await resolveTsTypeReference(ctx, tsType);
    case "TsTypeQuery":
      break;
    case "TsTypeLiteral":
      return await resolveTsTypeElementArrayToObject(ctx, tsType.members, {});
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