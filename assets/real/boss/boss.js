var WARP_IN_PERIOD_BOSS_BIGSHIP=90;
var LASER_FIRE_INTERVAL=0.3;
var LASER_AIM_INTERVAL=0.2;
var LASER_DROP_INTERVAL=0.03;
var BIGSHIP_ENGINE_LASER_POINTS=[
	{"x":499,"y":89},
	{"x":497,"y":117},
	{"x":496,"y":462},
	{"x":498,"y":489}];
BOSS_BIGSHIP=function(){
	SetBGM("assets/real/boss/HHavok-main.mp3");
	this.t=0;
	this.x=0;
	this.y=0;
	this.inited=0;
	this.depth=0.5;
	this.hp_low=[700,700,700];
	this.hp=[1500,1500,1600];
	//this.hp=[1,1,16000];
	this.t_damage=[0,0,0];
	this.redden_sign=[1,1,1];
	this.redden={"depth":this.depth,x:0,y:0,z:0};
	this.blacken={"depth":this.depth,x:0,y:0,z:0};
	this.is_boss=1;
	this.form_id=0;
	this.dying=0;
	this.n_warning_played=0;
	this.t_shoot0=0;
	/*
	two forms: before / after engine destruction
	form 0:
		fire engine-side laser
			(done) at each sweep period
			(too much) at low hp, also fire a bunch of rotating shots
		(test) orange light should not glow after destruction
		destroyed engines should become black
	form 1:
		cockpit angle shot + cockpit aiming laser
		random between
			half-a-screen slam + go back while firing seekers
			cockpit sweeping laser + weak seeker
		collision: disk approximation
	*/
	//"mirror" in editor
	//do we add a slamming attack?
	//enemy_a should flicker a bit, and we need enemy shooting sounds
	/*
	R 557-65 158-90 66 90
	G 557-66 502-90 66 90
	B 391-70 309-45 70 45
	*/
}
BOSS_BIGSHIP.prototype.GenerateColliders=function(){
	if(this.form_id>0){
		//cockpit
		CreateCollideEllipsoid(this, "enemy",this.x-450+391-70/2,this.y-300+309-45/2,70/2,45/2)
	}else{
		//engines
		CreateCollideEllipsoid(this, this.hp[0]>0?"enemy":"enemy_slammer",this.x-450+557-66/2,this.y-300+158-90/2,66/2,90/2)
		CreateCollideEllipsoid(this, this.hp[1]>0?"enemy":"enemy_slammer",this.x-450+557-66/2,this.y-300+502-90/2,66/2,90/2)
	}
	//the big body
	CreateCollideEllipsoid(this, "enemy_slammer",this.x-450+572,this.y-300+335,250,152);
	CreateCollideEllipsoid(this, "enemy_slammer",this.x-450+314,this.y-300+284,112,40);
	if(this.has_engine_laser){
		for(var i in BIGSHIP_ENGINE_LASER_POINTS){
			var pt=BIGSHIP_ENGINE_LASER_POINTS[i];
			if(this.hp[i>>1]<=0){continue;}
			CreateCollideEllipsoid(this, "enemy_slammer",this.x-450+pt.x-512,this.y-300+pt.y,512,7);
		}
	}
}

g_techniques.maskhl=g_techniques.maskhl||create2DTechnique(
	"gl_FragColor=dot(C_tex.xyz,param.xyz)*vec4(1.0,1.0,1.0,1.0);"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);
g_techniques.maskhl2=g_techniques.maskhl2||create2DTechnique(
	"gl_FragColor=dot(C_tex.xyz,param.xyz)*vec4(1.0,0.5,0.2,0.0);"+
	"if(!(gl_FragColor.x>0.0)){discard;}"
);
g_techniques.maskblacken=g_techniques.maskblacken||create2DTechnique(
	"gl_FragColor=dot(C_tex.xyz,param.xyz)*vec4(0.0,0.0,0.0,1.0);"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);
g_techniques.maskredden=g_techniques.maskredden||create2DTechnique(
	"gl_FragColor=dot(C_tex.xyz,param.xyz)*vec4(0.5,0.0,0.0,1.0);"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);
g_techniques.shooting_laser=g_techniques.shooting_laser||create2DTechnique(
	"float u="+getUCoordinate("assets/real/boss/fatlaser.png")+";"+
	"gl_FragColor=C_tex*(vec4(C_tex.w,C_tex.w,C_tex.w,1));"+
	"if(u<1.0-param.x){discard;}"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);
g_techniques.shot_laser=g_techniques.shot_laser||create2DTechnique(
	"float u="+getUCoordinate("assets/real/boss/fatlaser.png")+";"+
	"gl_FragColor=C_tex*(vec4(C_tex.w,C_tex.w,C_tex.w,1));"+
	"if(u>param.x){discard;}"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);

BOSS_BIGSHIP.prototype.Simulate=function(){
	var t=this.t;
	var pt0=interpolatePath(this.path,0,1);
	if(!this.inited){
		this.inited=1;
		this.x=1280;
		this.y=pt0.y;
	}
	var param;
	if(this.form_id==0){
		if(t<WARP_IN_PERIOD_BOSS_BIGSHIP){
			this.x=lerp(this.x,pt0.x,0.1);
			this.y=lerp(this.y,pt0.y,0.1);
		}else if(this.path&&this.path.length){
			var pt=interpolatePath(this.path,(max(t-WARP_IN_PERIOD_BOSS_BIGSHIP,0)%this.t_max)/this.t_max,1);
			this.x=pt.x;
			this.y=pt.y;
		}
	}else{
		var tf=(t*1.5)/this.t_max;
		var pt=interpolatePath(this.path,tf-Math.floor(tf),1);
		this.x=pt.x;
		this.y=pt.y;
	}
	DrawImage("simple","assets/real/boss/boss.png", this.x-450,this.y-300,900,600,{"depth":this.depth,x:1-(this.dying/60)*(this.dying/60),y:0,z:0})
	for(var i=0;i<3;i++){
		if(this.t_damage[i]>0){
			this.t_damage[i]--;
		}
	}
	//low hp parts glow red
	var redden=this.redden;
	if(this.hp[0]<=this.hp_low[0]){redden.x+=this.redden_sign[0]*0.003;if(redden.x>0.2){this.redden_sign[0]=-1;redden.x=0.2;}if(redden.x<0){this.redden_sign[0]=1;redden.x=0;}}if(this.hp[0]<=0){redden.x=0;}
	if(this.hp[1]<=this.hp_low[1]){redden.y+=this.redden_sign[1]*0.003;if(redden.y>0.2){this.redden_sign[1]=-1;redden.y=0.2;}if(redden.y<0){this.redden_sign[1]=1;redden.y=0;}}if(this.hp[1]<=0){redden.y=0;}
	if(this.hp[2]<=this.hp_low[2]){redden.z+=this.redden_sign[2]*0.003;if(redden.z>0.2){this.redden_sign[2]=-1;redden.z=0.2;}if(redden.z<0){this.redden_sign[2]=1;redden.z=0;}}if(this.hp[2]<=0){redden.z=0;}
	if(redden.x||redden.y||redden.z){
		DrawImage("maskredden","assets/real/boss/boss_mask.png", this.x-450,this.y-300,900,600,redden);
	}
	//destroyed parts become black
	var blacken=this.blacken;
	if(this.hp[0]<=0){blacken.x=min(blacken.x+0.1,0.5);}
	if(this.hp[1]<=0){blacken.y=min(blacken.y+0.1,0.5);}
	if(this.hp[2]<=0){blacken.z=min(blacken.z+0.1,0.5);}
	if(blacken.x||blacken.y||blacken.z){
		DrawImage("maskblacken","assets/real/boss/boss_mask.png", this.x-450,this.y-300,900,600,blacken);
	}
	//periodically highlight the vulnerable areas? no need for now
	DrawImage("maskhl","assets/real/boss/boss_mask.png", this.x-450,this.y-300,900,600,{"depth":this.depth,x:this.t_damage[0]/10,y:this.t_damage[1]/10,z:this.t_damage[2]/10});
	///////////////////
	var collisions=CollideWithClass(this,"bullet");
	if(this.form_id==0){
		if(t>=WARP_IN_PERIOD_BOSS_BIGSHIP){
			//only the engines can be hurt
			for(var engine_id=0;engine_id<2;engine_id++){
				var hit_by_bullets=collisions[engine_id];
				if(hit_by_bullets.length){
					for(var i in hit_by_bullets){
						if(this.hp[engine_id]>0){
							this.hp[engine_id]-=hit_by_bullets[i].damage;
							this.t_damage[engine_id]=8;
							PlaySoundEffect("assets/audio/hurt0.mp3");
							hit_by_bullets[i].dead=1;
							if(this.hp[engine_id]<=0){
								//engine explosion
								g_player.score+=2000;
								g_level.CreateObject(BigExplosion,{"x":this.x-450+557-66/2,"y":this.y+[-300+158-90/2,-300+502-90/2][engine_id],"rx":66/2,"ry":90/2});
								LeavePowerUp(this.x-450+557-66/2,this.y+[-300+158-90/2,-300+502-90/2][engine_id],0.6);
							}
						}
					}
				}
			}
			//the engines shoot
			var mode_form0_seeker=[
				{timing:[[0,0,150],[40,3,10]],gun_x:-450+557-66/2,gun_y:-300+158-90/2, chase:1,speed:5, radius:12,randomize_target:20},
				{timing:[[0,0,130],[40,3,30]],gun_x:-450+557-66/2,gun_y:-300+502-90/2, chase:1,speed:5, radius:12,randomize_target:20}]
			if(this.hp[0]>0){enemyShoot(this,[mode_form0_seeker[0]]);}
			if(this.hp[1]>0){enemyShoot(this,[mode_form0_seeker[1]]);}
			//the lasers, fire every half loop
			var t_laser=(max(t-WARP_IN_PERIOD_BOSS_BIGSHIP,0)%(this.t_max/2))/(this.t_max/2);
			this.has_engine_laser=0;
			if(t_laser+LASER_FIRE_INTERVAL>1.0){
				//actually shoot the laser, need a short fade-in period
				this.has_engine_laser=1;
				var mode_form0_angular=[
					{timing:[         [1,1,30]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[-5/25],speed:6, radius:6, r:1,g:0.8,b:0.2},
					{timing:[[0,0,5 ],[1,1,25]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[-3/25],speed:6, radius:6, r:1,g:0.8,b:0.2},
					{timing:[[0,0,10],[1,1,20]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[-1/25],speed:6, radius:6, r:1,g:0.8,b:0.2},
					{timing:[[0,0,15],[1,1,15]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[ 1/25],speed:6, radius:6, r:1,g:0.8,b:0.2},
					{timing:[[0,0,20],[1,1,10]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[ 3/25],speed:6, radius:6, r:1,g:0.8,b:0.2},
					{timing:[[0,0,25],[1,1, 5]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[ 5/25],speed:6, radius:6, r:1,g:0.8,b:0.2}];
				enemyShoot(this,mode_form0_angular);
				for(var i in BIGSHIP_ENGINE_LASER_POINTS){
					var pt=BIGSHIP_ENGINE_LASER_POINTS[i];
					if(this.hp[i>>1]<=0){continue;}
					DrawImage("shooting_laser","assets/real/boss/fatlaser.png",this.x-450+pt.x-1024,this.y-300+pt.y-8,1024,16,{"depth":this.depth,x:1,y:0,z:0});
				}
				PlaySoundEffect("assets/real/boss/fatlaser_hit.mp3",1);
				this.n_warning_played=0;
			}
			if(t_laser+LASER_AIM_INTERVAL+LASER_FIRE_INTERVAL>1.0){
				//make the orange lights glow
				var t_glow=min((t_laser-(1.0-(LASER_AIM_INTERVAL+LASER_FIRE_INTERVAL)))/LASER_AIM_INTERVAL,1.0);
				var glowness=1.5*Math.sqrt(max(t_glow,0));
				DrawImage("maskhl2","assets/real/boss/boss_mask_laser2.png", this.x-450,this.y-300,900,600,{"depth":this.depth,x:(this.hp[0]>0?glowness:0),y:(this.hp[1]>0?glowness:0),z:glowness});
				for(var i in BIGSHIP_ENGINE_LASER_POINTS){
					var pt=BIGSHIP_ENGINE_LASER_POINTS[i];
					if(this.hp[i>>1]<=0){continue;}
					DrawImage("shooting_laser","assets/real/boss/fatlaser.png",this.x-450+pt.x-1024,this.y-300+pt.y-8,1024,16,{"depth":0.3,x:max(t_glow-0.9,0)*10,y:0,z:0});
				}
				if(!(t_laser+LASER_FIRE_INTERVAL>1.0)){
					if(this.n_warning_played<2){
						this.n_warning_played+=PlaySoundEffect("assets/real/boss/fatlaser_warning.mp3",1);
					}else{
						if(t_glow>0.9){PlaySoundEffect("assets/real/boss/fatlaser_hit.mp3",1);}
					}
				}
			}
			if(t_laser<LASER_DROP_INTERVAL&&t-WARP_IN_PERIOD_BOSS_BIGSHIP>this.t_max/2){
				var t_drop=1-t_laser/LASER_DROP_INTERVAL;
				var glowness=1.5*t_drop;
				DrawImage("maskhl2","assets/real/boss/boss_mask_laser2.png", this.x-450,this.y-300,900,600,{"depth":this.depth,x:(this.hp[0]>0?glowness:0),y:(this.hp[1]>0?glowness:0),z:glowness});
				for(var i in BIGSHIP_ENGINE_LASER_POINTS){
					var pt=BIGSHIP_ENGINE_LASER_POINTS[i];
					if(this.hp[i>>1]<=0){continue;}
					DrawImage("shot_laser","assets/real/boss/fatlaser.png",this.x-450+pt.x-1024,this.y-300+pt.y-8,1024,16,{"depth":0.3,x:t_drop,y:0,z:0});
				}
			}
			//change form after destruction
			if(this.hp[0]<=0&&this.hp[1]<=0){
				this.form_id++;
				this.t=Math.ceil((max(this.t-WARP_IN_PERIOD_BOSS_BIGSHIP,0)%this.t_max)/1.5);
				this.t_shoot0=this.t;
			}
		}
	}else{
		//only the cockpit can be hurt
		if(!this.dying){
			var hit_by_bullets=collisions[0];
			if(hit_by_bullets.length){
				for(var i in hit_by_bullets){
					if(this.hp[2]>0){
						this.hp[2]-=hit_by_bullets[i].damage;
						this.t_damage[2]=8;
						PlaySoundEffect("assets/audio/hurt0.mp3");
						hit_by_bullets[i].dead=1;
					}
				}
			}
			//the shots
			var mode_form1_angular=[
				{timing:[[0,0,10 ],[6,6,130]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[-2/12],speed:6, radius:12,randomize_angle:0.02},
				{timing:[[0,0,40 ],[6,6,100]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[-1/12],speed:6, radius:12,randomize_angle:0.02},
				{timing:[[0,0,70 ],[6,6, 70]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[ 0/12],speed:6, radius:12,randomize_angle:0.02},
				{timing:[[0,0,100],[6,6, 40]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[ 1/12],speed:6, radius:12,randomize_angle:0.02},
				{timing:[[0,0,130],[6,6, 10]],gun_x:-450+391-70/2,gun_y:-300+309-45/2, angles:[ 2/12],speed:6, radius:12,randomize_angle:0.02},
			];
			var bk=this.t;this.t-=this.t_shoot0;
			enemyShoot(this,mode_form1_angular);
			//missiles
			if(this.t>333&&this.t%333<111&&this.t%333%20==0){
				g_level.CreateObject(EnemyMissile,{"x":this.x-450+500,"y":this.y-300+309-45/2,"vx":(-Math.random())*3,"vy":(Math.random()*2-1)*3});
			}
			this.t=bk;
		}
		//dying
		if(this.hp[2]<=0){
			//a big explosion
			if(!this.dying){
				g_player.score+=10000;
				g_level.CreateObject(BigExplosion,{"x":this.x-450+572,"y":this.y-300+335,"rx":250,"ry":152,"size":256,"count":12,"interval":7});
				LeavePowerUp(this.x-450+572,this.y-300+335,2.5);
				this.dying=1;
			}
			this.dying++;
			if(this.dying>=60){this.dead=1;}
		}
	}
	this.t++;
}

;
g_new_level.texfiles.push("assets/real/boss/boss.png")
g_new_level.texfiles.push("assets/real/boss/boss_mask.png")
g_new_level.texfiles.push("assets/real/boss/boss_mask_laser2.png")
g_new_level.texfiles.push("assets/real/boss/fatlaser.png")
