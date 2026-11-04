"""New Blender props, exported with the same Y-up mesh protocol as units."""
def build_decor():
    objects=[]
    def add(kind,loc,size,mat,rot=0):
        if kind=='box':bpy.ops.mesh.primitive_cube_add(size=1)
        elif kind=='cone':bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=1,radius2=0,depth=1)
        elif kind=='rock':bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1)
        else:bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=1,depth=1)
        o=bpy.context.object;o.location=loc;o.scale=size;o.rotation_euler[2]=rot
        for m in materials:o.data.materials.append(m)
        for p in o.data.polygons:p.material_index=mat
        objects.append(o);return o
    def joined(name):
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();ob=objects[0];ob.name='decor/'+name
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);ob.data.transform(Matrix.Rotation(-math.pi/2,4,'X'))
        mod=ob.modifiers.new('Aretes taillees','BEVEL');mod.width=.015;mod.segments=1
        pack['decor'][name]=export(ob);position(ob,len(pack['decor'])*2.5,48);objects.clear();return ob
    # Citadel keep: layered ceramic walls, copper reveals and graphite roof.
    add('cyl',(0,0,.19),(.65,.65,.20),0)
    add('box',(0,0,.78),(.82,.82,1.02),2)
    for x in [-.47,.47]:
        for y in [-.47,.47]:add('box',(x,y,.83),(.19,.19,1.3),1)
    for y in [-.423,.423]:
        for x in [-.22,0,.22]:
            add('box',(x,y,.93),(.115,.025,.41),0);add('box',(x,y*1.02,.94),(.055,.018,.30),4)
        add('box',(0,y,1.30),(.96,.15,.09),3)
    add('box',(0,0,1.43),(1.13,1.13,.18),2)
    add('cone',(0,0,1.80),(.85,.85,.59),0,math.pi/4)
    add('cyl',(0,0,2.1),(.11,.11,.10),3)
    joined('keep')
    # Village house, still one instanced mesh regardless of map density.
    add('box',(0,0,.18),(.50,.37,.36),2);add('box',(0,0,.035),(.56,.43,.07),0)
    add('cone',(0,0,.46),(.39,.31,.25),0,math.pi/4)
    add('box',(.12,-.191,.12),(.10,.015,.19),3)
    for x in [-.13,.10]:add('box',(x,.191,.23),(.075,.014,.10),4)
    add('box',(-.16,.08,.49),(.07,.07,.20),1);joined('house')
    add('rock',(0,0,.08),(.31,.25,.27),1);add('rock',(.17,.03,.025),(.14,.17,.12),2);joined('rock')
    add('cyl',(0,0,.035),(.42,.42,.07),0)
    add('cyl',(0,0,.078),(.36,.36,.016),2)
    for x in [-.25,.25]:add('box',(x,0,.09),(.035,.31,.016),3)
    joined('pad')
    # Distinct autumn canopy rather than a generic pine fallback.
    add('cyl',(0,0,.24),(.055,.055,.48),3)
    for x,y,z,scale in [(0,0,.65,.32),(.19,.04,.55,.22),(-.18,-.05,.60,.23),(0,0,.85,.20)]:add('rock',(x,y,z),(scale,scale,scale),3)
    ob=joined('autumn');pack['trees']['autumn']=pack['decor'].pop('autumn')
    print('DECOR READY',list(pack['decor']),flush=True)

build_decor()
