g_new_level.jsfiles.push("assets/draft/bullet.js")
g_new_level.jsfiles.push("assets/draft/player.js")
g_new_level.jsfiles.push("assets/draft/enemy.js")

Spawner=function(){
	this.t=0
}
Spawner.prototype.Simulate=function(){
	var t=this.t++;
	if((t&127)==0){
		var enemy=g_level.CreateObject(Enemy)
		enemy.y=Math.random()*500
	}
}

g_new_level.texfiles.push("assets/draft/enemy.png")
g_new_level.Init=function(){
	g_new_level.CreateObject(Player)
	g_new_level.CreateObject(Spawner)
}
