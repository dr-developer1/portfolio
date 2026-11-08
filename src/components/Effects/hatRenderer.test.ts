import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseHatModel, projectHatPoint, unprojectHatPoint } from './hatRenderer';

const bytes = readFileSync('public/models/santa-hat.bin');
const model = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

describe('hat asset boundary', () => {
  it('validates the committed Blender export', () => {
    const parsed = parseHatModel(model)!;
    expect(parsed).not.toBeNull();
    expect(parsed.rest).toHaveLength(6);
    expect(parsed.vertices.length / 33).toBeGreaterThan(0);
  });
  it.each([new ArrayBuffer(0), new ArrayBuffer(61), model.slice(0, 60), model.slice(0, -4)])(
    'rejects truncated and misaligned data without throwing',
    (data) => {
      expect(parseHatModel(data)).toBeNull();
    }
  );
  it.each([
    [0, 0],
    [16, NaN],
    [24, 5],
    [25, 2],
    [18, 0],
  ])(
    'rejects invalid headers, nonfinite coordinates, rig indices/fractions, and zero normals (%i)',
    (offset, value) => {
      const content = new Float32Array(model.slice(0));
      content[offset] = value;
      if (offset === 18) content.fill(0, 18, 21);
      expect(parseHatModel(content.buffer)).toBeNull();
    }
  );
  it('maps pointer coordinates back to model space at phone and desktop sizes', () => {
    for (const [width, height] of [
      [128, 96],
      [240, 180],
    ]) {
      const point = { x: 1.2, y: -0.6 };
      const result = unprojectHatPoint(projectHatPoint(point, width, height), width, height);
      expect(result.x).toBeCloseTo(point.x);
      expect(result.y).toBeCloseTo(point.y);
    }
  });
});
