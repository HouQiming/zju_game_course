var ASSET_PATH_POWERCUBE="assets/real/powerup/pcube";
PowerCube=function(){
	this.t=0;
	this.x=c.width+100;
	this.y=0;
	this.vx=-3;
	this.vy=0;
	this.depth=0.4;
	this.frame_id=Math.floor(Math.random()*59.5)+1;
	this.radius=24;
	this.powerup_amount=1;
}
PowerCube.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "powerup",this.x,this.y,this.radius,this.radius)
}

PowerCube.prototype.Simulate=function(){
	//mouse control
	var t=this.t;
	var px=g_player.x;
	var py=g_player.y;
	var vx=this.vx;
	var vy=this.vy;
	var vx_ideal=px-this.x;
	var vy_ideal=py-this.y;
	var lg=Math.sqrt(vx_ideal*vx_ideal+vy_ideal*vy_ideal);
	if(lg<150){
		vx_ideal/=lg;
		vy_ideal/=lg;
		vx+=vx_ideal*0.5;
		vy+=vy_ideal*0.5;
	}
	this.vx=lerp(vx,-3,0.08);
	this.vy=lerp(vy,0,0.08);
	this.x+=this.vx;
	this.y+=this.vy;
	if(this.x<-100){
		this.dead=1;
	}
	DrawImage("damagable",AnimationPng(ASSET_PATH_POWERCUBE,this.frame_id), 
		this.x-this.radius*2,this.y-this.radius*2,
		this.radius*2,this.radius*2,
		{"depth":this.depth,x:1,y:(-Math.cos(this.t/15)*0.2+0.2),z:0});
	DrawImage("simple",AnimationPng(ASSET_PATH_POWERCUBE,this.frame_id), 
		this.x-this.radius*2,this.y-this.radius*2,
		this.radius*2,this.radius*2,
		{"depth":this.depth,x:1,y:0,z:0});
	this.frame_id++;
	if(this.frame_id>60){this.frame_id=1;}
	this.t++;
}

;LoadAnimationSequence(ASSET_PATH_POWERCUBE, 1,1,60)

LeavePowerUp=function(x,y,n){
	var i;
	for(i=0;i+1<=n;i++){
		g_level.CreateObject(PowerCube,{"x":x,"y":y,"vx":1.5*(Math.random()*2-1),"vy":1.5*(Math.random()*2-1),"powerup_amount":1,"radius":24})
	}
	for(;i<n;i+=0.1){
		g_level.CreateObject(PowerCube,{"x":x,"y":y,"vx":4*(Math.random()*2-1),"vy":4*(Math.random()*2-1),"powerup_amount":0.1001,"radius":12})
	}
}
