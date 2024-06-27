// Define valid constraints for each type
const swcTypiaConstraintFunctions = {
  string: {
    minLength: (value: string, constraint: number) => value.length >= constraint,
    maxLength: (value: string, constraint: number) => value.length <= constraint
  },
  number: {
    min: (value: number, constraint: number) => value >= constraint,
    max: (value: number, constraint: number) => value <= constraint
  },
  array: {
    minLength: (value: any[], constraint: number) => value.length >= constraint,
    maxLength: (value: any[], constraint: number) => value.length <= constraint,
  }
} as const;

// Type-safe constraints
type StringConstraints = {
  [K in keyof typeof swcTypiaConstraintFunctions.string]?: Parameters<typeof swcTypiaConstraintFunctions.string[K]>[1];
};

type NumberConstraints = {
  [K in keyof typeof swcTypiaConstraintFunctions.number]?: Parameters<typeof swcTypiaConstraintFunctions.number[K]>[1];
};

type ArrayConstraints = {
  [K in keyof typeof swcTypiaConstraintFunctions.array]?: Parameters<typeof swcTypiaConstraintFunctions.array[K]>[1];
};

// Define ASTNode with type-safe constraints
export type ASTNode =
  | { type: 'string', constraints?: StringConstraints }
  | { type: 'number', constraints?: NumberConstraints }
  | { type: 'boolean' }
  | { type: 'array', elementType: ASTNode, constraints?: ArrayConstraints }
  | { type: 'object', properties: { [key: string]: ASTNode } }
  | { type: 'union', types: ASTNode[] }
  | { type: 'literal', value: string | number | boolean }
  | { type: 'tuple', types: ASTNode[] };

export function generateValidationCode(ast: ASTNode, variableName: string = 'value'): string {
  switch (ast.type) {
    case 'string':
    case 'number':
      return `${generateTypeValidation(ast.type, ast.constraints, variableName)}\n`;
    case 'boolean':
      return `${generateBooleanValidation(variableName)}\n`;
    case 'array':
      return `${generateArrayValidation(ast.elementType, ast.constraints, variableName)}\n`;
    case 'object':
      return `${generateObjectValidation(ast.properties, variableName)}\n`;
    case 'union':
      return `${generateUnionValidation(ast.types, variableName)}\n`;
    case 'literal':
      return `${generateLiteralValidation(ast.value, variableName)}\n`;
    default:
      throw new Error(`Unsupported AST node type: ${(ast as any).type}`);
  }
}

function generateTypeValidation(type: 'string' | 'number', constraints: { [key: string]: any } = {}, variableName: string): string {
  let code = `typeof ${variableName} === '${type}'`;
  if (constraints && swcTypiaConstraintFunctions[type]) {
    for (const [key, value] of Object.entries(constraints)) {
      if (swcTypiaConstraintFunctions[type][key as keyof typeof swcTypiaConstraintFunctions[typeof type]]) {
        code += ` && constraintFunctions['${type}']['${key}'](${variableName}, ${JSON.stringify(value)})`;
      }
    }
  }
  return code;
}

function generateBooleanValidation(variableName: string): string {
  return `typeof ${variableName} === 'boolean'`;
}

function generateArrayValidation(elementType: ASTNode, constraints: { [key: string]: any } = {}, variableName: string): string {
  let code = `Array.isArray(${variableName})`;
  if (constraints && swcTypiaConstraintFunctions['array']) {
    for (const [key, value] of Object.entries(constraints)) {
      if (swcTypiaConstraintFunctions['array'][key as keyof typeof swcTypiaConstraintFunctions.array]){
        code += ` && constraintFunctions['array']['${key}'](${variableName}, ${JSON.stringify(value)})`;
      }
    }
  }
  code += ` && ${variableName}.every(element => ${generateValidationCode(elementType, 'element')})`;
  return code;
}

function generateObjectValidation(properties: { [key: string]: ASTNode }, variableName: string): string {
  let code = `typeof ${variableName} === 'object' && ${variableName} !== null`;
  for (const [key, value] of Object.entries(properties)) {
    code += ` && ${generateValidationCode(value, `${variableName}['${key}']`)}`;
  }
  return code;
}

function generateUnionValidation(types: ASTNode[], variableName: string): string {
  const typeChecks = types.map(type => `(${generateValidationCode(type, variableName)})`);
  return typeChecks.join(' || ');
}

function generateLiteralValidation(value: string | number | boolean, variableName: string): string {
  return `${variableName} === ${JSON.stringify(value)}`;
}

// Example AST for a person schema with generic constraints
const personSchema: ASTNode = {
  type: 'union',
  types: [
    {
      type: 'object',
      properties: {
        name: {type: 'string', constraints: {minLength: 1, maxLength: 50}},
        age: {type: 'number', constraints: {min: 0, max: 120}},
        isStudent: {type: 'boolean'},
        hobbies: {
          type: 'array',
          elementType: {type: 'string'},
          constraints: {minLength: 1, maxLength: 10}
        }
      }
    },
    {
      type: 'string',
      constraints: {minLength: 50, maxLength: 100}
    }]
};

const validationCode = generateValidationCode(personSchema);
console.log(`function validate(value: unknown): boolean {
  return ${validationCode};
}`);