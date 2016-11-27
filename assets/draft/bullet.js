Bullet=function(){
	this.t=0
	this.x=c.width+100
	this.y=0
	this.depth=0.5
}
Bullet.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "bullet",this.x,this.y,12,12)
}

Bullet.prototype.Simulate=function(){
	var t=this.t++;
	var vx=20
	var vy=0
	var i
	this.x+=vx
	this.y+=vy
	if(this.x>c.width+200){
		this.dead=1;
	}
	//for(i=4;i>=1;i--){
	//	DrawImage("simple","assets/draft/bullet.png", this.x-16-12*i,this.y-16,32,32,{x:(4-i)/4,y:0,z:0})
	//}
	DrawImage("simple","assets/draft/bullet.png", this.x-16,this.y-16,32,32)
}

g_new_level.texfiles.push("assets/draft/bullet.png")
