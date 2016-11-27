/*
tasks:
	high score
	pause
	a less aliased power bar
	bomb
	animating exhaust
		true particles
			get smaller and fade as it goes
		simple objects with no collider
		or line-like objects
	glowing lights for enemy_a and boss
	additional bg, level 2
		precomputed clouds
		caves
		plasma
*/
function myCompileShader(src, shaderType) {
	var shader = glCreateShader(shaderType);
	glShaderSource(shader, src);
	glCompileShader(shader);
	var success = glGetShaderParameter(shader, GL_COMPILE_STATUS);
	if (!success) {
		throw "could not compile shader:" + glGetShaderInfoLog(shader);
	}
	return shader;
}

function myCompileProgram(vertexShader, fragmentShader, fprelink) {
	var program = glCreateProgram();
	glAttachShader(program, myCompileShader(vertexShader,GL_VERTEX_SHADER));
	glAttachShader(program, myCompileShader(fragmentShader,GL_FRAGMENT_SHADER));
	fprelink(program)
	glLinkProgram(program);
	var success = glGetProgramParameter(program, GL_LINK_STATUS);
	if (!success) {
		throw ("program filed to link:" + glGetProgramInfoLog (program));
	}
	return program;
}

//////////////////////
var MAX_VBO_FLOATS=320000;
var g_level,g_new_level;
var g_vbo,g_vbodata,g_ebo;
var g_techniques={};
var g_bgm,g_bgm_fname,g_sound_effects={},g_sound_playing={};

PlaySoundEffect=function(fname,is_loop){
	var aobj=g_sound_effects[fname];
	if(!aobj){
		aobj=new Audio(fname);
		g_sound_effects[fname]=aobj;
		aobj.onended=function(){
			g_sound_playing[fname]=0;
		}
		aobj.oncanplay=function(){
			if(g_sound_playing[fname]==1){return;}
			g_sound_playing[fname]=1;
			aobj.currentTime = 0;
			aobj.play();
		}
		aobj.loop=false;
		g_sound_playing[fname]=2;
		return 1;
	}
	if(is_loop==1&&g_sound_playing[fname]){
		return 0;
	}
	if(g_sound_playing[fname]==2){return 0;}
	aobj.currentTime = 0;
	aobj.play();
	g_sound_playing[fname]=1;
	return 1;
}

SetBGM=function(fname){
	if(g_bgm){g_bgm.oncanplay=null;g_bgm.pause();g_sound_playing[g_bgm_fname]=0;}
	PlaySoundEffect(fname,1);
	g_bgm_fname=fname;
	g_bgm=g_sound_effects[fname];
	g_bgm.volume=0.5;
	g_bgm.loop=true;
}

var Level=function(){
	this.drawcalls=[]
	this.objects=[]
	this.new_objects=[]
}
Level.prototype.CreateObject=function(cls,template){
	var ret=new cls()
	for(var i in template){
		ret[i]=template[i];
	}
	if(!ret){console.log(cls,template);throw "invalid CreateObject;"}
	this.new_objects.push(ret);
	return ret;
}

function create2DTechnique(fscode){
	var svert="\
	attribute vec2 P;\n\
	attribute vec2 uv_obj;\n\
	attribute vec4 param_obj;\n\
	uniform vec2 scale;\n\
	varying vec2 uv;\n\
	varying vec4 param;\n\
	void main(){\n\
		gl_Position=vec4(P*scale,param_obj.w,1)+vec4(-1,1,0,0);\n\
		uv=uv_obj;\n\
		param=param_obj;\n\
	}"
	var sfrag="\
	precision mediump float;\n\
	varying vec2 uv;\n\
	varying vec4 param;\n\
	uniform sampler2D tex0;\n\
	vec3 lerp(vec3 a,vec3 b,float t){return a+(b-a)*t;}\n\
	void main(){\n\
		vec4 C_tex=texture2D(tex0,uv);\n\
		"+fscode+"\n\
	}"
	var fprelink=function(prg){with(gl){
		glBindAttribLocation(prg,0,"P")
		glBindAttribLocation(prg,1,"uv_obj")
		glBindAttribLocation(prg,2,"param_obj")
	}}
	var ret={}
	ret.shader=myCompileProgram(svert,sfrag,fprelink);
	ret.uloc=glGetUniformLocation(ret.shader,"scale");
	ret.uloc_tex=glGetUniformLocation(ret.shader,"tex0");
	ret.vbodata=[];
	ret.current_texture=0
	ret.Flush=function(){with(gl){
		if(this.vbodata.length){
			g_level.drawcalls.push({vbodata:new Float32Array(this.vbodata),tex:this.current_texture,depth:this.vbodata[7],tech:this})
		}
		this.vbodata=[]
	}}
	ret.Draw=function(tex,x,y,w,h, tx,ty,tw,th, depth,param, xa,ya){
		if(this.current_texture!=tex){
			this.Flush();
			this.current_texture=tex;
		}
		var n0=this.vbodata.length;
		this.vbodata.push(x)
		this.vbodata.push(y)
		this.vbodata.push(tx)
		this.vbodata.push(ty)
		this.vbodata.push(param.x)
		this.vbodata.push(param.y)
		this.vbodata.push(param.z)
		this.vbodata.push(depth)
		this.vbodata.push(x+w)
		this.vbodata.push(y)
		this.vbodata.push(tx+tw)
		this.vbodata.push(ty)
		this.vbodata.push(param.x)
		this.vbodata.push(param.y)
		this.vbodata.push(param.z)
		this.vbodata.push(depth)
		this.vbodata.push(x+w)
		this.vbodata.push(y+h)
		this.vbodata.push(tx+tw)
		this.vbodata.push(ty+th)
		this.vbodata.push(param.x)
		this.vbodata.push(param.y)
		this.vbodata.push(param.z)
		this.vbodata.push(depth)
		this.vbodata.push(x)
		this.vbodata.push(y+h)
		this.vbodata.push(tx)
		this.vbodata.push(ty+th)
		this.vbodata.push(param.x)
		this.vbodata.push(param.y)
		this.vbodata.push(param.z)
		this.vbodata.push(depth)
		if(param.rot_x||param.rot_y){
			for(var i=0;i<4;i++){
				var xi=this.vbodata[n0+i*8+0]-param.anchor_x-xa;
				var yi=this.vbodata[n0+i*8+1]-param.anchor_y-ya;
				//rotate it
				this.vbodata[n0+i*8+0]=param.anchor_x+xa+xi*param.rot_x-yi*param.rot_y;
				this.vbodata[n0+i*8+1]=param.anchor_y+ya+xi*param.rot_y+yi*param.rot_x;
			}
		}
	}
	return ret
}

g_techniques.simple=create2DTechnique("gl_FragColor=C_tex*(vec4(C_tex.w,C_tex.w,C_tex.w,1)*param.x);if(!(gl_FragColor.w>0.0)){discard;}");
g_techniques.tinted=create2DTechnique(
	"gl_FragColor=vec4(lerp(C_tex.x*vec3(param.x,param.y,param.z),vec3(1.0,1.0,1.0),C_tex.y)*C_tex.w,C_tex.w);"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);
g_techniques.damagable=create2DTechnique(
	"gl_FragColor=vec4(lerp(C_tex.xyz,vec3(1.0,1.0,1.0),param.y),1)*C_tex.w*param.x;"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);

//////////////////////
var g_advance_level_delay=-1;
lerp=function(a,b,t){return (b-a)*t+a;}
max=Math.max;
min=Math.min;

interpolatePath=function(pts,t_global,is_loop){
	var n=pts.length;
	if(n<2){return pts[0];}
	var ret={};
	var tn=t_global*(is_loop?n:(n-1));
	for(var key in pts[0]){
		var ti=min(Math.floor(tn),n-1);
		var P_0=pts[is_loop?(ti+n-1)%n:max(ti-1,0)][key];
		var P_1=pts[max(ti,0)][key];
		var P_2=pts[is_loop?(ti+1)%n:min(ti+1,n-1)][key];
		var P_3=pts[is_loop?(ti+2)%n:min(ti+2,n-1)][key];
		var t=tn-ti;
		if(n==2){
			ret[key]=P_1+t*(P_2-P_1);
		}else{
			ret[key]=0.5*((2*P_1)+t*((P_2-P_0)+t*(2*P_0-5*P_1+4*P_2-P_3+t*(-P_0+3*P_1-3*P_2+P_3))));
			//ret[key]=P_1+t*(P_2-P_1);
		}
	}
	return ret;
}

timedSpawn=function(t0,t1,path,interval,count,obj_class,obj_template){
	if(!(t0<t1)){return;}
	obj_template.t_max=t1-t0;
	obj_template.path=path;
	g_new_level.timed_spawns.push({"t0":t0,"interval":interval,"count":count,"obj_class":obj_class,"obj_template":obj_template});
}

AdvanceToTheNextLevel=function(delay){
	if(delay){
		g_advance_level_delay=delay;
		return;
	}
	if(g_level.next_level_name){loadLevel(g_level.next_level_name);}
}

StandardSpawner=function(){
	this.t=0
}
StandardSpawner.prototype.Simulate=function(){
	var has_boss=0;
	g_level.objects.map(function(ob){if(ob.is_boss){has_boss++;};})
	if(has_boss&&!c.is_level_editor){
		return;
	}
	var t=this.t++;
	if(!g_level.timed_spawn_sorted){
		g_level.timed_spawn_sorted=1;
		g_level.timed_spawns.sort(function(a,b){return a.t0-b.t0;});
	}
	if(g_level.timed_spawns.length){
		if(t>=g_level.timed_spawns[0].t0){
			var spawn_0=g_level.timed_spawns[0];
			var obj=g_level.CreateObject(spawn_0.obj_class,spawn_0.obj_template);
			spawn_0.count--;
			spawn_0.t0+=spawn_0.interval;
			if(spawn_0.count<=0){
				g_level.timed_spawns.shift();
			}else{
				obj.drops_powerup=0;
			}
			if(g_level.timed_spawns.length>=2&&spawn_0.t0>g_level.timed_spawns[1].t0){
				g_level.timed_spawns[0]=g_level.timed_spawns[1];
				g_level.timed_spawns[1]=spawn_0;
			}
		}
	}else{
		this.dead=1;
		AdvanceToTheNextLevel(300);
	}
}

//////////////////////
function loadjs(file,callback){
    var loaded=0;
    var script=document.createElement('script');
    script.src=file;
    script.type='text/javascript';
    script.onload=function(){if(!loaded){callback();loaded=1;}};
    script.onreadystatechange = function() {
        if (this.readyState == 'complete') {
            if(!loaded){callback();loaded=1;}
        }
    }
    document.body.appendChild(script);
}

function loadtex(file,callback){
	im=new Image();
	im.onload=function(){
		texid=glCreateTexture();
		glBindTexture(GL_TEXTURE_2D, texid);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA,GL_RGBA,GL_UNSIGNED_BYTE,im);
		glBindTexture(GL_TEXTURE_2D, null);
		im.onload=null;
		callback(texid);
	}
	im.src=file;
}

//////////////////////////////
function CreateCollideEllipsoid(obj, cls,x,y,r0,r1){
	var a=g_level.colliders[cls]
	if(!a){
		a=[]
		g_level.colliders[cls]=a
	}
	var cc={"x":x,"y":y,"r0":r0,"r1":r1,"obj":obj}
	a.push(cc)
	obj.colliders.push(cc)
}

function CollideWithClass(obj, cls){
	var target=g_level.colliders[cls]||[]
	var ret=[];
	var i
	for(i in obj.colliders){
		var c0=obj.colliders[i]
		var reti=[];
		for(j in target){
			//this is an approximation, we should be fine with mostly horizontal ellipsoids
			//so don't add vertical ones
			var c1=target[j]
			var r0=(c0.r0+c1.r0)
			var r1=(c0.r1+c1.r1)
			var dx=(c0.x-c1.x)/r0
			var dy=(c0.y-c1.y)/r1
			if(dx*dx+dy*dy<1&&!c1.obj.dead){
				reti.push(c1.obj)
			}
		}
		ret.push(reti);
	}
	return ret;
}

var DEFAULT_PARAM={x:1,y:0,z:0}
function DrawImage(tname, fn, x,y,w,h, param){
	var packed=(g_texture_packing&&g_texture_packing[fn.toLowerCase()]);
	if(packed){
		g_techniques[tname].Draw(g_level.textures["bigtex.png"],
			x+packed.x0*w,y+packed.y0*h,
			w*packed.w,h*packed.h, 
			packed.u0,packed.v0,packed.du,packed.dv,
			(param&&param.depth)||0.5, param||DEFAULT_PARAM, x,y);
	}else{
		if(!g_level.textures[fn]){
			if(g_texture_packing){return;}
			throw "invalid texture "+fn;
		}
		g_techniques[tname].Draw(g_level.textures[fn], 
			x,y,w,h, 0,0,1,1, 
			(param&&param.depth)||0.5, param||DEFAULT_PARAM, x,y)
	}
}

function getUCoordinate(fn){
	var packed=(g_texture_packing&&g_texture_packing[fn.toLowerCase()]);
	if(packed){
		var u0=packed.u0-packed.x0/packed.w*packed.du;
		var du=1/packed.w*packed.du;
		return "(uv.x-float("+u0.toString()+"))*float("+(1/du).toString()+")";
	}else{
		return "uv.x";
	}
}

function AnimationPng(fn,frame){
	return fn+("0000"+(frame|0)).slice(-4)+".png"
}

function LoadAnimationSequence(fn,f0,df,f1){
	var i;
	for(i=f0;i<=f1;i+=df){
		g_new_level.texfiles.push(AnimationPng(fn,i))
	}
}

//todo: editor: designing with sprite / collide sphere
//todo: spawner object designing
//todo: sprite transition: current state (anim/frame) and goal state (semantic), rules + default
//repeated execution of enemy assets should work just fine

//////////////////////////////
//function loadjs(file,callback)
//function loadtex(file,callback)
//in release mode, we put all js code and the tex init together as a big functionn, loadLevel merely calls that
//make it more compact: each js provides a set of texfiles
LoadingBar=function(){
	this.t=0;
	this.depth=0.1;
}

LoadingBar.prototype.Simulate=function(){
	DrawImage("simple","assets/real/levels/loading.png", 0,0,1024,768, {"depth":this.depth,x:Math.sin(this.t/40)*0.3+0.7,y:0,z:0});
	this.t++;
	if(this.advance&&this.t>this.advance){
		this.dead=1;
		AdvanceToTheNextLevel(0);
	}
}

var g_all_textures={};
function loadLevel(jsfile){
	var p_js=0;
	var p_tex=0;
	var ClosureLoadJS,ClosureLoadTEX;
	if(g_level){
		g_level.CreateObject(LoadingBar);
	}
	g_new_level=new Level()
	g_new_level.timed_spawns=[];
	g_new_level.texfiles=[];
	g_new_level.texfiles.push("assets/real/levels/loading.png");
	if(g_texture_packing&&jsfile){
		g_new_level.texfiles.push("bigtex.png");
	}
	g_new_level.jsfiles=[jsfile];
	ClosureLoadJS=function(){
		if(p_js<g_new_level.jsfiles.length){
			loadjs(g_new_level.jsfiles[p_js++],ClosureLoadJS)
		}else{
			g_new_level.textures={};
			ClosureLoadTEX()
		}
	}
	ClosureLoadTEX=function(){
		if(p_tex<g_new_level.texfiles.length){
			if(g_new_level.textures[g_new_level.texfiles[p_tex]]){
				//already loaded
				p_tex++;
				ClosureLoadTEX();
				return;
			}
			loadtex(g_new_level.texfiles[p_tex],function(texid){
				var fn=g_new_level.texfiles[p_tex++];
				g_new_level.textures[fn]=texid;
				ClosureLoadTEX();
			})
		}else{
			//switch the levels, start playing
			g_new_level.Init();
			g_new_level.objects=g_level.objects.filter(function(ob){return !ob.dead&&ob.preserve_across_levels}).concat(g_new_level.new_objects);
			g_new_level.new_objects=[];
			g_level=g_new_level;
			g_new_level=null;
		}
	}
	if(g_texture_packing){
		g_new_level.textures=g_all_textures;
		if(jsfile){
			g_new_level.Init=(g_level_packing[jsfile.toLowerCase()]||function(){});
		}else{
			g_new_level.Init=function(){
				g_new_level.CreateObject(LoadingBar,{"advance":5});
				g_new_level.next_level_name="assets/real/levels/level_intro.js";
			};
		}
		ClosureLoadTEX();
	}else{
		ClosureLoadJS();
	}
}

if(g_texture_packing){
	//hack for the packed version
	g_new_level=new Level();
	g_new_level.texfiles=[];
	g_new_level.jsfiles=[];
}

simulateAndGenerateDrawcalls=function(){
	//get the colliders
	g_level.drawcalls=[];
	g_level.colliders={};
	g_level.new_objects=[];
	for(i in g_level.objects){
		g_level.objects[i].colliders=[];
		g_level.objects[i].seq_id=i;
		if(g_level.objects[i].GenerateColliders)g_level.objects[i].GenerateColliders()
	}
	//simulate/render all the objects, take frameskip into account, and use depth sort
	var obj_srt=[].concat(g_level.objects)
	obj_srt.sort(function(a,b){return ((b.depth||0)-(a.depth||0))||(a.seq_id-b.seq_id)})
	for(i in obj_srt){
		obj_srt[i].Simulate()
	}
	//remove dead objects
	g_level.objects=g_level.objects.filter(function(ob){return !ob.dead}).concat(g_level.new_objects);
	g_level.new_objects=[];
	//create the actual GL draw calls
	for(i in g_techniques){
		g_techniques[i].Flush()
	}
	for(i in g_level.drawcalls){
		g_level.drawcalls[i].seq_id=i;
	}
	g_level.drawcalls.sort(function(a,b){return ((b.depth||0)-(a.depth||0))||(a.seq_id-b.seq_id)});
}

var g_mouse_x=0,g_mouse_y=0,g_mouse_down=0;
function onrender(){
	var i;
	if(g_advance_level_delay>0){
		g_advance_level_delay--;
		if(g_advance_level_delay<=0){
			AdvanceToTheNextLevel();
		}
	}
	if(g_bgm_fname&&!g_sound_playing[g_bgm_fname]){PlaySoundEffect(g_bgm_fname,1)}
	glClearColor(0.05,0.0,0.125,1)
	glClearDepth(1)
	glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT|GL_STENCIL_BUFFER_BIT)
	simulateAndGenerateDrawcalls();
	//merge the vbos and send them to the GPU
	//array buffers: http://stackoverflow.com/questions/10786128/appending-arraybuffers
	if(!g_vbo){
		g_vbo=glCreateBuffer();
		g_vbodata=new Float32Array(MAX_VBO_FLOATS)
		glBindBuffer(GL_ARRAY_BUFFER,g_vbo);
		glBufferData(GL_ARRAY_BUFFER,g_vbodata,GL_STREAM_DRAW);
		var max_short_ebo=[];
		for(var i=0;i<65536;i+=4){
			max_short_ebo.push(i+0);
			max_short_ebo.push(i+1);
			max_short_ebo.push(i+2);
			max_short_ebo.push(i+2);
			max_short_ebo.push(i+3);
			max_short_ebo.push(i+0);
		}
		g_ebo=glCreateBuffer();
		g_ebodata=new Uint16Array(max_short_ebo);
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER,g_ebo);
		glBufferData(GL_ELEMENT_ARRAY_BUFFER,g_ebodata,GL_STATIC_DRAW);
	}
	var ofs=0;
	for(var i in g_level.drawcalls){
		g_vbodata.set(g_level.drawcalls[i].vbodata,ofs);
		ofs+=g_level.drawcalls[i].vbodata.length;
	}
	glBindBuffer(GL_ARRAY_BUFFER,g_vbo);
	glBufferSubData(GL_ARRAY_BUFFER,0,g_vbodata.subarray(0,ofs))
	glEnableVertexAttribArray(0);
	glEnableVertexAttribArray(1);
	glEnableVertexAttribArray(2);
	//glEnable(GL_DEPTH_TEST)
	glDisable(GL_DEPTH_TEST)
	glDepthFunc(GL_LEQUAL)
	glEnable(GL_BLEND)
	glBlendFunc(GL_ONE,GL_ONE_MINUS_SRC_ALPHA)
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER,g_ebo);
	//glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA)
	ofs=0;
	var w=c.width
	var h=c.height
	var scale=new Float32Array([2.0/w,-2.0/h])
	for(var i in g_level.drawcalls){
		var n=g_level.drawcalls[i].vbodata.length;
		glUseProgram(g_level.drawcalls[i].tech.shader)
		glBindTexture(GL_TEXTURE_2D,g_level.drawcalls[i].tex)
		glVertexAttribPointer(0,2,GL_FLOAT,false,32,ofs*4+0)
		glVertexAttribPointer(1,2,GL_FLOAT,false,32,ofs*4+8)
		glVertexAttribPointer(2,4,GL_FLOAT,false,32,ofs*4+16)
		glUniform2fv(g_level.drawcalls[i].tech.uloc,scale)
		glUniform1i(g_level.drawcalls[i].tech.uloc_tex,0)
		glDrawElements(GL_TRIANGLES,(n>>3)/2*3,GL_UNSIGNED_SHORT,0)
		glUseProgram(null)
		ofs+=n
	}
	//console.log(g_level.drawcalls.length);
	g_level.drawcalls=[];
	glUseProgram(null)
	requestAnimationFrame(onrender);
}

g_level=new Level()
requestAnimationFrame(onrender);

g_canvas.onmousemove=function(e){
	g_mouse_x=e.clientX/g_canvas.width*c.width;
	g_mouse_y=e.clientY/g_canvas.height*c.height;
	e.preventDefault();
}

g_canvas.onmousedown=function(e){
	g_mouse_down=1;
	e.preventDefault();
}

g_canvas.onmouseup=function(e){
	g_mouse_down=0;
	e.preventDefault();
}

document.ontouchmove=function(e){
	g_mouse_x=e.touches[0].clientX/g_canvas.width*c.width;
	g_mouse_y=e.touches[0].clientY/g_canvas.height*c.height;
	e.preventDefault();
}

document.ontouchstart=function(e){
	g_mouse_down=1;
	e.preventDefault();
}

document.ontouchend=function(e){
	g_mouse_down=0;
	e.preventDefault();
}

var g_keys={};
window.onkeydown=function(){
	g_keys[event.keyCode]=1;
}
window.onkeyup=function(){
	g_keys[event.keyCode]=0;
}

//loadLevel("assets/draft/level0.js")
if(!g_texture_packing){
	if(c.is_level_editor){
		loadLevel("assets/real/editor/level_editor.js")
	}else{
		loadLevel("assets/real/levels/level_intro.js")
	}
}
