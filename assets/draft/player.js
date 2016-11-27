var PLAYER_SPEED=15
Player=function(){
	this.x=80
	this.y=200
	this.depth=0
	this.preserve_across_levels=1
	this.lives=5
	this.grace_period=0
	this.t=0
}
Player.prototype.LoseLife=function(){
	if(this.lives>0){
		this.lives--;
		this.grace_period=60;
	}else{
		this.dead=1;
	}
	this.x=80
	this.y=200
	g_mouse_down=0
}
Player.prototype.Simulate=function(){
	//mouse control
	var t=this.t++;if(this.t>=1048576){this.t=0;}
	var vx=g_mouse_x-this.x
	var vy=g_mouse_y-this.y
	var ilg=PLAYER_SPEED/Math.sqrt(vx*vx+vy*vy)
	var i
	if(ilg>1)ilg=1
	if(g_mouse_down){
		this.x+=vx*ilg
		this.y+=vy*ilg
	}
	//
	var alpha=1
	if(this.grace_period>0){
		alpha=Math.cos(this.grace_period/2)*0.3+0.7
	}
	DrawImage("simple","assets/draft/player.png", this.x-72,this.y-72,144,144, {x:alpha,y:0,z:0})
	for(i=0;i<this.lives;i++){
		DrawImage("simple","assets/draft/player.png", i*32,0,32,32)
	}
	if(this.grace_period>0){
		this.grace_period--
	}else{
		var hit_enemies=CollideWithClass(this,"enemy")[0]
		if(hit_enemies.length){
			//player has died
			for(i in hit_enemies){
				hit_enemies[i].DoDamage(1)
			}
			this.LoseLife()
		}
	}
	if((t%7)==0&&g_mouse_down){
		g_level.CreateObject(Bullet,{"x":this.x,"y":this.y});
	}
}

Player.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "player",this.x,this.y,32,32)
}

g_new_level.texfiles.push("assets/draft/player.png")
