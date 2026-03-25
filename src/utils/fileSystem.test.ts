import { describe, expect, it } from 'vitest';

import { getNode, resolvePath } from './fileSystem';

describe('fileSystem', () => {
  it('resolves home-relative paths', () => {
    expect(resolvePath('~', '~/projects', 'visitor')).toBe('/home/visitor/projects');
  });

  it('returns known virtual nodes', () => {
    expect(getNode('/home/visitor/projects')).not.toBeNull();
  });
});
