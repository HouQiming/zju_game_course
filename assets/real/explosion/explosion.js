var ASSET_PATH_EXPLOSION="assets/real/explosion/explosion";
Explosion=function(){
	this.t=0
	this.x=0
	this.y=0
	this.size=64
	this.depth=0.2
	this.t_max=16
}
Explosion.prototype.GenerateColliders=function(){
	//nothing
}

Explosion.prototype.Simulate=function(){
	var t=this.t++;
	var i;
	var r=this.size/2;
	if(!t){
		PlaySoundEffect("assets/audio/explode0.mp3");
	}
	t=t*16/this.t_max;
	if(t>=16){
		this.dead=1;
	}else{
		DrawImage("simple",AnimationPng(ASSET_PATH_EXPLOSION,Math.floor(t)), this.x-r,this.y-r,this.size,this.size, {"depth":this.depth,x:1,y:0,z:0});
	}
}

BigExplosion=function(){
	this.t=0
	this.x=0
	this.y=0
	this.rx=0
	this.ry=0
	this.size=64
	this.count=8
	this.interval=10
}
BigExplosion.prototype.GenerateColliders=function(){
	//nothing
}

BigExplosion.prototype.Simulate=function(){
	var t=++this.t;
	if(t>=this.interval){
		var u,v;
		for(;;){
			u=(Math.random()-0.5)*2;
			v=(Math.random()-0.5)*2;
			if(u*u+v*v<1){break;}
		}
		g_level.CreateObject(Explosion,{"x":this.x+this.rx*u,"y":this.y+this.ry*v,"size":this.size});
		this.t=0;
		this.count--;
	}
	if(this.count<=0){
		this.dead=1;
	}
}

;LoadAnimationSequence(ASSET_PATH_EXPLOSION, 0,1,15)
