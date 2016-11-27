EnemyBullet=function(){
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
EnemyBullet.prototype.GenerateColliders=function(){
	CreateCollideEllipsoid(this, "ebullet",this.x,this.y,this.radius*0.5,this.radius*0.5)
}

EnemyBullet.prototype.Simulate=function(){
	var t=this.t++;
	var r=this.radius
	if(!t){
		PlaySoundEffect("assets/audio/laser1.mp3");
	}
	this.x+=this.vx;
	this.y+=this.vy;
	if(this.x>1024+200||this.x<-200){
		this.dead=1;
	}
	if(this.y>768+200||this.y<-200){
		this.dead=1;
	}
	DrawImage("tinted","assets/real/bullet/ebullet.png", this.x-r,this.y-r,r*2,r*2, {"depth":this.depth,x:this.r,y:this.g,z:this.b})
}

g_new_level.texfiles.push("assets/real/bullet/ebullet.png")

////////////////////////
enemyShoot=function(shooter,modes){
	if(!modes){return;}
	for(var mode_i in modes){
		var mode=modes[mode_i];
		var speed=mode.speed;
		var t_max=0;
		var do_shooting=0;
		for(var i in mode.timing){
			var timing_i=mode.timing[i];
			var dt_i=timing_i[0]*timing_i[1]+timing_i[2];
			t_max+=dt_i;
		}
		var t_cur=shooter.t%t_max;
		for(var i in mode.timing){
			var timing_i=mode.timing[i];
			var dt_i=timing_i[0]*timing_i[1]+timing_i[2];
			if(t_cur>dt_i){
				t_cur-=dt_i;
				continue;
			}
			for(var j=1;j<=timing_i[1];j++){
				if(t_cur==timing_i[0]*j){
					do_shooting=1;
					break;
				}
			}
			t_cur=0;
			break;
		}
		if(!do_shooting){continue;}
		//////////////
		mode.x=((mode.gun_x||shooter.gun_x||0)+shooter.x);
		mode.y=((mode.gun_y||shooter.gun_y||0)+shooter.y)+(Math.random()-0.5)*2*(mode.randomize_gun||0);
		//if(hack_debug){
		//	console.log(mode.x,mode.y)
		//}
		if(mode.angles){
			for(var i in mode.angles){
				var th=3.1415926*2*(mode.angles[i]+(Math.random()-0.5)*2*(mode.randomize_angle||0));
				mode.vx=-speed*Math.cos(th);
				mode.vy=speed*Math.sin(th);
				g_level.CreateObject(EnemyBullet,mode);
			}
		}else if(mode.chase){
			var x_target=g_player.x+(Math.random()-0.5)*2*(mode.randomize_target||0);
			var y_target=g_player.y+(Math.random()-0.5)*2*(mode.randomize_target||0);
			var dx=x_target-mode.x;
			var dy=y_target-mode.y;
			var multiplier=speed/Math.sqrt(dx*dx+dy*dy);
			mode.vx=multiplier*dx;
			mode.vy=multiplier*dy;
			g_level.CreateObject(EnemyBullet,mode);
		}
	}
}
