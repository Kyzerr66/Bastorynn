"""Organize the editable library and render a Blender studio preview."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
library=next(s for s in bpy.data.scenes if s.name.startswith('Bastorynn'))
bpy.context.window.scene=library
catalog=json.loads((ROOT/'conception-3d/catalog.json').read_text('utf8'))
families=list(catalog['families'])
def rgb(h):
    return tuple((v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4) for v in [int(h[i:i+2],16)/255 for i in [1,3,5]])
for family,f in catalog['families'].items():
    mat=bpy.data.materials.new('Element / '+family);mat.use_nodes=True;mat.diffuse_color=(*rgb(f['c']),1)
    bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=mat.diffuse_color;bs.inputs['Roughness'].default_value=.6
    for ob in library.objects:
        if ob.name.startswith(family+'/') and ob.type=='MESH' and len(ob.data.materials)>4:ob.data.materials[4]=mat
groups={}
for ob in list(library.objects):
    cat='02 Unites' if ob.name.startswith('unite/') else '03 Decors' if ob.name.startswith('decor/') else '01 Defenses'
    if cat not in groups:
        groups[cat]=bpy.data.collections.new(cat);library.collection.children.link(groups[cat])
    for coll in list(ob.users_collection):coll.objects.unlink(ob)
    groups[cat].objects.link(ob)
    ob['source']='Bastorynn Citadelles / Blender 5.2';ob['game_axis']='Y-up, facing +X';ob['part']=ob.name.split('/')[-1]
scene=bpy.data.scenes.new('Citadelles · Studio');bpy.context.window.scene=scene
for name,x,y in [('cryo',-1.35,.1),('canon',0,.65),('tesla',1.35,.1)]:
    j=families.index(name);origin=Vector(((j%9)*2.2,(j//9)*6+3.6,0))
    for ob in library.objects:
        if ob.name.startswith(name+'/3/'):
            clone=ob.copy();clone.data=ob.data.copy();scene.collection.objects.link(clone);clone.location=ob.location-origin+Vector((x,y,0))
# Studio plinth and soft lights.
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='Studio / sol';floor.location.z=-.03
m=bpy.data.materials.new('Studio / ardoise');m.use_nodes=True
next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'].default_value=(*rgb('#183139'),1);floor.data.materials.append(m)
for name,loc,power,size in [('Key',(1,-3,6),1100,5),('Fill',(-4,-1,3),700,4),('Rim',(2,4,5),1300,3)]:
    light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size;o=bpy.data.objects.new(name,light);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.5))-o.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.cameras.new('Citadelles / camera');o=bpy.data.objects.new('Citadelles / camera',cam);scene.collection.objects.link(o);scene.camera=o;o.location=(4,-7,5);o.rotation_euler=(Vector((0,.3,.45))-o.location).to_track_quat('-Z','Y').to_euler();cam.type='ORTHO';cam.ortho_scale=5.5
try:scene.render.engine='CYCLES'
except TypeError:pass
if hasattr(scene,'cycles'):scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.world=bpy.data.worlds.new('Citadelles / world');scene.world.use_nodes=True;next(n for n in scene.world.node_tree.nodes if n.type=='BACKGROUND').inputs[0].default_value=(.08,.12,.15,1)
scene.render.resolution_x=1400;scene.render.resolution_y=900;scene.render.resolution_percentage=100
formats=[i.identifier for i in scene.render.image_settings.bl_rna.properties['file_format'].enum_items]
if 'PNG' in formats:scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(ROOT/'verification/screenshots/v4-blender-studio.png')
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':area.spaces.active.region_3d.view_distance=7;area.spaces.active.region_3d.view_location=(0,.3,.5)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'conception-3d/Bastorynn-Citadelles.blend'),compress=True)
bpy.ops.render.render(write_still=True)
print('SHOWCASE READY',flush=True)
