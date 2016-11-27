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
var g_current_path=[];
var g_temp_area;
var g_code_box;

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

var g_enemy_simulated_frames=0;
simulateAllFrames=function(){
	g_level.timed_spawn_sorted=0;
	g_level.timed_spawns=[];
	g_new_level=g_level;
	//do the timed spawns
	var errored=0;
	try{
		console.log("(function(){"+g_code_box.value+"})();");
		eval("(function(){"+g_code_box.value+"})();");
	}catch(e){
		errored=1;
	}
	g_enemy_simulated_frames=1;//todo
}

UIToCode=function(){
	var scode=JSON.stringify(g_current_path);
	g_code_box.value='timedSpawn(100,250,'+scode+',40,5,Enemy_B,{drops_powerup:0.3});';
	g_enemy_simulated_frames=0;
};

codeToUI=function(){
	var ssel=g_code_box.value;
	if(ssel.indexOf('timedSpawn(')>=0){
		var s_matches=ssel.match(/timedSpawn\(([^,]*),([^,]*),(\[.*\]),(.*)\)/);
		g_current_path=eval("(function(){return "+s_matches[3]+";})()");
		console.log(g_current_path)
	}
	g_enemy_simulated_frames=0;
}

var dot_id=undefined;
uiclick=function(x,y){
	if(g_current_path.length>=2){
		for(var t=0.0;t<1.0;t+=0.0001){
			var pt=interpolatePath(g_current_path,t);
			var dx=x-pt.x;
			var dy=y-pt.y;
			var dist2=dx*dx+dy*dy;
			if(dist2<15*15){
				dot_id=Math.max(Math.min((Math.floor(t*g_current_path.length)|0),g_current_path.length-1),0);
				pt=g_current_path[dot_id];
				var dx=x-pt.x;
				var dy=y-pt.y;
				var dist2=dx*dx+dy*dy;
				if(dist2<15*15){
					//do nothing
				}else{
					dot_id++;
					for(var i=g_current_path.length-1;i>=dot_id;i--){
						g_current_path[i+1]=g_current_path[i];
					}
					g_current_path[dot_id]={"x":x,"y":y};
				}
				break;
			}
		}
	}
	if(dot_id==undefined){
		dot_id=g_current_path.length;
		g_current_path.push({"x":x,"y":y});
	}
	UIToCode();
}

uidrag=function(x,y){
	if(dot_id!=undefined){
		g_current_path[dot_id]={"x":x,"y":y};
	}
	UIToCode();
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
	if(!g_enemy_simulated_frames){
		simulateAllFrames();
	}
}

Editor=function(){
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
	/////////////
	addButton("Enemy",function(){
		g_current_path=[{x:100,y:100}];
		UIToCode();
	});
	addNewLine();
	/////////////
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
	if(g_mouse_down&&!this.was_mouse_down){
		uiclick(g_mouse_x,g_mouse_y);
	}
	if(g_mouse_down){
		uidrag(g_mouse_x,g_mouse_y);
	}else{
		dot_id=undefined;
	}
	uirender();
	this.was_mouse_down=g_mouse_down;
}

g_canvas.onmousemove=function(e){
	g_mouse_x=e.clientX-100;
	g_mouse_y=e.clientY-100;
	e.preventDefault();
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
