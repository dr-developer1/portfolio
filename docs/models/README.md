# Christmas hat

`santa-hat.blend` is the editable Blender source, built by
`scripts/blender/create_santa_hat.py` (Blender 5.2). Regenerate from the project root:

```sh
blender --background --factory-startup --python scripts/blender/create_santa_hat.py
```

The script also writes `public/models/santa-hat.bin`. Its little-endian float32
header contains the signature `2026`, format version `2`, joint count `6`, and six
rest positions (XY). The remaining values are unindexed triangles with eleven
values per vertex: world position XYZ, smooth normal XYZ, linear RGB, segment
index, and segment fraction. A negative segment index fixes a vertex to the
collar. The fabric parameters survive Blender subdivision, so cross-sections
bend together; the pom-pom uses the last joint as a rigid tufted ball.

`hatRenderer.ts` skins the model directly with WebGL. `hatPhysics.ts` keeps the
first two joints fixed, solves dragging with constant section lengths, and
integrates the four upper sections as gravity-loaded, damped torsional joints.
Fabric stiffness is preloaded to support the right-hanging resting pose. Release
retains recent drag momentum; pausing while holding discards stale momentum.
`SantaHat.tsx` owns pointer capture and keyboard activation. No runtime Blender
dependency or third-party 3D package is needed.

When WebGL or the model is unavailable, a small inline illustration remains.
Reduced motion allows direct manipulation and returns to rest immediately.
