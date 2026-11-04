"""Bastorynn Citadelles: import source meshes, remesh, art-direct and export.
Run inside Blender 5.2. All working data stays in the dedicated scene.
Geometry uses game Y-up; display objects are rotated into Blender Z-up.
"""
import bpy, json, math, time, zlib, base64, gzip
import numpy as np
from pathlib import Path
from mathutils import Matrix
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'conception-3d/source-meshes.json.gz'
PALETTE=['#182b32','#617d83','#ddd9c6','#cda66d','#a9e5ca','#111c23','#bb9475']
def linear(h):
    a=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in a)
materials=[]
for i,h in enumerate(PALETTE):
    m=bpy.data.materials.new('Citadelles / '+['Graphite','Acier','Ceramique','Laiton','Element','Caoutchouc','Peau'][i]);m.use_nodes=True
    m.diffuse_color=(*linear(h),1)
    bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=m.diffuse_color
    bs.inputs['Roughness'].default_value=.75;bs.inputs['Metallic'].default_value=.35 if i in [1,3] else .08
    materials.append(m)
scene=bpy.data.scenes.new('Bastorynn · Citadelles V4');bpy.context.window.scene=scene
collection=scene.collection
source=json.loads(gzip.decompress(SOURCE.read_bytes()).decode('utf8'))
pack={'version':4,'palette':PALETTE,'towers':{},'units':{},'trees':{},'decor':{}}
stats={'beforeTriangles':0,'afterTriangles':0,'objects':0}
def make(name,data):
    attrs=data['attributes'];p=np.asarray(attrs['position']['data'],dtype=np.float32).reshape(-1,3)
    if not len(p):return None
    idx=np.asarray(data['index'] if data['index'] else np.arange(len(p)),dtype=np.int32).reshape(-1,3)
    colors=np.asarray(attrs['color']['data'],dtype=np.float32).reshape(-1,3)[idx[:,0]]
    em=np.asarray(attrs['em']['data'],dtype=np.float32).reshape(-1,2)[idx[:,0]]
    light=colors.max(axis=1);sat=light-colors.min(axis=1)
    mi=np.where(light<.055,5,np.where(light<.18,0,np.where(light<.4,1,2)))
    mi=np.where((colors[:,0]>colors[:,2]*1.8)&(light>.18)&(sat>.1),3,mi)
    mi=np.where(em[:,0]>.15,4,mi)
    # Weld shared vertices before simplification; hard material boundaries survive.
    verts,inverse=np.unique(np.round(p,5),axis=0,return_inverse=True)
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts.tolist(),[],inverse[idx].tolist());mesh.update()
    for m in materials:mesh.materials.append(m)
    mesh.polygons.foreach_set('material_index',mi.astype(np.int32))
    ob=bpy.data.objects.new(name,mesh);collection.objects.link(ob)
    stats['beforeTriangles']+=len(idx)
    mod=ob.modifiers.new('LOD silhouette 48 pourcent','DECIMATE')
    modes=[i.identifier for i in mod.bl_rna.properties['decimate_type'].enum_items]
    if 'COLLAPSE' in modes:mod.decimate_type='COLLAPSE';mod.ratio=.48;mod.use_collapse_triangulate=True
    if '/foreuse/' in name:ob.modifiers.remove(mod)
    return ob
def export(ob):
    if ob is None:return None
    ev=ob.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();mesh.calc_loop_triangles()
    # A single material id per face, indexed positions, flat normals computed in game.
    p=np.empty(len(mesh.vertices)*3,dtype=np.float32);mesh.vertices.foreach_get('co',p)
    i=np.empty(len(mesh.loop_triangles)*3,dtype=np.int32);mesh.loop_triangles.foreach_get('vertices',i)
    m=np.empty(len(mesh.loop_triangles),dtype=np.int32);mesh.loop_triangles.foreach_get('material_index',m)
    stats['afterTriangles']+=len(m);stats['objects']+=1
    result={'p':np.round(p*10000).astype(np.int32).tolist(),'i':i.tolist(),'m':m.tolist()}
    ev.to_mesh_clear();return result
def position(ob,x,z,height=0):
    if ob:ob.rotation_euler[0]=math.pi/2;ob.location=(x,z,height)
def primitive(name,kind,dims,loc,mat):
    if kind=='cyl':bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=1,depth=1)
    else:bpy.ops.mesh.primitive_cube_add(size=1)
    ob=bpy.context.object;ob.name=name;ob.scale=dims;ob.location=loc;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.clear()
    for m in materials:ob.data.materials.append(m)
    for poly in ob.data.polygons:poly.material_index=mat
    # Geometry intentionally lives in Y-up like the game.
    ob.data.transform(Matrix.Translation(loc));ob.location=(0,0,0)
    if kind=='cyl':ob.data.transform(Matrix.Rotation(math.pi/2,4,'X'))
    bevel=ob.modifiers.new('Chanfrein manufacture','BEVEL');bevel.width=.012;bevel.segments=1
    return ob
def foundation(name,level):
    # Build in Blender Z-up then rotate mesh to game Y-up in one final transform.
    objects=[]
    def piece(kind,dims,loc,mat):
        if kind=='cyl':bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=1,depth=1)
        else:bpy.ops.mesh.primitive_cube_add(size=1)
        o=bpy.context.object;o.scale=dims;o.location=loc;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        for m in materials:o.data.materials.append(m)
        for p in o.data.polygons:p.material_index=mat
        objects.append(o)
    piece('cyl',(.49,.49,.10),(0,0,.05),0)
    piece('cyl',(.43,.43,.055),(0,0,.127),2)
    piece('cyl',(.29,.29,.10),(0,0,.205),0)
    for k in range(6):
        a=k*math.pi/3;piece('box',(.09,.055,.055),(.36*math.cos(a),.36*math.sin(a),.175),3)
    for k in range(level):piece('box',(.065,.018,.025),(-.08+k*.08,-.385,.164),4)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();ob=objects[0];ob.name=name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);ob.data.transform(Matrix.Rotation(-math.pi/2,4,'X'))
    mod=ob.modifiers.new('Chanfreins de ceramique','BEVEL');mod.width=.009;mod.segments=1
    return ob

def run_towers(start=0,end=36):
    for j,(family,levels) in enumerate(list(source['towers'].items())[start:end],start):
        pack['towers'][family]={}
        for lev,d in levels.items():
            level=int(lev);parts={}
            for k,g in d['parts'].items():
                ob=foundation(f'{family}/{lev}/base',level) if k=='base' else make(f'{family}/{lev}/{k}',g)
                parts[k]=export(ob)
                x=(j%9)*2.2;z=(j//9)*6+(level-1)*1.8;h=0
                if k!='base':h=d['meta'].get('turretY',.25)
                position(ob,x,z,h)
                if ob and k=='barrel':
                    v=d['meta'].get('barrelPos',[0,0,0]);ob.location.x+=v[0];ob.location.y-=v[2];ob.location.z+=v[1]
                    ob.rotation_euler[1]=-d['meta'].get('barrelTilt',0)
                if ob and k=='spin':
                    v=d['meta'].get('spinPos',[0,0,0]);ob.location.x+=v[0];ob.location.y-=v[2];ob.location.z+=v[1]
            pack['towers'][family][lev]={'parts':parts,'meta':d['meta'],'accent':d['accent']}
        print('tower',family,flush=True)
def run_units(start=0,end=87):
    for j,(name,parts) in enumerate(list(source['units'].items())[start:end],start):
        result=[]
        for k,p in enumerate(parts):
            ob=make(f'unite/{name}/{k}',p['g']);g=export(ob);q={**p,'g':g};result.append(q)
            v=p.get('pos',[0,0,0]);position(ob,(j%12)*1.7+v[0],28+(j//12)*2-v[2],v[1])
        pack['units'][name]=result
        print('unit',name,flush=True)
def run_trees():
    for j,(name,data) in enumerate(source['trees'].items()):
        ob=make('decor/'+name,data)
        if ob:
            # Foliage gets a quieter, teal-green material distinct from armour.
            leaf=bpy.data.materials.new('Feuillage/'+name);leaf.use_nodes=True;col=linear('#648779' if name!='snowpine' else '#92aaa0');leaf.diffuse_color=(*col,1)
            next(n for n in leaf.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'].default_value=(*col,1)
            ob.data.materials[2]=leaf
        pack['trees'][name]=export(ob);position(ob,j*1.5,44)
def finish():
    out=ROOT/'src/models';out.mkdir(exist_ok=True)
    raw=json.dumps(pack,separators=(',',':')).encode();blob=base64.b64encode(zlib.compress(raw,9)).decode()
    (out/'citadelles-pack.js').write_text('window.BastorynnAssetArchive="'+blob+'";\n',encoding='utf8')
    report={**stats,'families':len(pack['towers']),'baseUnits':len(pack['units']),'trees':len(pack['trees']),'compressedBytes':len(blob),'rawBytes':len(raw),'blender':bpy.app.version_string}
    (ROOT/'verification/blender-assets.json').write_text(json.dumps(report,indent=2))
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'conception-3d/Bastorynn-Citadelles.blend'),compress=True)
    print(json.dumps(report))
print('READY',len(source['towers']),len(source['units']))

if __name__ == "__main__":
    run_towers()
    run_units()
    run_trees()
    exec(compile((ROOT/"conception-3d/citadelles_decor.py").read_text("utf8"),"citadelles_decor.py","exec"))
    finish()
