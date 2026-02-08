/**
 * Playground Templates
 *
 * Default starter files per language.
 */

import type { PlaygroundFile, PlaygroundLanguage, PlaygroundWorkspace } from '../types/playground';

const jsTemplate = `// JavaScript Playground\n\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));\n`;

const tsTemplate = `// TypeScript Playground\n\ninterface User {\n  id: number;\n  name: string;\n}\n\nconst user: User = { id: 1, name: 'Ahmad' };\n\nconsole.log(user);\n`;

const pyTemplate = `# Python Playground\n\nfrom math import sqrt\n\nprint('Hello from Python!')\nprint('sqrt(16) =', sqrt(16))\n`;

const templates: Record<PlaygroundLanguage, PlaygroundFile[]> = {
  javascript: [
    {
      id: 'file-js-1',
      name: 'main.js',
      language: 'javascript',
      content: jsTemplate,
    },
  ],
  typescript: [
    {
      id: 'file-ts-1',
      name: 'main.ts',
      language: 'typescript',
      content: tsTemplate,
    },
  ],
  python: [
    {
      id: 'file-py-1',
      name: 'main.py',
      language: 'python',
      content: pyTemplate,
    },
  ],
};

export function getDefaultWorkspace(language: PlaygroundLanguage): PlaygroundWorkspace {
  const files = templates[language].map((file) => ({ ...file }));
  return {
    files,
    activeFileId: files[0].id,
    activeLanguage: language,
  };
}
