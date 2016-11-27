g_new_level.jsfiles.push("assets/real/bullet/bullet.js")
g_new_level.jsfiles.push("assets/real/bullet/bullet_guided.js")
g_new_level.jsfiles.push("assets/real/bullet/ebullet.js")
g_new_level.jsfiles.push("assets/real/bullet/emissile.js")
g_new_level.jsfiles.push("assets/real/player/player.js")
g_new_level.jsfiles.push("assets/real/enemy_a/enemy_a.js")
g_new_level.jsfiles.push("assets/real/enemy_b/enemy_b.js")
g_new_level.jsfiles.push("assets/real/boss/boss.js")
g_new_level.jsfiles.push("assets/real/explosion/explosion.js")
g_new_level.jsfiles.push("assets/real/background/background_stars.js")
g_new_level.jsfiles.push("assets/real/powerup/pcube.js")

var g_div;
var g_temp_area;
var g_code_box;
///////////////
var g_path_id=0;
var g_current_path=[];
var g_current_enemy={"t0":0,"t1":150,"interval_count_class_template":"40,1,Enemy_B,{}"};
var g_current_frame=0;
var g_playing=0;
var g_enemy_simulated_frames=0;
var g_sel_id=-1;
var g_timeline_knobs=0;
var g_current_enemy_backup={};
var g_pinned_sel0=-1;
var g_pinned_sel1=-1;
var g_max_frames=5400;
var g_click_mode="";

addButton=function(stext,fonclick){
	var ndbtn=document.createElement('input');
	ndbtn.type="button";
	ndbtn.value=stext;
	ndbtn.onclick=fonclick;
	ndbtn.style.fontSize="24px";
	g_div.appendChild(ndbtn);
}

addNewLine=function(){
	g_div.appendChild(document.createElement('br'));
}

var g_in_animation_simulation=0;
simulateAllFrames=function(){
	g_level.timed_spawn_sorted=0;
	g_level.timed_spawns=[];
	g_new_level=g_level;
	//do the timed spawns
	var errored=0;
	try{
		eval("(function(){"+g_code_box.value+"})();");
	}catch(e){
		errored=1;
	}
	//actually simulate all the frames
	var frame_max=0;
	for(var i in g_level.timed_spawns){
		var s_i=g_level.timed_spawns[i];
		frame_max=max(frame_max,Math.ceil(s_i.t0+s_i.interval*(s_i.count-1)+s_i.obj_template.t_max));
	}
	frame_max++;
	g_in_animation_simulation=1;
	for(var i in g_level.objects){
		var obj_i=g_level.objects[i];
		obj_i.is_editor_obj=1;
	}
	var spawner=new StandardSpawner();
	g_level.objects.push(spawner);
	g_enemy_simulated_frames=[];
	for(var frame_id=0;frame_id<frame_max;frame_id++){
		g_level.drawcalls=[];
		if(!errored){
			try{
				simulateAndGenerateDrawcalls();
			}catch(e){
				errored=1;
			}
		}
		g_enemy_simulated_frames.push(g_level.drawcalls);
		g_level.drawcalls=[];
	}
	for(var i in g_level.objects){
		var obj_i=g_level.objects[i];
		if(!obj_i.is_editor_obj){obj_i.dead=1;}
	}
	spawner.dead=1;
	g_in_animation_simulation=0;
}

uirender=function(){
	var depth=0.98;
	DrawImage("simple","assets/real/editor/work_area.png", 0,0,1024,768, {"depth":depth,x:1,y:0,z:0})
	depth=0.96;
	if(g_current_path.length>=2){
		for(var t=0.0;t<1.0;t+=0.01){
			var pt=interpolatePath(g_current_path,t);
			DrawImage("simple","assets/real/editor/dot_small.png", pt.x-2,pt.y-2,5,5, {"depth":depth,x:1,y:0,z:0})
		}
	}
	for(var i in g_current_path){
		var pt=g_current_path[i];
		DrawImage("simple","assets/real/editor/dot_big.png", pt.x-7,pt.y-7,15,15, {"depth":depth,x:1,y:0,z:0})
	}
	//current-frame preview
	if(!g_enemy_simulated_frames){
		simulateAllFrames();
	}
	if(g_playing){
		g_current_frame++;
		if(g_current_frame>=g_enemy_simulated_frames.length){
			g_current_frame=0;
		}
	}
	if(g_enemy_simulated_frames[g_current_frame]){
		g_level.drawcalls=g_level.drawcalls.concat(g_enemy_simulated_frames[g_current_frame]);
	}
	//draw the timeline and stuff
	depth=0.96;
	var x0=g_current_enemy.t0/g_max_frames*1024;
	var x1=g_current_enemy.t1/g_max_frames*1024;
	var xc=g_current_frame/g_max_frames*1024;
	DrawImage("simple","assets/real/editor/timeline.png", 0,768-32,1024,32, {"depth":depth,x:0.75,y:0,z:0})
	DrawImage("simple","assets/real/editor/enemy_interval.png", x0,768-32,x1-x0,16, {"depth":depth,x:0.75,y:0,z:0})
	DrawImage("simple","assets/real/editor/enemy_interval.png", xc,768-16,2,16, {"depth":depth,x:1,y:0,z:0})
}

sqr=function(x){return x*x;}
sqrt=Math.sqrt;

UIToCode=function(){
	while (g_temp_area.lastChild) {
		g_temp_area.removeChild(g_temp_area.lastChild);
	}
	var sel0=g_pinned_sel0;if(sel0<0){sel0=g_code_box.selectionStart;}
	var sel1=g_pinned_sel1;if(sel1<0){sel1=g_code_box.selectionEnd;}
	var true_sel0=g_code_box.selectionStart;
	var true_sel1=g_code_box.selectionEnd;
	var scode=g_code_box.value;
	var s_replacement=0;
	var spath_list=["["];
	for(var i in g_current_path){
		var pt=g_current_path[i];
		if(i>0){spath_list.push(",");}
		spath_list.push("{");
		var is_first=1;
		for(var k in pt){
			if(!is_first){spath_list.push(",");}
			is_first=0;
			spath_list.push('"'+k+'":'+String(pt[k]));
		}
		spath_list.push("}");
	}
	spath_list.push("]");
	var s_path_str=spath_list.join("");
	s_replacement="timedSpawn("+
		String(Math.floor(g_current_enemy.t0))+","+
		String(Math.floor(g_current_enemy.t1))+","+
		s_path_str+","+
		g_current_enemy.interval_count_class_template+");\n";
	if(!s_replacement){return;}
	if(g_pinned_sel0<0){
		g_pinned_sel0=sel0;
	}
	g_pinned_sel1=g_pinned_sel0+s_replacement.length;
	if(true_sel0>=sel1){true_sel0+=s_replacement.length-(sel1-sel0);}
	if(true_sel1>=sel1){true_sel1+=s_replacement.length-(sel1-sel0);}
	g_code_box.value=scode.substr(0,sel0)+s_replacement+scode.substr(sel1);
	g_code_box.setSelectionRange(true_sel0,true_sel1);
	g_enemy_simulated_frames=0;
};

codeToUI=function(is_onchange){
	var sel0=g_code_box.selectionStart;
	var sel1=g_code_box.selectionEnd;
	var scode=g_code_box.value;
	if(is_onchange){
		g_enemy_simulated_frames=0;
		sel0=scode.lastIndexOf('\n',sel0)+1;
		sel1=scode.indexOf('\n',sel0)+1;
	}
	if(sel0>=sel1){return;}
	var ssel=scode.substr(sel0,sel1-sel0);
	var new_lines=ssel.match(/\n/g);
	if(!new_lines||new_lines.length!=1){return;}
	if(ssel.substr(ssel.length-1)!='\n'){return;}
	ssel=ssel.substr(0,ssel.length-1);
	if(ssel.indexOf('timedSpawn(')>=0){
		//enemy
		var s_matches=ssel.match(/timedSpawn\(([^,]*),([^,]*),(\[.*\]),(.*)\)/)
		if(s_matches&&s_matches.length>0){
			try{
				g_current_path=eval(s_matches[3]);
			}catch(e){
				return;
			}
			g_current_enemy={
				"t0":parseFloat(s_matches[1]),
				"t1":parseFloat(s_matches[2]),
				"interval_count_class_template":s_matches[4]};
			g_pinned_sel0=sel0;
			g_pinned_sel1=sel1;
			if(is_onchange){g_enemy_simulated_frames=0;}
			return;
		}
	}
	//////////////
}

uiclick=function(x,y){
	if(1){
		if(y>768-16){
			//timeline, current frame selection
			g_current_frame=Math.max(0,Math.floor(x*g_max_frames/1024));
			g_click_mode="framesel";
			return;
		}else if(y>768-32){
			//timeline dragging
			g_current_enemy_backup.t0=g_current_enemy.t0;
			g_current_enemy_backup.t1=g_current_enemy.t1;
			g_current_enemy_backup.x_base=x;
			var x0=g_current_enemy.t0/g_max_frames*1024;
			var x1=g_current_enemy.t1/g_max_frames*1024;
			if(x<=x0&&x>=x0-16){
				g_timeline_knobs=1;
			}else if(x>=x1&&x<=x1+16){
				g_timeline_knobs=2;
			}else if(x>x0&&x<x1){
				g_timeline_knobs=3;
			}
			g_click_mode="timeline";
			return;
		}
	}
	if(1){
		var sel_id=-1;
		var nearest_id=-1;
		var nearest_dist=9999;
		var n=g_current_path.length;
		for(var i=0;i<n;i++){
			var node_i=g_current_path[i];
			var dist=sqrt(sqr(x-node_i.x)+sqr(y-node_i.y));
			if(dist<15){
				sel_id=i;
			}
			if(i+1<n){
				var node_2=g_current_path[i+1];
				dist+=sqrt(sqr(x-node_2.x)+sqr(y-node_2.y));
			}else{
				dist*=2;
			}
			if(nearest_dist>dist){
				nearest_dist=dist;
				nearest_id=i;
			}
		}
		if(sel_id<0){
			//add a new vertex
			if(nearest_id<g_current_path.length-1&&nearest_id>=0){
				//insert-to-the-nearest
				g_current_path.push(0);
				for(var j=g_current_path.length-1;j>nearest_id;j--){
					g_current_path[j]=g_current_path[j-1];
				}
				g_current_path[nearest_id+1]={"x":x,"y":y};
				sel_id=nearest_id+1;
			}else{
				sel_id=g_current_path.length;
				g_current_path.push({"x":x,"y":y})
			}
		}
		g_sel_id=sel_id;
		UIToCode();
		g_click_mode="knob";
	}
}

uidrag=function(x,y){
	if(g_click_mode=="knob"){
		if(g_sel_id>=0&&g_current_path[g_sel_id]){
			//add a new vertex
			g_current_path[g_sel_id].x=x;
			g_current_path[g_sel_id].y=y;
			UIToCode();
		}
	}
	if(1){
		if(g_click_mode=="framesel"){
			//timeline, current frame selection
			g_current_frame=Math.max(0,Math.floor(x*g_max_frames/1024));
		}else if(g_click_mode=="timeline"){
			//timeline dragging
			var delta=(x-g_current_enemy_backup.x_base)*g_max_frames/1024;
			if(g_timeline_knobs&1){g_current_enemy.t0=g_current_enemy_backup.t0+delta;}
			if(g_timeline_knobs&2){g_current_enemy.t1=g_current_enemy_backup.t1+delta;}
			UIToCode();
		}
	}
}

g_canvas.onmousemove=function(e){
	g_mouse_x=e.clientX-100;
	g_mouse_y=e.clientY-100;
	e.preventDefault();
}

Editor=function(){
	this.was_mouse_down=0;
	window.onresize=null;
	a.style.width = (a.width = 1224) + 'px';
	a.style.height = (a.height = 968) + 'px';
	a.style.display="inline-block";
	c.width=1024;
	c.height=768;
	gl.viewport(100, 100, 1024,768);
	g_div=document.createElement('div');
	g_div.style.display="inline-block";
	g_div.style["vertical-align"]="top";
	//////////
	//addButton("Path",function(){
	//	g_tool_id="path";
	//	g_pinned_sel0=-1;
	//	g_pinned_sel1=-1;
	//	g_path_name="new_path_"+String(g_path_id++);
	//	UIToCode();
	//});
	addButton("Enemy",function(){
		g_pinned_sel0=-1;
		g_pinned_sel1=-1;
		g_current_path=[];
		g_current_enemy={"t0":g_current_frame,"t1":g_current_frame+150,"interval_count_class_template":"40,1,Enemy_B,{}"};
		UIToCode();
	});
	addNewLine();
	var fdelete=function(){
		if(g_sel_id>=0){g_current_path.splice(g_sel_id,1);g_sel_id--;}
		UIToCode();
	}
	addButton("Delete",fdelete);
	var fmirror=function(){
		for(var i in g_current_path){
			var pt=g_current_path[i];
			pt.y=768-pt.y;
		}
		UIToCode();
	}
	addButton("Mirror",fmirror);
	addButton("Play/Stop",function(){g_playing=1-g_playing;});
	addNewLine();
	g_code_box=document.createElement('textarea');
	g_code_box.style.fontFamily="Consolas";
	g_code_box.style.fontSize="24px";
	g_code_box.style.width="500px";
	g_code_box.style.height="800px";
	g_code_box.addEventListener("select", function(){codeToUI(0);},false);
	g_code_box.addEventListener('input', function(){codeToUI(1);}, false);
	g_div.appendChild(g_code_box);
	//////////
	g_temp_area=document.createElement('div');
	g_temp_area.style.display="block";
	g_div.appendChild(g_temp_area);
	//////////
	document.body.appendChild(g_div);
}
Editor.prototype.Simulate=function(){
	if(g_in_animation_simulation){return;}
	if(g_mouse_down&&!this.was_mouse_down){
		uiclick(g_mouse_x,g_mouse_y);
	}
	if(g_mouse_down){
		uidrag(g_mouse_x,g_mouse_y);
	}
	uirender();
	this.was_mouse_down=g_mouse_down;
}

g_new_level.Init=function(){
	g_new_level.CreateObject(Editor);
}

g_new_level.texfiles.push("assets/real/editor/dot_small.png")
g_new_level.texfiles.push("assets/real/editor/dot_big.png")
g_new_level.texfiles.push("assets/real/editor/dot_grey.png")
g_new_level.texfiles.push("assets/real/editor/work_area.png")
g_new_level.texfiles.push("assets/real/editor/timeline.png")
g_new_level.texfiles.push("assets/real/editor/enemy_interval.png")
g_new_level.next_level_name=0;
g_player={x:128,y:384};
