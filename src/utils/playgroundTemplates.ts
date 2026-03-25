/**
 * Playground Templates
 *
 * Default starter files per language.
 */

import type {
  PlaygroundFile,
  PlaygroundLanguage,
  PlaygroundPresetId,
  PlaygroundWorkspace,
} from '../types/playground';

const jsTemplate = `// JavaScript Playground\n\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));\n`;

const tsTemplate = `// TypeScript Playground\n\ninterface User {\n  id: number;\n  name: string;\n}\n\nconst user: User = { id: 1, name: 'Ahmad' };\n\nconsole.log(user);\n`;

const pyTemplate = `# Python Playground\n\nfrom math import sqrt\n\nprint('Hello from Python!')\nprint('sqrt(16) =', sqrt(16))\n`;

const demoTemplate = `// Demo preset: small product-oriented transformation\n\nconst applicants = [\n  { name: 'Sara', score: 91 },\n  { name: 'Leo', score: 76 },\n  { name: 'Nina', score: 88 },\n];\n\nconst shortlist = applicants\n  .filter((candidate) => candidate.score >= 85)\n  .map((candidate) => candidate.name);\n\nconsole.log('Shortlist:', shortlist.join(', '));\n`;

const algorithmTemplate = `// Challenge: find the first non-repeating character\n\nfunction firstUniqueChar(input) {\n  const counts = new Map();\n\n  for (const char of input) {\n    counts.set(char, (counts.get(char) ?? 0) + 1);\n  }\n\n  for (const char of input) {\n    if (counts.get(char) === 1) {\n      return char;\n    }\n  }\n\n  return null;\n}\n\nconsole.log(firstUniqueChar('swiss'));\n`;

const debuggingTemplate = `// Challenge: fix the subtle bug\n\nfunction calculateTotal(items) {\n  return items.reduce((sum, item) => {\n    sum + item.price * item.quantity;\n  }, 0);\n}\n\nconst cart = [\n  { price: 25, quantity: 2 },\n  { price: 10, quantity: 1 },\n];\n\nconsole.log('Total should be 60 =>', calculateTotal(cart));\n`;

const typingTemplate = `// TypeScript challenge: make the types safer\n\ntype ApiUser = {\n  id: number;\n  name: string;\n  skills?: string[];\n};\n\nfunction formatUser(user: ApiUser) {\n  return \`\${user.name} (\${user.skills.length} skills)\`;\n}\n\nconsole.log(formatUser({ id: 1, name: 'Ahmad' }));\n`;

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

function buildWorkspace(
  language: PlaygroundLanguage,
  files: PlaygroundFile[],
  preset: PlaygroundPresetId
): PlaygroundWorkspace {
  return {
    files,
    activeFileId: files[0].id,
    activeLanguage: language,
    preset,
  };
}

export function getDefaultWorkspace(language: PlaygroundLanguage): PlaygroundWorkspace {
  const files = templates[language].map((file) => ({ ...file }));
  return buildWorkspace(language, files, 'default');
}

export function getPlaygroundWorkspace(
  preset: PlaygroundPresetId,
  language: PlaygroundLanguage = 'javascript'
): PlaygroundWorkspace {
  if (preset === 'default') {
    return getDefaultWorkspace(language);
  }

  const fileMap: Record<Exclude<PlaygroundPresetId, 'default'>, PlaygroundFile> = {
    demo: {
      id: 'preset-demo-1',
      name: 'demo.js',
      language: 'javascript',
      content: demoTemplate,
    },
    algorithm: {
      id: 'preset-algorithm-1',
      name: 'algorithm.js',
      language: 'javascript',
      content: algorithmTemplate,
    },
    debugging: {
      id: 'preset-debugging-1',
      name: 'debugging.js',
      language: 'javascript',
      content: debuggingTemplate,
    },
    typing: {
      id: 'preset-typing-1',
      name: 'typing.ts',
      language: 'typescript',
      content: typingTemplate,
    },
  };

  const file = fileMap[preset];
  return buildWorkspace(file.language, [{ ...file }], preset);
}
