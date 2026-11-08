# Santa hat model

## Source and generation

- `docs/models/santa-hat.blend`: editable Blender source.
- `scripts/blender/create_santa_hat.py`: procedural scene generator and binary exporter.
- `public/models/santa-hat.bin`: runtime WebGL asset.

Use Blender 5.2 and run from the repository root:

```sh
blender --background --factory-startup --python scripts/blender/create_santa_hat.py
```

This regenerates both the `.blend` and `.bin`, overwriting their existing
contents. The generator builds the scene procedurally; it does not export manual
edits from the existing `.blend`. Maintain procedural changes in the script.
To compare an export first, use a disposable checkout with the same directory
structure and both output directories present.

## Binary format

The stream is little-endian float32. Its header contains signature `2026`, format
version `2`, joint count `6`, then six rest positions as XY pairs. Remaining data
contains unindexed triangles with eleven values per vertex:

1. World position XYZ.
2. Smooth normal XYZ.
3. Linear RGB.
4. Segment index and segment fraction.

A negative segment index anchors a vertex to the collar. Fabric parameters survive
Blender subdivision so cross-sections bend together. The pom-pom follows the last
joint as a rigid tufted ball.

## Runtime and validation

`src/components/Effects/hatRenderer.ts` validates the header, stream length,
complete triangles, finite vertex data, normals, and rig parameters before GPU
upload. It skins the model directly with WebGL and recreates resources after
context recovery. No runtime Blender or third-party 3D library is needed.

`hatPhysics.ts` fixes the first two joints, preserves fabric section lengths
while dragging, and integrates four upper sections with gravity, stiffness, and
damping. Release retains recent drag momentum; a pause discards stale momentum.
`SantaHat.tsx` owns pointer capture, keyboard activation, reduced motion, and the
illustration fallback.

Triangle/vertex ordering can vary between Blender exports. Compare geometry and
rig values as well as file hashes. Before replacing a model, check the brim,
pom-pom, lighting, fixed collar, and bending at desktop and mobile sizes. Run the
unit and browser checks documented in [the project README](../../README.md).
