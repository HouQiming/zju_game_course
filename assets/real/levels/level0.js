g_new_level.jsfiles.push("assets/real/bullet/bullet.js")
g_new_level.jsfiles.push("assets/real/bullet/bullet_guided.js")
g_new_level.jsfiles.push("assets/real/bullet/ebullet.js")
g_new_level.jsfiles.push("assets/real/bullet/emissile.js")
g_new_level.jsfiles.push("assets/real/player/player.js")
g_new_level.jsfiles.push("assets/real/enemy_a/enemy_a.js")
g_new_level.jsfiles.push("assets/real/enemy_b/enemy_b.js")
g_new_level.jsfiles.push("assets/real/boss/boss.js")
g_new_level.jsfiles.push("assets/real/explosion/explosion.js")
g_new_level.jsfiles.push("assets/real/background/background_stars.js")
g_new_level.jsfiles.push("assets/real/powerup/pcube.js")

g_new_level.Init=function(){
//g_new_level.next_level_name="assets/real/levels/level1.js";
g_new_level.next_level_name="assets/real/levels/victory.js";
g_new_level.CreateObject(Player,{"x":140,"y":c.height/2})
g_new_level.CreateObject(BackgroundStars)
g_new_level.CreateObject(StandardSpawner)
SetBGM("assets/audio/Jumpshot.mp3");
///////////////////
//timedSpawn(3131-3131,4414-3131,[{"x":822,"y":429},{"x":822,"y":342},{"x":695,"y":270},{"x":607,"y":390},{"x":699,"y":512}],40,1,BOSS_BIGSHIP,{});
var mode_frontal_weak=[{timing:[[0,0,30],[40,2,9999]],angles:[0],speed:5, radius:12,randomize_angle:0.03}];
var mode_frontal_strong=[{timing:[[20,3,70]],angles:[-3/17,-1/17,1/17,3/17],speed:11, radius:6,randomize_angle:0.01}];
var mode_chase_weak=[{timing:[[20,1,9999]],chase:1,speed:4, radius:12,randomize_target:5}];
var mode_chase_strong=[{timing:[[15,2,30]],chase:1,speed:7, radius:12,randomize_target:5}];
var mode_boss=[
	{timing:[[0,0,10],[30,3,110]],angles:[-1/8,1/8],speed:8, radius:16,randomize_angle:0.03},
	{timing:[[0,0,90],[10,8,130]],gun_x:46-256,gun_y:46-96, chase:1,speed:5, radius:12,randomize_target:5}]
timedSpawn(100,250,[{"x":1249,"y":270},{"x":-128,"y":270}],40,5,Enemy_B,{drops_powerup:0.3});
timedSpawn(332,482,[{"x":1249,"y":430},{"x":-128,"y":430}],40,5,Enemy_B,{drops_powerup:0.3});
timedSpawn(638,788,[{"x":1280,"y":248},{"x":734,"y":430},{"x":312,"y":248},{"x":-128,"y":430}],40,5,Enemy_B,{drops_powerup:0.6});
timedSpawn(949,1099,[{"x":1280,"y":84},{"x":828,"y":49},{"x":608,"y":121},{"x":777,"y":397},{"x":666,"y":798}],40,5,Enemy_B,{shoots:mode_frontal_weak,drops_powerup:0.3});
timedSpawn(1239,1389,[{"x":1280,"y":684},{"x":851,"y":685},{"x":642,"y":555},{"x":815,"y":78},{"x":666,"y":-40}],40,5,Enemy_B,{shoots:mode_frontal_weak,drops_powerup:0.3});
timedSpawn(1507,1657,[{"x":1280,"y":251},{"x":763,"y":167},{"x":437,"y":241},{"x":114,"y":179},{"x":-128,"y":240}],40,5,Enemy_B,{shoots:mode_chase_weak,drops_powerup:0.3});
timedSpawn(1533,1683,[{"x":1280,"y":651},{"x":763,"y":567},{"x":437,"y":641},{"x":114,"y":579},{"x":-128,"y":640}],40,5,Enemy_B,{shoots:mode_chase_weak,drops_powerup:0.3});
timedSpawn(1991,2584,[{"x":766,"y":103},{"x":715,"y":125},{"x":689,"y":258},{"x":693,"y":391},{"x":713,"y":597},{"x":769,"y":626},{"x":807,"y":593},{"x":834,"y":376},{"x":839,"y":252},{"x":819,"y":118}],40,1,Enemy_A,{shoots:mode_boss,drops_powerup:1.2});
timedSpawn(2000,2150,[{"x":1280,"y":84},{"x":828,"y":49},{"x":608,"y":121},{"x":777,"y":397},{"x":666,"y":798}],40,5,Enemy_B,{shoots:mode_frontal_strong,drops_powerup:0.3});
timedSpawn(2250,2400,[{"x":1280,"y":684},{"x":851,"y":685},{"x":642,"y":555},{"x":815,"y":78},{"x":666,"y":-40}],40,5,Enemy_B,{shoots:mode_frontal_strong,drops_powerup:0.3});
timedSpawn(2489,2639,[{"x":1280,"y":53},{"x":661,"y":163},{"x":-128,"y":107}],40,3,Enemy_B,{shoots:mode_chase_strong,drops_powerup:0.3});
timedSpawn(2489,2639,[{"x":1280,"y":715},{"x":661,"y":605},{"x":-128,"y":661}],40,3,Enemy_B,{shoots:mode_chase_strong,drops_powerup:0.3});
timedSpawn(2750,2900,[{"x":1280,"y":0},{"x":747,"y":168},{"x":720,"y":502},{"x":1280,"y":768}],40,5,Enemy_B,{shoots:mode_chase_strong,drops_powerup:0.5});
timedSpawn(3131,4414,[{"x":822,"y":429},{"x":822,"y":342},{"x":695,"y":270},{"x":607,"y":390},{"x":699,"y":512}],40,1,BOSS_BIGSHIP,{});
}
