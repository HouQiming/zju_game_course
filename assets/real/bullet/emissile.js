EnemyMissile=function(){
	this.t=0
	this.x=c.width+100
	this.y=0
	this.vx=0
	this.vy=0
	this.depth=0.45
	this.hp=30;
}
EnemyMissile.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "enemy",this.x,this.y,32,32)
}

EnemyMissile.prototype.Simulate=function(){
	var t=this.t++;
	var r=this.radius
	this.x+=this.vx;
	this.y+=this.vy;
	var px=g_player.x,py=g_player.y;
	var vx_ideal=px-this.x;
	var vy_ideal=py-this.y;
	var lg=Math.sqrt(vx_ideal*vx_ideal+vy_ideal*vy_ideal);
	vx_ideal/=lg;
	vy_ideal/=lg;
	this.vx+=vx_ideal*0.03;this.vx=lerp(this.vx,vx_ideal*3,0.003);
	this.vy+=vy_ideal*0.03;this.vy=lerp(this.vy,vy_ideal*3,0.003);
	var vxn=this.vx;
	var vyn=this.vy;
	var ilg=Math.sqrt(vxn*vxn+vyn*vyn);
	if(ilg>0){ilg=1/ilg;}
	vxn*=ilg;
	vyn*=ilg;
	if(ilg<1/3){
		this.vx=vxn*3;
		this.vy=vyn*3;
	}
	if(this.x>1024+200||this.x<-200){
		this.dead=1;
	}
	if(this.y>768+200||this.y<-200){
		this.dead=1;
	}
	DrawImage("damagable","assets/real/bullet/emissile.png", this.x-32,this.y-32,64,64,
		{"depth":this.depth,x:1,y:Math.min(Math.max((this.t_damage||0)/10,0),1),z:0,
			"rot_x":vxn,"rot_y":vyn,
			"anchor_x":32,"anchor_y":32
		});
	if(this.t_damage>0){this.t_damage--;}
	///////////////////
	var hit_by_bullets=CollideWithClass(this,"bullet")[0]
	if(hit_by_bullets.length){
		for(i in hit_by_bullets){
			if(this.hp>0){this.DoDamage(hit_by_bullets[i].damage);hit_by_bullets[i].dead=1;}
		}
	}
	this.hp-=0.05;
	if(this.hp<=0){
		this.dead=1;
		g_player.score+=10;
		g_level.CreateObject(Explosion,{"x":this.x,"y":this.y,"size":48});
	}
}

EnemyMissile.prototype.DoDamage=function(damage){
	if(this.t>30){
		this.hp-=damage;
		PlaySoundEffect("assets/audio/hurt0.mp3");
	}
	this.t_damage=5;
}

;g_new_level.texfiles.push("assets/real/bullet/emissile.png")
