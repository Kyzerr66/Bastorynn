// Détails du donjon, sans changer l'emprise du château : portes, tuiles, éclairages, bannières.
for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,ca=Math.cos(a),sa=Math.sin(a);for(let row=0;row<3;row++){const h=.18+row*.14,reach=.5-row*.145;box(.92-row*.28,.02,.03,ca*reach,1.69+h-.14,sa*reach,'#2E3C5C',Math.PI/2-a);}}
box(.5,.04,.96,0,1.65,0,'#8C6E48');box(.96,.04,.5,0,1.65,0,'#8C6E48');
for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.cos(a),z=Math.sin(a),ry=Math.PI/2-a;box(.26,.42,.03,x*.41,.53,z*.41,'#4A3423',ry);box(.32,.05,.05,x*.42,.77,z*.42,'#BFA877',ry);for(const s of [-1,1]){box(.022,.1,.022,x*.45-z*s*.22,1.42,z*.45+x*s*.22,'#3A3028',ry);}}
for(const side of [-1,1]){box(.022,.36,.11,side*.47,1.28,.47,'#8E2F2F');box(.022,.36,.11,side*.47,1.28,-.47,'#8E2F2F');}
