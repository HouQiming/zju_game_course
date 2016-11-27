Bullet=function(){
	this.t=0
	this.x=c.width+100
	this.y=0
	this.vx0=0
	this.vy0=0
	this.depth=0.5
}
Bullet.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "bullet",this.x,this.y,53,5)
}

Bullet.prototype.Simulate=function(){
	var t=this.t++;
	var vx=40
	var vy=0
	var i
	this.x+=vx;//+this.vx0;this.vx0*=0.9
	this.y+=vy;//+this.vy0;this.vy0*=0.9
	if(this.x>c.width+200){
		this.dead=1;
	}
	DrawImage("simple","assets/real/bullet/bullet-auqa.png", this.x-75,this.y-6,150,12, {"depth":this.depth,x:1,y:0,z:0})
}

g_new_level.texfiles.push("assets/real/bullet/bullet-auqa.png")
