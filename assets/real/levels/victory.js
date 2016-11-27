
Victory=function(){
	this.t=0;
	this.depth=0.1;
}

Victory.prototype.Simulate=function(){
	DrawImage("simple","assets/real/levels/victory.png", 0,0,1024,768, {"depth":this.depth,x:1,y:0,z:0})
	this.t++;
}

g_new_level.Init=function(){
	g_player.dead=1;
	g_new_level.next_level_name=0;
	SetBGM("assets/audio/win.mp3");
	g_new_level.CreateObject(Victory)
}

;g_new_level.texfiles.push("assets/real/levels/victory.png");
LoadAnimationSequence(ASSET_PATH_PLAYER, 5,2,45);
