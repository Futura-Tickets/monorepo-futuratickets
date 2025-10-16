# Linting & Formatting Setup - FuturaTickets

Esta guía explica cómo configurar y usar ESLint y Prettier en el monorepo de FuturaTickets.

## Archivos de Configuración

El monorepo incluye configuraciones compartidas en el root:

- **`.prettierrc.json`** - Configuración de Prettier
- **`.prettierignore`** - Archivos ignorados por Prettier
- **`.eslintrc.base.json`** - Configuración base de ESLint
- **`.editorconfig`** - Configuración de editor (compatible con VSCode, IntelliJ, etc.)

## Configuración por Proyecto

Cada proyecto puede extender la configuración base y añadir reglas específicas.

### Backend API (NestJS)

Crear/actualizar `.eslintrc.json` en `futura-tickets-admin-api/`:

```json
{
  "extends": ["../.eslintrc.base.json"],
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": "."
  },
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Frontend (Next.js)

Crear/actualizar `.eslintrc.json` en `futura-tickets-admin/` y `futura-market-place-v2/`:

```json
{
  "extends": [
    "../.eslintrc.base.json",
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": ".",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ]
  }
}
```

## Instalación de Dependencias

### Root (Opcional - para scripts globales)

```bash
npm install -D \
  eslint \
  prettier \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### Backend API

```bash
cd futura-tickets-admin-api

npm install -D \
  eslint \
  prettier \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### Frontend

```bash
cd futura-tickets-admin  # o futura-market-place-v2

npm install -D \
  eslint \
  prettier \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier \
  eslint-plugin-prettier \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-config-next
```

## Scripts de Package.json

Añade estos scripts a cada `package.json` de los proyectos:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit"
  }
}
```

## Uso

### Formatear código

```bash
# Formatear todo el proyecto
npm run format

# Verificar formateo sin modificar
npm run format:check

# Formatear archivo específico
npx prettier --write src/main.ts
```

### Lint código

```bash
# Analizar errores
npm run lint

# Analizar y auto-fix
npm run lint:fix

# Lint archivo específico
npx eslint src/main.ts --fix
```

### Type checking

```bash
# Verificar tipos de TypeScript
npm run type-check
```

## Integración con VSCode

### Instalar Extensiones

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **EditorConfig** - `editorconfig.editorconfig`

### Configuración de VSCode

Crear/actualizar `.vscode/settings.json` en el root:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "[markdown]": {
    "files.trimTrailingWhitespace": false
  }
}
```

### Extensiones Recomendadas

Crear `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## Pre-commit Hooks (Opcional)

Para asegurar que el código sigue las reglas antes de commit, puedes usar Husky.

### Instalación

```bash
# En el root del monorepo
npm install -D husky lint-staged

# Inicializar husky
npx husky install

# Crear pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### Configuración de lint-staged

Añadir al `package.json` del root:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

## Reglas de Prettier

### Configuración Actual

```json
{
  "semi": true,                    // Punto y coma al final
  "trailingComma": "all",         // Coma al final en objetos/arrays
  "singleQuote": true,            // Comillas simples
  "printWidth": 100,              // Máximo 100 caracteres por línea
  "tabWidth": 2,                  // 2 espacios de indentación
  "useTabs": false,               // Usar espacios, no tabs
  "arrowParens": "avoid",         // Sin paréntesis en arrow functions con 1 param
  "endOfLine": "lf"               // Line endings Unix (LF)
}
```

### Ejemplos

**Antes:**
```typescript
const greet = (name) => {
    return "Hello " + name
}
```

**Después:**
```typescript
const greet = name => {
  return `Hello ${name}`;
};
```

## Reglas de ESLint

### Reglas Principales

- **No usar `var`**: Usar `const` o `let`
- **Preferir `const`**: Usar `const` por defecto
- **Template strings**: Preferir template literals sobre concatenación
- **Arrow functions**: Preferir arrow functions en callbacks
- **Unused vars**: Error si hay variables no usadas
- **No console**: Warning (excepto `console.warn`, `console.error`, `console.info`)
- **Semicolons**: Requeridos
- **Quotes**: Single quotes por defecto

### Ejemplos

**❌ Mal:**
```typescript
var name = "John";  // No usar var
let age = 30;       // No modificado, debería ser const
console.log(name);  // Evitar console.log

function greet(name, unused) {  // 'unused' no se usa
  return "Hello, " + name;      // Usar template string
}
```

**✅ Bien:**
```typescript
const name = 'John';
const age = 30;
console.info(name);  // OK: info/warn/error permitidos

const greet = (name: string) => {
  return `Hello, ${name}`;
};

// O con parámetros no usados:
const greet = (name: string, _unused: string) => {
  return `Hello, ${name}`;
};
```

## Ignorar Archivos

### Global (.prettierignore)

```
node_modules
dist
build
.next
*.generated.*
```

### Inline

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();

// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];
```

## Troubleshooting

### ESLint y Prettier en conflicto

**Problema**: ESLint formatea de una manera y Prettier de otra.

**Solución**: Asegúrate de tener `eslint-config-prettier` instalado y como última configuración en `extends`:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"  // ← Debe ser el último
  ]
}
```

### VSCode no formatea automáticamente

**Problema**: Al guardar, el código no se formatea.

**Solución**:
1. Verifica que Prettier esté instalado: `Cmd+Shift+P` → "Format Document With..." → Prettier
2. Revisa `.vscode/settings.json` tenga `"editor.formatOnSave": true`
3. Reinstala extensión de Prettier

### Errores de parseo en archivos .tsx

**Problema**: ESLint no reconoce JSX en archivos TypeScript.

**Solución**: Asegúrate de tener:

```json
{
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
```

### Linter muy lento

**Problema**: ESLint tarda mucho en ejecutarse.

**Soluciones**:
1. Añade más archivos a `.eslintignore`
2. Usa `--cache` flag: `eslint --cache .`
3. Limita archivos: `eslint src/ --ext .ts`

## Best Practices

### 1. Ejecutar antes de commits

Siempre ejecuta lint y format antes de hacer commit:

```bash
npm run lint:fix && npm run format
```

### 2. Fix automático en IDE

Configura tu IDE para auto-fix al guardar.

### 3. CI/CD checks

Añade checks en CI:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: npm run lint
- name: Format check
  run: npm run format:check
```

### 4. Configuración incremental

No intentes arreglar todo el codebase de una vez. Añade reglas gradualmente:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn"  // ← Start with warn
  }
}
```

Luego cambia a `"error"` cuando estés listo.

### 5. Team agreement

Documenta las decisiones del equipo sobre reglas controversiales (tabs vs spaces, trailing commas, etc.) en este archivo.

## Referencias

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [EditorConfig](https://editorconfig.org/)

---

**Nota**: Esta configuración es una base. Cada proyecto puede ajustar las reglas según sus necesidades específicas.
