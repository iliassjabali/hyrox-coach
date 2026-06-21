// Shared flat ESLint config enforcing the hexagonal dependency rule.
//   domain/      -> imports nothing but domain (no application, no infra, no libs)
//   application/ -> imports domain only (no infra, no framework libs)
//   infrastructure/ -> anything goes
import tseslint from 'typescript-eslint';

const FRAMEWORK_LIBS = [
  'drizzle-orm', 'drizzle-orm/*',
  '@anthropic-ai/*', 'ai', '@ai-sdk/*',
  'next', 'next/*', '@trpc/*', 'react', 'zod',
];

const restrict = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

export default tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
  },
  {
    files: ['**/domain/**/*.ts'],
    rules: restrict([
      { group: ['**/application/**', '**/infrastructure/**'],
        message: 'domain/ must not import application or infrastructure' },
      ...FRAMEWORK_LIBS.map((g) => ({ group: [g],
        message: 'domain/ must stay pure — no framework/library imports' })),
    ]),
  },
  {
    files: ['**/application/**/*.ts'],
    rules: restrict([
      { group: ['**/infrastructure/**'],
        message: 'application/ must not import infrastructure — depend on a port' },
      ...FRAMEWORK_LIBS.map((g) => ({ group: [g],
        message: 'application/ must not import framework/library code — define a port' })),
    ]),
  },
);
