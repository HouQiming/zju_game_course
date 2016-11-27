
Gameover=function(){
	this.t=0;
	this.depth=0.1;
	this.downed=0;
}

Gameover.prototype.Simulate=function(){
	this.downed=this.downed||g_mouse_down;
	if(this.downed&&!g_mouse_down){this.dead=1;AdvanceToTheNextLevel();}
	DrawImage("simple","assets/real/levels/gameover.png", 0,0,1024,768, {"depth":this.depth,x:1,y:0,z:0})
	this.t++;
}

g_new_level.Init=function(){
g_new_level.next_level_name="assets/real/levels/level_intro.js";
SetBGM("assets/audio/Prologue.mp3");
g_new_level.CreateObject(Gameover)
}

;g_new_level.texfiles.push("assets/real/levels/gameover.png");
