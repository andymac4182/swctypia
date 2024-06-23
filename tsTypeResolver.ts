import {
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

function resolveTsPropertySignature(member: TsPropertySignature) {
  if (member.typeAnnotation) {
    resolveTsType(member.typeAnnotation);
  }
}

function resolveTsTypeElement(member: TsTypeElement) {
  switch (member.type) {
    case "TsCallSignatureDeclaration":
      break;
    case "TsConstructSignatureDeclaration":
      break;
    case "TsPropertySignature":
      resolveTsPropertySignature(member);
      break;
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

function resolveTsTypeLiteral(tsType: TsTypeLiteral) {
  for (const member of tsType.members) {
    resolveTsTypeElement(member);
  }
}

export async function resolveTsType(tsType: TsType) {
  switch (tsType.type) {
    case "TsKeywordType":
      break;
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
      resolveTsTypeLiteral(tsType);
      break;
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
}