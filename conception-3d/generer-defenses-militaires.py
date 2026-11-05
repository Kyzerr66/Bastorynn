import bpy,json,zlib,base64,math
from pathlib import Path
from mathutils import Vector,Matrix
root=Path(__file__).resolve().parents[1];source=(root/'src/models/citadelles-pack.js').read_text('utf8')
pack=json.loads(zlib.decompress(base64.b64decode(json.loads(source.split('=',1)[1].strip().rstrip(';')))))
colors={c:i for i,c in enumerate(pack['palette'])}
def mat(c):
 if c not in colors:colors[c]=len(pack['palette']);pack['palette'].append(c)
 return colors[c]
D=mat('#1c2825');M=mat('#536148');P=mat('#85927a');S=mat('#918a72');K=mat('#303d3b');A=4
class Mesh:
 def __init__(self):self.p=[];self.i=[];self.m=[]
 def face(self,f,c):self.i.extend(f);self.m.append(c)
 def vertices(self,v):
  start=len(self.p)//3
  for xyz in v:self.p.extend(round(x*10000) for x in xyz)
  return start
 def box(self,pos,size,color):
  x,y,z=pos;a,b,c=[v/2 for v in size];v=[(x-a,y-b,z-c),(x+a,y-b,z-c),(x+a,y+b,z-c),(x-a,y+b,z-c),(x-a,y-b,z+c),(x+a,y-b,z+c),(x+a,y+b,z+c),(x-a,y+b,z+c)];o=self.vertices(v)
  for f in [(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(3,7,6),(3,6,2),(0,4,7),(0,7,3),(1,2,6),(1,6,5)]:self.face(tuple(o+i for i in f),color)
 def cyl(self,pos,r,depth,color,axis='y',n=10,hole=0):
  x,y,z=pos;verts=[]
  for d in [-depth/2,depth/2]:
   for j in range(n):
    a=math.pi*2*j/n;u,v=math.cos(a)*r,math.sin(a)*r
    verts.append((x+d,y+u,z+v) if axis=='x' else (x+u,y+d,z+v))
  o=self.vertices(verts)
  for j in range(n):
   a,b=o+j,o+(j+1)%n;c,d=b+n,a+n
   self.face((a,b,c),color);self.face((a,c,d),color)
  for j in range(1,n-1):self.face((o,o+j+1,o+j),color);self.face((o+n,o+n+j,o+n+j+1),color)
  if hole:
   rr=r*hole;d=depth/2+.002;v=[]
   for j in range(n):
    a=math.pi*2*j/n;u,vv=math.cos(a)*rr,math.sin(a)*rr;v.append((x+d,y+u,z+vv) if axis=='x' else (x+u,y+d,z+vv))
   o=self.vertices(v)
   for j in range(1,n-1):self.face((o,o+j,o+j+1),D)
 def data(self):return {'p':self.p,'i':self.i,'m':self.m} if self.i else None
# Families grouped by their combat function, with distinct weapon assemblies.
shell={'mortar','obusier','frostbattery','siege'}
rapid={'sentry','lourde','phalanx','flak','skyguard','sniper','harpon'}
missiles={'missile','antitank','mlrs','drone'}
fluid={'cryo','flame','acid','gas','napalm'}
beam={'laser','rail','plasma','ionlance'}
signals={'tesla','emp','pulse','sonic','void','radar','orbital','relay','forge','mine'}
scene=bpy.context.scene
for obj in list(scene.objects):bpy.data.objects.remove(obj,do_unlink=True)
materials=[]
for i,color in enumerate(pack['palette']):
 m=bpy.data.materials.new('Palette '+str(i));rgb=tuple(int(color[j:j+2],16)/255 for j in (1,3,5));m.diffuse_color=(*rgb,1);materials.append(m)
def display(name,part,x,z,y=0):
 if not part:return
 mesh=bpy.data.meshes.new(name);verts=[(part['p'][i]/10000,-part['p'][i+2]/10000,part['p'][i+1]/10000) for i in range(0,len(part['p']),3)];faces=[tuple(part['i'][i:i+3]) for i in range(0,len(part['i']),3)];mesh.from_pydata(verts,[],faces);mesh.update()
 for m in materials:mesh.materials.append(m)
 mesh.polygons.foreach_set('material_index',part['m']);obj=bpy.data.objects.new(name,mesh);scene.collection.objects.link(obj);obj.location=(x,z,y);return obj
families=[f for f in pack['towers'] if f not in ['gatling','canon']]
assert set(families)==shell|rapid|missiles|fluid|beam|signals
for idx,f in enumerate(families):
 for level in [1,2,3]:
  old=pack['towers'][f][str(level)];base=Mesh();turret=Mesh();barrel=Mesh();spin=Mesh()
  base.cyl((0,.06,0),.49,.12,D,n=8);base.cyl((0,.14,0),.43,.05,S,n=8);base.cyl((0,.20,0),.30,.12,K,n=12)
  for x in [-.25,.25]:
   for z in [-.25,.25]:base.box((x,.18,z),(.11,.06,.11),D)
  for j in range(level):base.box((-.11+j*.11,.205,-.40),(.055,.025,.035),A)
  turret.box((0,.12,0),(.46,.24,.38),M);turret.box((-.04,.27,0),(.34,.07,.32),P)
  for z in [-.22,.22]:
   turret.box((-.04,.15,z),(.35,.20,.08),K);turret.box((-.04,.26,z),(.27,.035,.085),S)
   for x in [-.15,.07]:turret.cyl((x,.28,z),.016,.025,S,n=6)
  meta={'turretY':.25};yaw=True
  if f in shell:
   specs={'mortar':(.12,.61,.52),'obusier':(.14,.77,.46),'frostbattery':(.115,.69,.57),'siege':(.17,.83,.36)};r,L,tilt=specs[f]
   barrel.cyl((L/2,0,0),r,L,K,axis='x',n=12);barrel.cyl((L,0,0),r*1.35,.10,M,axis='x',n=12,hole=.70);barrel.cyl((.08,0,0),r*1.35,.10,S,axis='x',n=12)
   if f=='frostbattery':
    for z in [-.18,.18]:turret.cyl((-.10,.25,z),.07,.26,A,n=8)
   meta.update({'barrelPos':[0,.17,0],'barrelTilt':tilt,'muzzle':[L*math.cos(tilt),.17+L*math.sin(tilt),0],'recoil':.06})
  elif f in rapid:
   if f in ['flak','skyguard']:count=4;rad=.055;length=.53
   elif f=='phalanx':count=6;rad=.032;length=.52
   elif f=='lourde':count=2;rad=.055;length=.62
   else:count=1;rad={'sentry':.045,'sniper':.04,'harpon':.065}.get(f,.05);length={'sniper':.86,'harpon':.80}.get(f,.57)
   for j in range(count):
    angle=2*math.pi*j/count;yy=math.sin(angle)*.09 if count>2 else 0;zz=math.cos(angle)*.09 if count>2 else (j-(count-1)/2)*.13
    target=spin if f in ['phalanx','lourde'] else barrel;target.cyl((length/2,yy,zz),rad,length,K,axis='x',n=8);target.cyl((length,yy,zz),rad*1.22,.08,D,axis='x',n=8,hole=.7)
   if f=='skyguard':turret.box((-.14,.42,0),(.18,.11,.27),A)
   if f=='sniper':turret.box((-.06,.38,0),(.24,.08,.08),D);turret.box((.02,.40,0),(.045,.04,.07),A)
   if f=='harpon':turret.box((-.16,.38,-.18),(.25,.18,.12),S)
   meta.update({'muzzle':[length,.19,0]})
   if spin.i:meta.update({'spinPos':[0,.19,0],'spinAxis':'x'})
   else:meta.update({'barrelPos':[0,.19,0],'recoil':.025})
  elif f in missiles:
   if f=='drone':
    turret.box((0,.35,0),(.50,.27,.45),M);turret.box((0,.51,0),(.57,.035,.52),K)
    for z in [-.16,.16]:turret.cyl((.08,.54,z),.07,.025,A,n=8)
    for z in [-.20,.20]:spin.box((0,0,z),(.03,.018,.32),K)
    meta.update({'spinPos':[0,.64,0],'spinAxis':'y','muzzle':[.15,.55,0]})
   else:
    rows,cols=(2,3) if f=='mlrs' else ((2,2) if f=='missile' else (1,2))
    turret.box((-.06,.27,0),(.38,.25,.43),M)
    for row in range(rows):
     for col in range(cols):
      yy=(row-(rows-1)/2)*.14;zz=(col-(cols-1)/2)*.14;barrel.cyl((.27,yy,zz),.058,.55,K,axis='x',n=8);barrel.cyl((.55,yy,zz),.071,.045,S,axis='x',n=8,hole=.68)
    meta.update({'barrelPos':[0,.36,0],'barrelTilt':.28,'muzzle':[.52,.50,0],'recoil':.025})
  elif f in fluid:
   if f=='cryo':tank=A;nozzle=K
   elif f in ['acid','gas']:tank=A;nozzle=K
   else:tank=S;nozzle=D
   for z in [-.18,.18]:
    turret.cyl((-.13,.28,z),.085,.34,tank,n=10);turret.cyl((-.13,.46,z),.085,.025,K,n=10);turret.cyl((-.13,.10,z),.09,.035,D,n=10)
   turret.box((-.22,.31,0),(.12,.22,.17),M)
   for z in ([-.075,.075] if f in ['flame','napalm'] else [0]):barrel.cyl((.27,0,z),.055,.55,nozzle,axis='x',n=10);barrel.cyl((.55,0,z),.078,.08,S,axis='x',n=10,hole=.65)
   if f=='gas':turret.box((-.22,.46,0),(.15,.09,.18),A)
   if f=='acid':turret.box((-.22,.45,0),(.16,.08,.18),A)
   meta.update({'barrelPos':[0,.22,0],'muzzle':[.56,.22,0],'recoil':.01})
  elif f in beam:
   length={'laser':.65,'rail':.85,'plasma':.65,'ionlance':.80}[f]
   for z in [-.10,.10]:
    barrel.box((length/2,0,z),(length,.09,.08),K);barrel.box((length/2,.055,z),(length*.75,.025,.04),A)
   barrel.cyl((length,0,0),.10,.12,S,axis='x',n=8,hole=.64)
   if f=='plasma':turret.cyl((-.15,.39,0),.12,.20,A,n=8)
   if f=='rail':turret.box((-.17,.34,0),(.22,.14,.22),D)
   meta.update({'barrelPos':[0,.22,0],'muzzle':[length,.22,0],'recoil':.015})
  else:
   yaw=False
   if f in ['radar','orbital']:
    turret.cyl((0,.25,0),.065,.40,K,n=10);spin.cyl((0,.02,0),.27,.06,M,n=12);spin.cyl((0,.07,0),.21,.04,A,n=12);spin.box((-.15,.12,0),(.03,.18,.03),S)
    if f=='orbital':
     for z in [-.28,.28]:spin.box((0,.02,z),(.34,.025,.20),D)
    meta.update({'spinPos':[0,.51,0],'spinAxis':'y','muzzle':[0,.58,0]})
   elif f in ['tesla','emp','pulse','sonic','void']:
    turret.cyl((0,.23,0),.11,.32,K,n=10)
    for y in [.12,.22,.32,.42]:turret.cyl((0,y,0),.14,.035,A,n=10)
    for z in [-.21,.21]:turret.box((0,.32,z),(.05,.52,.05),M);turret.cyl((0,.59,z),.055,.08,S,n=8)
    if f=='sonic':
     for z in [-.19,.19]:turret.cyl((.19,.28,z),.11,.14,D,axis='x',n=12)
    if f=='void':turret.cyl((0,.63,0),.14,.12,D,n=10)
    if f=='emp':turret.box((0,.62,0),(.25,.09,.25),A)
    if f=='pulse':turret.cyl((0,.59,0),.20,.05,S,n=10)
    meta['muzzle']=[.20,.40,0]
   elif f=='mine':
    turret.box((0,.29,0),(.48,.27,.40),M)
    for z in [-.12,.12]:turret.cyl((.05,.45,z),.07,.06,D,n=8);turret.cyl((.05,.49,z),.035,.02,A,n=8)
    meta['muzzle']=[.15,.30,0]
   else:
    turret.box((0,.33,0),(.43,.35,.36),M);turret.box((.23,.36,0),(.03,.20,.26),K)
    if f=='forge':
     for z in [-.11,.11]:turret.cyl((-.12,.59,z),.045,.28,D,n=8)
     turret.box((.25,.35,0),(.025,.12,.16),A)
    else:
     turret.cyl((0,.66,0),.025,.45,S,n=6);turret.cyl((0,.90,0),.085,.08,A,n=8)
    meta['muzzle']=[0,.55,0]
  if not yaw:meta['noYaw']=True
  if not barrel.i and not spin.i:
   # A visible mechanical head moves on generators, mines and area-effect towers.
   spin.cyl((0,0,0),.12,.035,K,n=10)
   for side in [-1,1]:spin.box((side*.10,.025,0),(.045,.035,.11),A)
   meta.update({'spinPos':[0,.55,0],'spinAxis':'y'})
  if level>=2:
   for z in [-.29,.29]:turret.box((-.16,.16,z),(.25,.16,.11),M);turret.box((-.16,.26,z),(.19,.03,.12),S)
  if level>=3:
   turret.box((-.20,.40,.20),(.13,.20,.08),K);turret.box((-.20,.52,.20),(.18,.045,.10),A)
  parts={'base':base.data(),'turret':turret.data(),'barrel':barrel.data(),'spin':spin.data()}
  assert parts['base'] and parts['turret'];pack['towers'][f][str(level)]={'parts':parts,'meta':meta,'accent':old['accent']}
  x=(idx%9)*2.2;z=(idx//9)*5.2+(level-1)*1.5
  for key,piece in parts.items():
   offset=0 if key=='base' else .25
   obj=display(f'{f}/niveau {level}/{key}',piece,x,z,offset)
   if not obj:continue
   if key=='barrel':
    delta=meta.get('barrelPos',[0,0,0]);obj.location+=(Vector((delta[0],-delta[2],delta[1])));obj.rotation_euler.y=-meta.get('barrelTilt',0)
    rest=obj.location.x
    for frame,recoil in [(1,0),(4,.06),(10,0),(25,0)]:obj.location.x=rest-recoil;obj.keyframe_insert(data_path='location',index=0,frame=frame,group='Tir')
   if key=='spin':
    delta=meta.get('spinPos',[0,0,0]);obj.location+=(Vector((delta[0],-delta[2],delta[1])));axis=0 if meta.get('spinAxis')=='x' else 2
    for frame,angle in [(1,0),(25,2*math.pi)]:obj.rotation_euler[axis]=angle;obj.keyframe_insert(data_path='rotation_euler',index=axis,frame=frame,group='Rotation')
    action=obj.animation_data.action
    try:curves=action.layers[0].strips[0].channelbag(action.slots[0]).fcurves
    except (AttributeError,IndexError):curves=action.fcurves
    for curve in curves:
     for k in curve.keyframe_points:k.interpolation='LINEAR'
 print(f,flush=True)
raw=json.dumps(pack,separators=(',',':')).encode();target=root/'src/models/citadelles-pack.js';target.write_text('window.BastorynnAssetArchive='+json.dumps(base64.b64encode(zlib.compress(raw,9)).decode())+';\n',encoding='utf8')
scene.frame_start=1;scene.frame_end=25;scene.render.fps=24;scene.frame_set(1);scene.name='Bastorynn / defenses militaires';bpy.ops.wm.save_as_mainfile(filepath=str(root/'conception-3d/Bastorynn_Defenses_Militaires.blend'),compress=True)
print('COMPLETED',len(families),'PACK',target.stat().st_size,flush=True)
