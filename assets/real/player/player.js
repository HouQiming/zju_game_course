var ASSET_PATH_PLAYER="assets/real/player/player";
var ASSET_PATH_DIGITS="assets/real/player/digits";
var PLAYER_SPEED=105
var g_player;
g_techniques.powergauge=g_techniques.powergauge||create2DTechnique(
	"float u="+getUCoordinate("assets/real/powerup/gauge_full.png")+";"+
	"gl_FragColor=C_tex*(vec4(C_tex.w,C_tex.w,C_tex.w,1));"+
	"if(u>param.x){discard;}"+
	"if(!(gl_FragColor.w>0.0)){discard;}"
);

Player=function(){
	this.x=140;
	this.y=c.height/2;
	this.depth=0.4;
	this.preserve_across_levels=1;
	this.lives=3;
	this.grace_period=0;
	this.t=0;
	this.power=0;
	this.power_displayed=0;
	this.rot_state=25;
	this.score=0;
	//0.04, 0.96
}
Player.prototype.LoseLife=function(){
	g_level.CreateObject(Explosion,{"x":this.x,"y":this.y,"size":128});
	if(this.lives>0){
		this.lives--;
		this.grace_period=180;
	}else{
		this.dead=1;
		g_level.next_level_name="assets/real/levels/gameover.js";
		AdvanceToTheNextLevel(300);
	}
	LeavePowerUp(max(this.x,200),this.y,max(this.power*0.8,1.5));
	this.power=0;
	this.x=140;
	this.y=c.height/2;
	g_mouse_down=0;
}
Player.prototype.Simulate=function(){
	//mouse control
	var t=this.t++;if(this.t>=1024*2520){this.t=0;}
	var vx=g_mouse_x+70-this.x
	var vy=g_mouse_y-this.y
	var ilg=PLAYER_SPEED/Math.sqrt(vx*vx+vy*vy)
	var i
	var rot_goal=20
	if(ilg>1)ilg=1
	//console.log(this.x,this.y)
	if(g_mouse_down){
		vx*=ilg;
		vy*=ilg;
		rot_goal=Math.floor((20-vy*2)/2+0.5)*2
		if(rot_goal<5){rot_goal=5}
		if(rot_goal>45){rot_goal=45}
	}else{
		vx=0
		vy=0
	}
	this.x+=vx
	this.y+=vy
	if(this.rot_state>rot_goal){
		this.rot_state--
	}else if(this.rot_state<rot_goal){
		this.rot_state++
	}
	//
	var alpha=1
	if(this.grace_period>0){
		alpha=Math.cos(this.grace_period/2)*0.4+0.6
	}
	DrawImage("simple",AnimationPng(ASSET_PATH_PLAYER,this.rot_state|1), this.x-128,this.y-48,255,95, {"depth":this.depth,x:alpha,y:0,z:0})
	for(var i=0;i<this.lives;i++){
		DrawImage("simple","assets/real/player/icon.png", 10+i*44,8,48,18, {"depth":this.depth,x:1,y:0,z:0})
	}
	var score=this.score;
	var sx=1020;
	for(var i=0;i<7;i++){
		sx-=19;
		DrawImage("simple",AnimationPng(ASSET_PATH_DIGITS,score%10), sx,8,19,32, {"depth":this.depth,x:1,y:0,z:0})
		score/=10;
	}
	DrawImage("powergauge","assets/real/powerup/gauge_full.png", 0,24,256,32, {"depth":this.depth,x:this.power_displayed/5*0.92+0.04,y:0,z:0})
	DrawImage("simple","assets/real/powerup/gauge_empty.png", 0,24,256,32, {"depth":this.depth,x:1,y:0,z:0})
	this.power_displayed=lerp(this.power_displayed,this.power,0.05);
	if(this.grace_period>0){
		this.grace_period--
	}else{
		for(;;){
			var hit_ebullets=CollideWithClass(this,"ebullet")[0];
			if(hit_ebullets.length){
				//player has died
				for(i in hit_ebullets){
					hit_ebullets[i].dead=1;
				}
				this.LoseLife();
				break;
			}
			var hit_enemies=CollideWithClass(this,"enemy")[0];
			if(hit_enemies.length){
				//player died by hitting an enemy body
				for(i in hit_enemies){
					if(hit_enemies[i].DoDamage){hit_enemies[i].DoDamage(30);}
				}
				this.LoseLife();
				break;
			}
			var hit_enemies=CollideWithClass(this,"enemy_slammer")[0];
			if(hit_enemies.length){
				//player has died
				this.LoseLife();
				break;
			}
			break;
		}
	}
	var hit_powerups=CollideWithClass(this,"powerup")[0];
	if(hit_powerups.length){
		//eat the powerups
		PlaySoundEffect("assets/audio/pickup0.mp3");
		var power0=this.power;
		for(i in hit_powerups){
			hit_powerups[i].dead=1;
			this.power+=hit_powerups[i].powerup_amount;
			this.score+=hit_powerups[i].powerup_amount*500;
			this.power=min(this.power,5);
		}
		if(Math.floor(this.power)>Math.floor(power0)){
			PlaySoundEffect("assets/audio/powerup0.mp3");
		}
	}
	var dt=13;
	var damage_multiplier=1;
	if(this.power>=2){dt=8;}
	if(this.power>=5){
		dt=7;
	}
	if((t%dt)==0&&g_mouse_down){
		PlaySoundEffect("assets/audio/laser0.mp3");
		if(this.power>=1){
			g_level.CreateObject(Bullet,{"x":this.x+160-136,"y":this.y+54-48-4,"vx0":vx,"vy0":vy,"damage":10})
			g_level.CreateObject(Bullet,{"x":this.x+160-136,"y":this.y+54-48+4,"vx0":vx,"vy0":vy,"damage":10})
		}else{
			g_level.CreateObject(Bullet,{"x":this.x+160-128,"y":this.y+54-48,"vx0":vx,"vy0":vy,"damage":15})
		}
	}
	dt=50;
	if(this.power>=4){
		dt=21;
	}
	if((t%dt)==0&&g_mouse_down&&this.power>=3){
		PlaySoundEffect("assets/audio/laser0.mp3");
		g_level.CreateObject(GuidedBullet,{"x":this.x,"y":this.y+54-48,"vx":1,"vy":-3,"damage":7});
		g_level.CreateObject(GuidedBullet,{"x":this.x,"y":this.y+54-48,"vx":1,"vy":3,"damage":7});
		if(this.power>=5){
			g_level.CreateObject(GuidedBullet,{"x":this.x,"y":this.y+54-48,"vx":0.5,"vy":-8,"damage":5});
			g_level.CreateObject(GuidedBullet,{"x":this.x,"y":this.y+54-48,"vx":0.5,"vy":8,"damage":5});
		}
	}
	g_player=this;
}

Player.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "player",this.x,this.y,32,16)
}

;LoadAnimationSequence(ASSET_PATH_PLAYER, 5,2,45);
LoadAnimationSequence(ASSET_PATH_DIGITS, 0,1,9);
g_new_level.texfiles.push("assets/real/player/icon.png");
g_new_level.texfiles.push("assets/real/powerup/gauge_full.png");
g_new_level.texfiles.push("assets/real/powerup/gauge_empty.png");
