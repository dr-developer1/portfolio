"""Run: blender --background --factory-startup --python scripts/blender/create_santa_hat.py

Exports the editable .blend and an interleaved, little-endian float32 triangle
stream (position XYZ, normal XYZ, linear RGB, bone index, bone fraction) for the small WebGL hat renderer.
"""
import array
import math
import random
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
random.seed(12)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, roughness=0.7):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    return mat


red = material('Cranberry velvet', (0.65, 0.016, 0.045))
cream = material('Warm ivory fur', (0.94, 0.86, 0.69))
gold = material('Golden stitching', (0.95, 0.55, 0.12), 0.35)
green = material('Holly green', (0.025, 0.23, 0.09))
berry = material('Bright holly berries', (0.92, 0.025, 0.035), 0.28)


def finish(obj, mat):
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def sphere(name, position, scale, mat, segments=12, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=position)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    return finish(obj, mat)


# The cap leans right, with a soft tip hanging below the tilted, fixed collar.
centers = [
    (0, .06, .90, .49), (.12, .30, .82, .46),
    (.30, .55, .68, .40), (.54, .72, .54, .34),
    (.82, .80, .42, .28), (1.08, .73, .31, .22),
    (1.27, .55, .23, .17), (1.38, .30, .16, .12),
    (1.42, .05, .10, .08), (1.42, -.16, .05, .05),
]
rig = [(0, .06), (.30, .55), (.82, .80), (1.27, .55), (1.42, .05), (1.42, -.34)]
vertices = []
segments = 40
for ring, (cx, cy, rx, rz) in enumerate(centers):
    prev = centers[max(ring - 1, 0)]
    following = centers[min(ring + 1, len(centers) - 1)]
    tangent = Vector((following[0]-prev[0], following[1]-prev[1], 0)).normalized()
    tilt = math.atan2(tangent.x, tangent.y) * min(1, ring / 4)
    side = Vector((math.cos(tilt), -math.sin(tilt), 0))
    for step in range(segments):
        theta = step / segments * 2 * math.pi
        fold = 1 + 0.027 * math.sin(theta * 7 + ring * .55)
        point = Vector((cx, cy, 0)) + side * (math.cos(theta) * rx * fold)
        point.z = math.sin(theta) * rz * fold
        vertices.append(point)
faces = []
for ring in range(len(centers)-1):
    for step in range(segments):
        a = ring * segments + step
        b = ring * segments + (step + 1) % segments
        faces.append((a, a+segments, b+segments, b))
mesh = bpy.data.meshes.new('Folded velvet mesh')
mesh.from_pydata(vertices, [], faces)
mesh.update()
parameter = mesh.attributes.new('hat_parameter', 'FLOAT', 'POINT')
for index, value in enumerate(parameter.data):
    value.value = (index // segments) * .5
obj = bpy.data.objects.new('Soft bent hat', mesh)
bpy.context.collection.objects.link(obj)
finish(obj, red)
modifier = obj.modifiers.new('Smooth fabric folds', 'SUBSURF')
modifier.levels = 2

# Overlapping tufts make the brim rounded and tactile from every angle.
for i in range(42):
    angle = i / 42 * math.tau
    sphere('Fur brim tuft', (math.cos(angle)*.91, .05 + .018*math.sin(angle*5), math.sin(angle)*.49),
           (.14, .16 + random.random()*.025, .14), cream)
for i in range(34):
    theta = random.random() * math.tau
    z = random.uniform(-1, 1)
    r = math.sqrt(1-z*z)
    sphere('Pom-pom tuft', (1.42 + r*math.cos(theta)*.18, -.34+z*.19, r*math.sin(theta)*.18),
           (.095, .095, .095), cream, 10, 6)
sphere('Pom-pom core', (1.42, -.34, 0), (.20, .21, .20), cream)

# Small golden stitches sit on the front, above the fur.
for i in range(25):
    angle = math.pi * .08 + i / 24 * math.pi * .84
    sphere('Gold stitch', (.88*math.cos(angle), .25, .485*math.sin(angle)), (.016, .027, .015), gold, 8, 4)
for x, rotation in [(.56, -.55), (.72, .50)]:
    leaf = sphere('Holly leaf', (x, .35, .43), (.065, .16, .025), green)
    leaf.rotation_euler.z = rotation
for x, y in [(.59,.27),(.68,.26),(.64,.34)]:
    sphere('Holly berry', (x, y, .49), (.055,.055,.055), berry)

# Clockwise tilt is baked into both the mesh and rig, keeping the collar fixed.
from mathutils import Matrix
bpy.context.view_layer.update()
rotation = Matrix.Rotation(-.28, 4, 'Z')
for part in bpy.context.scene.objects:
    part.matrix_world = rotation @ part.matrix_world
rig = [rotation @ Vector((x, y, 0)) for x, y in rig]

bpy.context.scene.world.color = (.15, .15, .15)
blend_path = ROOT / 'docs/models/santa-hat.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

# Evaluate subdivision and bake object transforms/normals for a static GPU buffer.
depsgraph = bpy.context.evaluated_depsgraph_get()
stream = array.array('f', [2026, 2, len(rig), *[v for p in rig for v in (p.x, p.y)]])
for obj in bpy.context.scene.objects:
    if obj.type != 'MESH':
        continue
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    normal_matrix = obj.matrix_world.to_3x3().inverted().transposed()
    color = obj.data.materials[0].diffuse_color[:3]
    for tri in mesh.loop_triangles:
        for loop_index in tri.loops:
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index]
            position = obj.matrix_world @ vertex.co
            normal = (normal_matrix @ vertex.normal).normalized()
            bone, fraction = -1, 0
            if obj.name == 'Soft bent hat':
                parameter = mesh.attributes['hat_parameter'].data[vertex.index].value
                if parameter > 1:
                    bone = min(4, int(parameter))
                    fraction = parameter - bone
            elif obj.name.startswith('Pom-pom'):
                bone, fraction = 4, 1
            stream.extend((*position, *normal, *color, bone, fraction))
    evaluated.to_mesh_clear()
if __import__('sys').byteorder != 'little':
    stream.byteswap()
asset_path = ROOT / 'public/models/santa-hat.bin'
with asset_path.open('wb') as target:
    stream.tofile(target)
print(f'Exported {(len(stream)-15)//11} rigged vertices, {asset_path.stat().st_size} bytes')
