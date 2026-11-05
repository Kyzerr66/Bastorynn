import bpy,json,zlib,base64,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
source=(root/'src/models/citadelles-pack.js').read_text('utf8');pack=json.loads(zlib.decompress(base64.b64decode(json.loads(source.split('=',1)[1].strip().rstrip(';')))))
colors={x:i for i,x in enumerate(pack['palette'])}
def color_id(rgb,texture=False):
 def srgb(x):return 12.92*x if x<=.0031308 else 1.055*max(x,0)**(1/2.4)-.055
 c='#'+''.join(f'{max(0,min(255,round((float(v) if texture else srgb(float(v)))*255))):02x}' for v in rgb[:3])
 if c not in colors:colors[c]=len(pack['palette']);pack['palette'].append(c)
 return colors[c]
def convert(v,scale,origin):return [-(v.y-origin.y)*scale,(v.z-origin.z)*scale,-(v.x-origin.x)*scale]
def geometry(objects,scale,origin):
 positions=[];indices=[];materials=[]
 for ob in objects:
  ev=ob.evaluated_get(bpy.context.evaluated_depsgraph_get());me=ob.data;me.calc_loop_triangles();coords=[convert(ob.matrix_world@v.co,scale,origin) for v in me.vertices]
  offset=len(positions)//3
  for p in coords:positions.extend(round(v*10000) for v in p)
  uv=me.uv_layers.active.data if me.uv_layers.active else None
  cache={}
  for tri in me.loop_triangles:
   indices.extend(offset+i for i in tri.vertices);mat=me.materials[tri.material_index] if len(me.materials)>tri.material_index else None
   color=(.2,.25,.20,1);texture=False
   if mat:
    if mat.use_nodes:
     bs=next((n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
     if not bs: color=mat.diffuse_color
     if bs:
      color=bs.inputs['Base Color'].default_value
      links=bs.inputs['Base Color'].links
      if links and links[0].from_node.type=='TEX_IMAGE' and uv:
       image=links[0].from_node.image
       if image:
        if image.name not in cache:
         import numpy as np
         cache[image.name]=np.array(image.pixels[:],dtype=np.float32).reshape(image.size[1],image.size[0],4)
        texture=True;pix=cache[image.name];u=sum(uv[i].uv.x for i in tri.loops)/3%1;v=sum(uv[i].uv.y for i in tri.loops)/3%1;color=pix[min(int(v*image.size[1]),image.size[1]-1),min(int(u*image.size[0]),image.size[0]-1)]
    else:color=mat.diffuse_color
   materials.append(color_id(color,texture))
  # Source meshes avoid expanding decorative bevel modifiers at runtime.
 return {'p':positions,'i':indices,'m':materials} if indices else None
for family in ['cryo','tesla','flame','acid','laser']:
 for level in [1,2,3]:
  name={'cryo':'Cryo','tesla':'Tesla','flame':'Lance_Flammes','acid':'Acide','laser':'Laser'}[family]
  file='Proposition_V2_%s_Niveau_%d.blend'%(name,level)
  bpy.ops.wm.open_mainfile(filepath=str(root/'conception-3d'/'modeles-valide-lot2'/file));scene=bpy.context.scene;scene.frame_set(1);bpy.context.view_layer.update()
  meshes=[o for o in scene.objects if o.type=='MESH' and o.name!='Studio' and not o.name.startswith('EFFET')]
  baseorigin=Vector((0,0,0));scale=.40;turretY=.25
  base=[];turret=[];barrel=[];spin=[]
  for o in meshes:
   n=o.name
   if n.startswith(('Fondation','Socle','Anneau porteur','Fixation')):base.append(o)
   elif o.parent and o.parent.name.startswith('Pivot de rotation'):spin.append(o)
   elif o.animation_data and o.animation_data.action:barrel.append(o)
   else:turret.append(o)
  torigin=baseorigin+Vector((0,0,turretY/scale));parts={'base':geometry(base,scale,baseorigin),'turret':geometry(turret,scale,torigin),'barrel':geometry(barrel,scale,torigin)}
  if spin:
   pivot=spin[0].parent.matrix_world.translation.copy();parts['spin']=geometry(spin,scale,pivot);offset=convert(pivot,scale,torigin)
  else:parts['spin']=None;offset=None
  assert parts['base'] and parts['turret'],(family,level)
  original=pack['towers'][family][str(level)];meta={'turretY':turretY,'muzzle':{'cryo':[.72,.32,0],'tesla':[0,.59,0],'flame':[1.12,.20,0],'acid':[.67,.19,0],'laser':[.92,.21,0]}[family]}
  if spin:meta.update({'spinPos':offset,'spinAxis':'y' if family=='tesla' else 'x'})
  if family=='tesla':meta['noYaw']=True
  if barrel:meta.update({'barrelPos':[0,0,0],'recoil':.075})
  pack['towers'][family][str(level)]={'parts':parts,'meta':meta,'accent':original['accent']}
  print('EXPORTED',family,level,'triangles',sum(len(p['m']) for p in parts.values() if p),flush=True)
out=root/'src/models/citadelles-pack.js';raw=json.dumps(pack,separators=(',',':')).encode();out.write_text('window.BastorynnAssetArchive='+json.dumps(base64.b64encode(zlib.compress(raw,9)).decode())+';\n',encoding='utf8');print('PACK',out.stat().st_size,'COLORS',len(colors),flush=True)
