GuidedBullet=function(){
	this.t=0
	this.x=c.width+100
	this.y=0
	this.vx=0
	this.vy=0
	this.depth=0.45
	this.radius=24
	this.r=0.8
	this.g=0.4
	this.b=0
}
GuidedBullet.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "bullet",this.x,this.y,this.radius*0.5,this.radius*0.5)
}

GuidedBullet.prototype.Simulate=function(){
	var t=this.t++;
	var r=this.radius
	this.x+=this.vx;
	this.y+=this.vy;
	var px=2048,py=384;
	var best_lg2=2048*2048;
	var enemy_colliders=g_level.colliders["enemy"];
	for(var i in enemy_colliders){
		var obj_i=enemy_colliders[i];
		var vx_ideal=obj_i.x-this.x;
		var vy_ideal=obj_i.y-this.y;
		var lg2=vx_ideal*vx_ideal+vy_ideal*vy_ideal;
		if(lg2<best_lg2){
			px=obj_i.x;
			py=obj_i.y;
			best_lg2=lg2;
		}
	}
	var vx_ideal=px-this.x;
	var vy_ideal=py-this.y;
	var lg=Math.sqrt(vx_ideal*vx_ideal+vy_ideal*vy_ideal);
	vx_ideal/=lg;
	vy_ideal/=lg;
	this.vx+=vx_ideal*0.3;this.vx=lerp(this.vx,vx_ideal*9,0.01);
	this.vy+=vy_ideal*0.3;this.vy=lerp(this.vy,vy_ideal*9,0.01);
	var vxn=this.vx;
	var vyn=this.vy;
	var ilg=Math.sqrt(vxn*vxn+vyn*vyn);
	if(ilg>0){ilg=1/ilg;}
	vxn*=ilg;
	vyn*=ilg;
	if(ilg<1/9){
		this.vx=vxn*9;
		this.vy=vyn*9;
	}
	if(this.x>1024+200||this.x<-200){
		this.dead=1;
	}
	if(this.y>768+200||this.y<-200){
		this.dead=1;
	}
	DrawImage("simple","assets/real/bullet/bullet-guided.png", this.x-16,this.y-16,32,32, 
		{"depth":this.depth,x:1,y:0,z:0,
			"rot_x":vxn,"rot_y":vyn,
			"anchor_x":16,"anchor_y":16
		})
}

;g_new_level.texfiles.push("assets/real/bullet/bullet-guided.png")
