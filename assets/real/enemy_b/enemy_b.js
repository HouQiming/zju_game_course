var ASSET_PATH_ENEMY_B="assets/real/enemy_b/enemy_b";
Enemy_B=function(){
	this.t=0;
	this.x=c.width+100;
	this.y=0;
	this.depth=0.5;
	this.hp=20;
	this.rot_state=30;
	this.t_damage=0;
	this.gun_x=36-128;
	this.gun_y=41-48;
}
Enemy_B.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "enemy",this.x,this.y,128,48)
}

Enemy_B.prototype.Simulate=function(){
	//mouse control
	var t=this.t;
	if(this.path&&this.path.length){
		var pt=interpolatePath(this.path,t/this.t_max);
		if(t>0){
			var dy=(pt.y-this.y);
			if(this.rot_state>30.5){this.rot_state-=0.1;}
			if(this.rot_state<=29.5){this.rot_state+=0.1;}
			if(dy<-0.3&&this.rot_state>9){this.rot_state+=max(dy*0.5,-0.5);}
			if(dy>0.3&&this.rot_state<41){this.rot_state+=min(dy*0.5,0.5);}
		}
		this.x=pt.x;
		this.y=pt.y;
		if(t>this.t_max){
			this.dead=1;
		}
	}
	if(this.x<-200){
		this.dead=1;
	}
	DrawImage("damagable",AnimationPng(ASSET_PATH_ENEMY_B,min(max(Math.floor(this.rot_state)&-2,10),40)), this.x-128,this.y-48,255,95,{"depth":this.depth,x:1,y:(this.t_damage/10),z:0})
	//DrawImage("damagable",AnimationPng(ASSET_PATH_ENEMY_B,min(max(Math.floor(30)&-2,10),40)), this.x-128,this.y-48,255,95,{"depth":this.depth,x:1,y:0,z:0})
	if(this.t_damage>0){this.t_damage--;}
	///////////////////
	var hit_by_bullets=CollideWithClass(this,"bullet")[0]
	if(hit_by_bullets.length){
		for(i in hit_by_bullets){
			if(this.hp>0){this.DoDamage(hit_by_bullets[i].damage);hit_by_bullets[i].dead=1;}
		}
	}
	if(this.hp<=0){
		this.dead=1;
		g_level.CreateObject(Explosion,{"x":this.x,"y":this.y,"size":160});
		g_player.score+=100;
		if(this.drops_powerup){
			LeavePowerUp(this.x,this.y,this.drops_powerup);
		}
	}
	if(!this.dead){
		enemyShoot(this,this.shoots);
	}
	this.t++;
}

Enemy_B.prototype.DoDamage=function(damage){
	if(this.t>30){
		this.hp-=damage;
		PlaySoundEffect("assets/audio/hurt0.mp3");
	}
	this.t_damage=5;
}

;LoadAnimationSequence(ASSET_PATH_ENEMY_B, 10,2,40)
