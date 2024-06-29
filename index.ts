import {
  ArrayExpression,
  ArrowFunctionExpression,
  AssignmentExpression,
  AssignmentProperty,
  AwaitExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  ClassDeclaration,
  ClassExpression,
  ClassMember,
  ClassMethod,
  ClassProperty,
  ConditionalExpression,
  Constructor,
  DoWhileStatement,
  EmptyStatement,
  ExportDeclaration,
  ExportDefaultExpression,
  Expression,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  GetterProperty,
  IfStatement,
  KeyValueProperty,
  LabeledStatement,
  MemberExpression,
  MethodProperty,
  Module,
  NewExpression,
  ObjectExpression,
  parse,
  Pattern,
  print,
  PrivateMethod,
  PrivateProperty,
  Property,
  ReturnStatement,
  SequenceExpression,
  SetterProperty,
  Statement,
  StaticBlock,
  SwitchStatement,
  ThrowStatement,
  TryStatement,
  TsIndexSignature,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  WhileStatement,
  WithStatement,
  YieldExpression
} from '@swc/core';
import {ExprOrSpread} from "@swc/types";
import {isProcessor} from './functionProcessors/is'
import * as path from "node:path";

export interface Context {
  module: Module;
  resolve: (toLookup: string) => Promise<{ path: string, module: Module }>;
}

async function findSwcTypiaImports(result: Module) {
  const functionsToFind = [];
  for (const item of result.body) {
    if (item.type === "ImportDeclaration") {
      if (item.source.type === "StringLiteral" && item.source.value === './swctypia') {
        for (const specifier of item.specifiers) {
          if (specifier.type === "ImportSpecifier" && specifier.local.type === "Identifier") {
            functionsToFind.push(specifier.local.value);
          }
        }
      }
    }
  }

  if (functionsToFind.length === 0) {
    return undefined;
  }
  return functionsToFind;
}

function resolve(originPath: string) {
  return async (toLookup: string) => {
    return path.resolve(path.dirname(originPath), toLookup);
  }
}

export async function transformFile(path: string, code: string) {
  try {
    const result = await parse(code, {
      syntax: "typescript",
      comments: true,
      target: 'esnext',
    });

    const functionsToFind = await findSwcTypiaImports(result);
    if (!functionsToFind) {
      console.log({path}, 'SWCTypia not imported');
      return {code};
    }
    const ctx: Context = {
      module: result,
      resolve: resolve(path),
    }
    await findSwcTypiaUsage(ctx, result, functionsToFind ?? []);

    return await print(result, {isModule: true, minify: false});
  } catch (e) {
    console.error('Error processing file', path);
    console.error(e);
    return {code};
  }
}

async function visitCallExpression(ctx: Context, expression: CallExpression, functionsToFind: string[]) {
  if (expression.callee.type === "Identifier" && functionsToFind.includes(expression.callee.value)) {
    await isProcessor(ctx, expression);
  }
}

async function visitExprOrSpread(ctx: Context, item: ExprOrSpread, functionsToFind: string[]) {
  await visitExpression(ctx, item.expression, functionsToFind);
}

async function visitArrayExpression(ctx: Context, expression: ArrayExpression, functionsToFind: string[]) {
  for (const item of expression.elements){
    if(item){
      await visitExprOrSpread(ctx, item, functionsToFind);
    }
  }
}

async function visitYieldExpression(ctx: Context, expr: YieldExpression, functionsToFind: string[]) {
  if(expr.argument){
    await visitExpression(ctx, expr.argument, functionsToFind);
  }
}

async function visitClassExpression(ctx: Context, expr: ClassExpression, functionsToFind: string[]) {
  await visitClassMember(ctx, expr.body, functionsToFind);
}

async function visitAwaitExpression(ctx: Context, expr: AwaitExpression, functionsToFind: string[]) {
  await visitExpression(ctx, expr.argument, functionsToFind);
}

async function visitExpression(ctx: Context, expr: Expression, functionsToFind: string[]){
  switch (expr.type){
    case "StringLiteral":
      break;
    case "Identifier":
      break;
    case "ThisExpression":
      break;
    case "ArrayExpression":
      await visitArrayExpression(ctx, expr, functionsToFind);
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
      await visitCallExpression(ctx, expr, functionsToFind);
      break;
    case "NewExpression":
      break;
    case "SequenceExpression":
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
      await visitArrowFunctionExpression(ctx, expr, functionsToFind);
      break;
    case "ClassExpression":
      await visitClassExpression(ctx, expr, functionsToFind);
      break;
    case "YieldExpression":
      await visitYieldExpression(ctx, expr, functionsToFind);
      break;
    case "MetaProperty":
      break;
    case "AwaitExpression":
      await visitAwaitExpression(ctx, expr, functionsToFind);
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

async function visitExpressionStatement(ctx: Context, stmt: ExpressionStatement, functionsToFind: string[]) {
  await visitExpression(ctx, stmt.expression, functionsToFind);
}

async function visitFunctionExpression(ctx: Context, init: FunctionExpression, functionsToFind: string[]) {
  if(init.body){
    await visitBlockStatement(ctx, init.body, functionsToFind);
  }
}

async function visitUnaryExpression(ctx: Context, init: UnaryExpression, functionsToFind: string[]) {
  await visitExpression(ctx, init.argument, functionsToFind);
}

async function visitUpdateExpression(ctx: Context, init: UpdateExpression, functionsToFind: string[]) {
  await visitExpression(ctx, init.argument, functionsToFind);
}

async function visitBinaryExpression(ctx: Context, init: BinaryExpression, functionsToFind: string[]) {
  await visitExpression(ctx, init.left, functionsToFind);
  await visitExpression(ctx, init.right, functionsToFind);
}

async function visitAssignmentExpression(ctx: Context, init: AssignmentExpression, functionsToFind: string[]) {
  // visitExpression(init.left, functionsToFind); // TODO: Handle
  await visitExpression(ctx, init.right, functionsToFind);
}

async function visitConditionalExpression(ctx: Context, init: ConditionalExpression, functionsToFind: string[]) {
  await visitExpression(ctx, init.test, functionsToFind);
  await visitExpression(ctx, init.consequent, functionsToFind);
  await visitExpression(ctx, init.alternate, functionsToFind);
}

async function visitMemberExpression(ctx: Context, init: MemberExpression, functionsToFind: string[]) {
  await visitExpression(ctx, init.object, functionsToFind);
}

async function visitNewExpression(ctx: Context, init: NewExpression, functionsToFind: string[]) {
  await visitExpression(ctx, init.callee, functionsToFind);
}

async function visitSequenceExpression(ctx: Context, init: SequenceExpression, functionsToFind: string[]) {
  for (const item of init.expressions){
    await visitExpression(ctx, item, functionsToFind);
  }
}

async function visitArrowFunctionExpression(ctx: Context, init: ArrowFunctionExpression, functionsToFind: string[]) {
  if(init.body){
    if(init.body.type === "BlockStatement"){
      await visitBlockStatement(ctx, init.body, functionsToFind);
    } else {
      await visitExpression(ctx, init.body, functionsToFind);
    }
  }
}

async function visitMethodProperty(ctx: Context, item: MethodProperty, functionsToFind: string[]) {
  if(item.body){
    await visitBlockStatement(ctx, item.body, functionsToFind);
  }
}

async function visitAssignmentProperty(ctx: Context, item: AssignmentProperty, functionsToFind: string[]) {
  await visitExpression(ctx, item.value, functionsToFind);
}

async function visitKeyValueProperty(ctx: Context, item: KeyValueProperty, functionsToFind: string[]) {
  await visitExpression(ctx, item.value, functionsToFind);
}

async function visitGetterProperty(ctx: Context, item: GetterProperty, functionsToFind: string[]) {
  if(item.body){
    await visitBlockStatement(ctx, item.body, functionsToFind);
  }
}

async function visitSetterProperty(ctx: Context, item: SetterProperty, functionsToFind: string[]) {
  if(item.body){
    await visitBlockStatement(ctx, item.body, functionsToFind);
  }
}

async function visitProperty(ctx: Context, item: Property, functionsToFind: string[]) {
  switch (item.type) {
    case "Identifier":
      break;
    case "KeyValueProperty":
      await visitKeyValueProperty(ctx, item, functionsToFind);
      break;
    case "AssignmentProperty":
      await visitAssignmentProperty(ctx, item, functionsToFind);
      break;
    case "GetterProperty":
      await visitGetterProperty(ctx, item, functionsToFind);
      break;
    case "SetterProperty":
      await visitSetterProperty(ctx, item, functionsToFind);
      break;
    case "MethodProperty":
      await visitMethodProperty(ctx, item, functionsToFind);
      break;
  }
}

async function visitObjectExpression(ctx: Context, expression: ObjectExpression, functionsToFind: string[]) {
  for (const item of expression.properties){
    if(item.type === "SpreadElement"){
      //visitExpression(item, functionsToFind);
    } else {
      await visitProperty(ctx, item, functionsToFind);
    }
  }
}

async function visitVariableDeclaration(ctx: Context, decl: VariableDeclaration, functionsToFind: string[]) {
  for (const item of decl.declarations) {
    if (item.init) {
      switch (item.init.type) {
        case "StringLiteral":
          break;
        case "Identifier":
          break;
        case "ThisExpression":
          break;
        case "ArrayExpression":
          await visitArrayExpression(ctx, item.init, functionsToFind);
          break;
        case "ObjectExpression":
          await visitObjectExpression(ctx, item.init, functionsToFind);
          break;
        case "FunctionExpression":
          await visitFunctionExpression(ctx, item.init, functionsToFind);
          break;
        case "UnaryExpression":
          await visitUnaryExpression(ctx, item.init, functionsToFind);
          break;
        case "UpdateExpression":
          await visitUpdateExpression(ctx, item.init, functionsToFind);
          break;
        case "BinaryExpression":
          await visitBinaryExpression(ctx, item.init, functionsToFind);
          break;
        case "AssignmentExpression":
          await visitAssignmentExpression(ctx, item.init, functionsToFind);
          break;
        case "MemberExpression":
          await visitMemberExpression(ctx, item.init, functionsToFind);
          break;
        case "SuperPropExpression":
          break;
        case "ConditionalExpression":
          await visitConditionalExpression(ctx, item.init, functionsToFind);
          break;
        case "CallExpression":
          await visitCallExpression(ctx, item.init, functionsToFind);
          break;
        case "NewExpression":
          await visitNewExpression(ctx, item.init, functionsToFind);
          break;
        case "SequenceExpression":
          await visitSequenceExpression(ctx, item.init, functionsToFind);
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
          await visitArrowFunctionExpression(ctx, item.init, functionsToFind);
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
  }
}

async function visitWithStatement(ctx: Context, item: WithStatement, functionsToFind: string[]) {
  await visitExpression(ctx, item.object, functionsToFind);
  await visitStatement(ctx, item.body, functionsToFind);
}

async function visitReturnStatement(ctx: Context, stmt: ReturnStatement, functionsToFind: string[]) {
  if(stmt.argument) {
    await visitExpression(ctx, stmt.argument, functionsToFind);
  }
}

async function visitLabeledStatement(ctx: Context, stmt: LabeledStatement, functionsToFind: string[]) {
  await visitStatement(ctx, stmt.body, functionsToFind);
}

async function visitIfStatement(ctx: Context, stmt: IfStatement, functionsToFind: string[]) {
  await visitExpression(ctx, stmt.test, functionsToFind);
  await visitStatement(ctx, stmt.consequent, functionsToFind);
  if(stmt.alternate){
    await visitStatement(ctx, stmt.alternate, functionsToFind);
  }
}

async function visitTryStatement(ctx: Context, stmt: TryStatement, functionsToFind: string[]) {
  await visitBlockStatement(ctx, stmt.block, functionsToFind);
  if(stmt.handler){
    await visitBlockStatement(ctx, stmt.handler.body, functionsToFind);
  }
  if(stmt.finalizer){
    await visitBlockStatement(ctx, stmt.finalizer, functionsToFind);
  }
}

async function visitWhileStatement(ctx: Context, stmt: WhileStatement, functionsToFind: string[]) {
  await visitExpression(ctx, stmt.test, functionsToFind);
  await visitStatement(ctx, stmt.body, functionsToFind);
}

async function visitDoWhileStatement(ctx: Context, stmt: DoWhileStatement, functionsToFind: string[]) {
  await visitExpression(ctx, stmt.test, functionsToFind);
  await visitStatement(ctx, stmt.body, functionsToFind);
}

async function visitForStatement(ctx: Context, stmt: ForStatement, functionsToFind: string[]) {
  if(stmt.init){
    if(stmt.init.type === "VariableDeclaration"){
      await visitVariableDeclaration(ctx, stmt.init, functionsToFind);
    } else {
      await visitExpression(ctx, stmt.init, functionsToFind);
    }
  }
  if(stmt.test){
    await visitExpression(ctx, stmt.test, functionsToFind);
  }
  if(stmt.update){
    await visitExpression(ctx, stmt.update, functionsToFind);
  }
  await visitStatement(ctx, stmt.body, functionsToFind);
}

async function visitPattern(ctx: Context, left: Pattern, functionsToFind: string[]) {
  switch (left.type) {
    case "Invalid":
      break;
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
      break;
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
    case "ArrayPattern":
      break;
    case "RestElement":
      break;
    case "ObjectPattern":
      break;
    case "AssignmentPattern":
      break;

  }
}

async function visitForInStatement(ctx: Context, stmt: ForInStatement, functionsToFind: string[]) {
  if(stmt.left.type === "VariableDeclaration"){
    await visitVariableDeclaration(ctx, stmt.left, functionsToFind);
  } else {
    await visitPattern(ctx, stmt.left, functionsToFind);
  }
  await visitExpression(ctx, stmt.right, functionsToFind);
  await visitStatement(ctx, stmt.body, functionsToFind);
}

async function visitSwitchStatement(ctx: Context, stmt: SwitchStatement, functionsToFind: string[]) {
  await visitExpression(ctx, stmt.discriminant, functionsToFind);
  for (const item of stmt.cases){
    for (const caseItem of item.consequent){
      await visitStatement(ctx, caseItem, functionsToFind);
    }
  }
}

async function visitForOfStatement(ctx: Context, stmt: ForOfStatement, functionsToFind: string[]) {
  if(stmt.left.type === "VariableDeclaration"){
    await visitVariableDeclaration(ctx, stmt.left, functionsToFind);
  } else {
    await visitPattern(ctx, stmt.left, functionsToFind);
  }
  await visitExpression(ctx, stmt.right, functionsToFind);
  await visitStatement(ctx, stmt.body, functionsToFind);
}

async function visitEmptyStatement(ctx: Context, item: EmptyStatement, functionsToFind: string[]) {
  // Do nothing
}

async function visitConstructor(ctx: Context, item: Constructor, functionsToFind: string[]) {
  if(item.body) {
    await visitBlockStatement(ctx, item.body, functionsToFind);
  }
}

async function visitClassMethod(ctx: Context, item: ClassMethod, functionsToFind: string[]) {
  if(item.function.body) {
    await visitBlockStatement(ctx, item.function.body, functionsToFind);
  }
}

async function visitPrivateMethod(ctx: Context, item: PrivateMethod, functionsToFind: string[]) {
  if(item.function.body) {
    await visitBlockStatement(ctx, item.function.body, functionsToFind);
  }
}

async function visitClassProperty(ctx: Context, item: ClassProperty, functionsToFind: string[]) {
  if(item.value){
    await visitExpression(ctx, item.value, functionsToFind);
  }
}

async function visitPrivateProperty(ctx: Context, item: PrivateProperty, functionsToFind: string[]) {
  if(item.value){
    await visitExpression(ctx, item.value, functionsToFind);
  }
}

async function visitTsIndexSignature(ctx: Context, item: TsIndexSignature, functionsToFind: string[]) {
  // Do nothing
}

async function visitStaticBlock(ctx: Context, item: StaticBlock, functionsToFind: string[]) {
  await visitBlockStatement(ctx, item.body, functionsToFind);
}

async function visitClassMember(ctx: Context, body: ClassMember[], functionsToFind: string[]) {
  for (const item of body){
    switch (item.type){
      case "EmptyStatement":
        await visitEmptyStatement(ctx, item, functionsToFind);
        break;
      case "Constructor":
        await visitConstructor(ctx, item, functionsToFind);
        break;
      case "ClassMethod":
        await visitClassMethod(ctx, item, functionsToFind);
        break;
      case "PrivateMethod":
        await visitPrivateMethod(ctx, item, functionsToFind);
        break;
      case "ClassProperty":
        await visitClassProperty(ctx, item, functionsToFind);
        break;
      case "PrivateProperty":
        await visitPrivateProperty(ctx, item, functionsToFind);
        break;
      case "TsIndexSignature":
        await visitTsIndexSignature(ctx, item, functionsToFind);
        break;
      case "StaticBlock":
        await visitStaticBlock(ctx, item, functionsToFind);
        break;
    }
  }
}

async function visitClassDeclaration(ctx: Context, stmt: ClassDeclaration, functionsToFind: string[]) {
  await visitClassMember(ctx, stmt.body, functionsToFind);
}

async function visitStatement(ctx: Context, stmt: Statement, functionsToFind: string[]){
  switch (stmt.type) {
    case "ExpressionStatement":
      await visitExpressionStatement(ctx, stmt, functionsToFind);
      break;
    case "FunctionDeclaration":
      await visitFunctionDeclaration(ctx, stmt, functionsToFind);
      break;
    case "VariableDeclaration":
      await visitVariableDeclaration(ctx, stmt, functionsToFind);
      break;
    case "TsInterfaceDeclaration":
      break;
    case "TsTypeAliasDeclaration":
      break;
    case "TsEnumDeclaration":
      break;
    case "TsModuleDeclaration":
      break;
    case "BlockStatement":
      await visitBlockStatement(ctx, stmt, functionsToFind);
      break;
    case "EmptyStatement":
      break;
    case "DebuggerStatement":
      break;
    case "WithStatement":
      await visitWithStatement(ctx, stmt, functionsToFind);
      break;
    case "ReturnStatement":
      await visitReturnStatement(ctx, stmt, functionsToFind);
      break;
    case "LabeledStatement":
      await visitLabeledStatement(ctx, stmt, functionsToFind);
      break;
    case "BreakStatement":
      break;
    case "ContinueStatement":
      break;
    case "IfStatement":
      await visitIfStatement(ctx, stmt, functionsToFind);
      break;
    case "SwitchStatement":
      await visitSwitchStatement(ctx, stmt, functionsToFind);
      break;
    case "ThrowStatement":
      break;
    case "TryStatement":
      await visitTryStatement(ctx, stmt, functionsToFind);
      break;
    case "WhileStatement":
      await visitWhileStatement(ctx, stmt, functionsToFind);
      break;
    case "DoWhileStatement":
      await visitDoWhileStatement(ctx, stmt, functionsToFind);
      break;
    case "ForStatement":
      await visitForStatement(ctx, stmt, functionsToFind);
      break;
    case "ForInStatement":
      await visitForInStatement(ctx, stmt, functionsToFind);
      break;
    case "ForOfStatement":
      await visitForOfStatement(ctx, stmt, functionsToFind);
      break;
    case "ClassDeclaration":
      await visitClassDeclaration(ctx, stmt, functionsToFind);
      break;
  }
}

async function visitBlockStatement(ctx: Context, stmt: BlockStatement, functionsToFind: string[]) {
  for (const item of stmt.stmts) {
    await visitStatement(ctx, item, functionsToFind);
  }
}

async function visitFunctionDeclaration(ctx: Context, item: FunctionDeclaration, functionsToFind: string[]) {
  if(item.body) {
  await visitBlockStatement(ctx, item.body, functionsToFind);
    }
}

async function visitThrowStatement(ctx: Context, item: ThrowStatement, functionsToFind: string[]) {
  await visitExpression(ctx, item.argument, functionsToFind);
}

async function visitExportDeclaration(ctx: Context, item: ExportDeclaration, functionsToFind: string[]) {
  if(item.declaration){
    await visitStatement(ctx, item.declaration, functionsToFind);
  }
}


async function visitExportDefaultExpression(ctx: Context, item: ExportDefaultExpression, functionsToFind: string[]) {
  await visitExpression(ctx, item.expression, functionsToFind);
}

async function findSwcTypiaUsage(ctx: Context, result: Module, functionsToFind: string[]) {
  for (const item of result.body) {
    switch (item.type) {
      case "ImportDeclaration":
        break;
      case "ExportDeclaration":
        await visitExportDeclaration(ctx, item, functionsToFind);
        break;
      case "ExportNamedDeclaration":
        break;
      case "ExportDefaultDeclaration":
        break;
      case "ExportDefaultExpression":
        await visitExportDefaultExpression(ctx, item, functionsToFind);
        break;
      case "ExportAllDeclaration":
        break;
      case "TsImportEqualsDeclaration":
        break;
      case "TsExportAssignment":
        break;
      case "TsNamespaceExportDeclaration":
        break;
      case "ExpressionStatement":
        await visitExpressionStatement(ctx, item, functionsToFind);
        break;
      case "FunctionDeclaration":
        await visitFunctionDeclaration(ctx, item, functionsToFind);
        break;
      case "VariableDeclaration":
        await visitVariableDeclaration(ctx, item, functionsToFind);
        break;
      case "TsInterfaceDeclaration":
        break;
      case "TsTypeAliasDeclaration":
        break;
      case "TsEnumDeclaration":
        break;
      case "TsModuleDeclaration":
        break;
      case "BlockStatement":
        await visitBlockStatement(ctx, item, functionsToFind);
        break;
      case "EmptyStatement":
        await visitEmptyStatement(ctx, item, functionsToFind);
        break;
      case "DebuggerStatement":
        break;
      case "WithStatement":
        await visitWithStatement(ctx, item, functionsToFind);
        break;
      case "ReturnStatement":
        await visitReturnStatement(ctx, item, functionsToFind);
        break;
      case "LabeledStatement":
        break;
      case "BreakStatement":
        break;
      case "ContinueStatement":
        break;
      case "IfStatement":
        await visitIfStatement(ctx, item, functionsToFind);
        break;
      case "SwitchStatement":
        await visitSwitchStatement(ctx, item, functionsToFind);
        break;
      case "ThrowStatement":
        await visitThrowStatement(ctx, item, functionsToFind);
        break;
      case "TryStatement":
        await visitTryStatement(ctx, item, functionsToFind);
        break;
      case "WhileStatement":
        await visitWhileStatement(ctx, item, functionsToFind);
        break;
      case "DoWhileStatement":
        await visitDoWhileStatement(ctx, item, functionsToFind);
        break;
      case "ForStatement":
        await visitForStatement(ctx, item, functionsToFind);
        break;
      case "ForInStatement":
        await visitForInStatement(ctx, item, functionsToFind);
        break;
      case "ForOfStatement":
        await visitForOfStatement(ctx, item, functionsToFind);
        break;
      case "ClassDeclaration":
        await visitClassDeclaration(ctx, item, functionsToFind);
        break;
    }
  }
}