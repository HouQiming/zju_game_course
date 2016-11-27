var ASSET_PATH_ENEMY_A="assets/real/enemy_a/enemy_a";
var WARP_IN_PERIOD_ENEMY_A=90;
var FADE_IN_PERIOD_ENEMY_A=10;
Enemy_A=function(){
	this.t=0;
	this.x=0;
	this.y=0;
	this.inited=0; 
	this.depth=0.5;
	this.hp=900;
	this.rot_state=24;
	this.t_damage=0;
	this.gun_x=233-256;
	this.gun_y=90-96;
	this.is_boss=1;
}
Enemy_A.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "enemy",this.x,this.y-96+59,200,58)
}

Enemy_A.prototype.Simulate=function(){
	var t=this.t;
	var pt0=interpolatePath(this.path,0,1);
	if(!this.inited){
		this.inited=1;
		this.x=1280;
		this.y=pt0.y;
		this.n_warning_played=0;
	}
	if(this.n_warning_played<2){
		this.n_warning_played+=PlaySoundEffect("assets/real/boss/fatlaser_warning.mp3",1);
	}
	var param;
	if(t<WARP_IN_PERIOD_ENEMY_A){
		this.x=lerp(this.x,pt0.x,0.08);
		this.y=lerp(this.y,pt0.y,0.08);
		param={"depth":this.depth,x:min(t/30,1),y:Math.cos(t/FADE_IN_PERIOD_ENEMY_A*3.1415926)*0.5+0.5,z:0};
	}else if(this.path&&this.path.length){
		var pt=interpolatePath(this.path,(max(t-WARP_IN_PERIOD_ENEMY_A,0)%this.t_max)/this.t_max,1);
		if(t>0){
			var dy=(this.y-pt.y);
			if(this.rot_state>24.5){this.rot_state-=0.1;}
			if(this.rot_state<=23.5){this.rot_state+=0.1;}
			if(dy<-0.3&&this.rot_state>15){this.rot_state+=max(dy*0.5,-0.5);}
			if(dy>0.3&&this.rot_state<31){this.rot_state+=min(dy*0.5,0.5);}
		}
		this.x=pt.x;
		this.y=pt.y;
		param={"depth":this.depth,x:1,y:(this.t_damage/10),z:0};
	}
	DrawImage("damagable",AnimationPng(ASSET_PATH_ENEMY_A,min(max(Math.floor(this.rot_state)&-2,16),30)), this.x-256,this.y-96,511,191,param)
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
		g_level.CreateObject(Explosion,{"x":this.x,"y":this.y,"size":320});
		g_player.score+=3000;
		if(this.drops_powerup){
			LeavePowerUp(this.x,this.y,this.drops_powerup);
		}
	}
	if(!this.dead&&this.t>WARP_IN_PERIOD_ENEMY_A){
		this.t-=WARP_IN_PERIOD_ENEMY_A;
		enemyShoot(this,this.shoots);
		this.t+=WARP_IN_PERIOD_ENEMY_A;
	}
	this.t++;
}

Enemy_A.prototype.DoDamage=function(damage){
	if(this.t>=WARP_IN_PERIOD_ENEMY_A){
		this.hp-=damage;
		this.t_damage=5;
		PlaySoundEffect("assets/audio/hurt0.mp3");
	}
}

;LoadAnimationSequence(ASSET_PATH_ENEMY_A, 16,2,30)
