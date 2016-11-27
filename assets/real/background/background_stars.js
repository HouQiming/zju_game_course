BackgroundStars=function(){
	var n_stars=100;
	this.stars=[];
	this.t=0;
	this.depth=0.99;
	for(var i=0;i<n_stars;i++){
		this.stars.push({"x":Math.random()*c.width,"y":Math.random()*c.height,"r":Math.random()*3+1,"v":Math.random()*20+10,
				"a0":Math.random(),"a1":Math.random()})
		//this.stars.push({"x":Math.random()*c.width,"y":Math.random()*c.height,"r":14,"v":10,
		//		"a0":Math.random(),"a1":Math.random()})
		//this.stars.push({"x":Math.random()*c.width,"y":Math.random()*c.height,"r":6,"v":Math.random()*20+10,
		//		"a0":Math.random(),"a1":Math.random()})
	}
}
BackgroundStars.prototype.GenerateColliders=function(){
	//nothing
}

BackgroundStars.prototype.Simulate=function(){
	var stars=this.stars;
	var n=stars.length;
	var t=this.t;
	var renew_alpha=0;
	this.t+=1/20;
	if(this.t>=1.0){
		this.t=0.0;
		renew_alpha=1;
	}
	for(var i=0;i<n;i++){
		var star_i=stars[i];
		star_i.x-=star_i.v;
		if(renew_alpha){
			star_i.a0=star_i.a1;
			star_i.a1=Math.random();
		}
		var alpha=((star_i.a1-star_i.a0)*t+star_i.a0)*0.7+0.3;
		//it should be fine to draw a png
		DrawImage("simple","assets/real/background/star.png", star_i.x-star_i.r,star_i.y-star_i.r,star_i.r*2,star_i.r*2, {"depth":this.depth,x:alpha,y:0,z:0});
		if(star_i.x<-10){
			star_i.x=Math.random()*20+c.width;
			star_i.y=Math.random()*c.height;
			star_i.v=Math.random()*20+10;
			//star_i.v=10;
		}
	}
}

g_new_level.texfiles.push("assets/real/background/star.png")
