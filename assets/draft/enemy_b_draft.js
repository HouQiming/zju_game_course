Enemy=function(){
	this.t=0
	this.x=c.width+100
	this.y=0
	this.depth=0.5
	this.hp=1
}
Enemy.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "enemy",this.x,this.y,128,48)
}

Enemy.prototype.Simulate=function(){
	//mouse control
	var t=this.t++;
	var vx=-10
	var vy=5*Math.sin(t/11)
	this.x+=vx
	this.y+=vy
	if(this.x<-200){
		this.dead=1;
	}
	DrawImage("simple","assets/real/enemy_b/enemy_b0026.png", this.x-128,this.y-48,255,95)
	var hit_by_bullets=CollideWithClass(this,"bullet")[0]
	if(hit_by_bullets.length){
		for(i in hit_by_bullets){
			if(this.hp>0){this.DoDamage(1)}
		}
		if(this.hp<=0){
			this.dead=1
		}
	}
}

Enemy.prototype.DoDamage=function(damage){
	this.hp-=damage
}

g_new_level.texfiles.push("assets/real/enemy_b/enemy_b0026.png")
