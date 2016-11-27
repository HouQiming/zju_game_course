
Intro=function(){
	this.t=0;
	this.rot_state=5;
	this.rot_sign=1;
	this.depth=0.1;
	this.downed=0;
}

Intro.prototype.Simulate=function(){
	this.downed=this.downed||g_mouse_down;
	if(this.downed&&!g_mouse_down){this.dead=1;AdvanceToTheNextLevel();}
	this.rot_state+=this.rot_sign*0.5;
	if(this.rot_state>=45){
		this.rot_state=45;
		this.rot_sign=-1;
	}
	if(this.rot_state<=4){
		this.rot_state=4;
		this.rot_sign=1;
	}
	DrawImage("simple","assets/real/levels/intro_0.png", 0,0,1024,768, {"depth":this.depth,x:1,y:0,z:0})
	DrawImage("simple","assets/real/levels/intro_1.png", 0,0,1024,768, {"depth":this.depth,x:Math.sin(this.t/40)*0.3+0.7,y:0,z:0})
	DrawImage("simple",AnimationPng("assets/real/player/player",this.rot_state|1), 233-128,212-48,255,95, {"depth":this.depth,x:1,y:0,z:0})
	this.t++;
}

g_new_level.Init=function(){
g_new_level.next_level_name="assets/real/levels/level0.js";
SetBGM("assets/audio/Prologue.mp3");
g_new_level.CreateObject(Intro)
}

;LoadAnimationSequence("assets/real/player/player", 5,2,45)
g_new_level.texfiles.push("assets/real/levels/intro_0.png");
g_new_level.texfiles.push("assets/real/levels/intro_1.png");
