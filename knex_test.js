var knex = require('knex')({
	client:'pg',
	connection:{
		host:'127.0.0.1',
		user:'postgres',
		password:'9810900377',
		database:'est'
	},
	debug:true
});

function getLeaderBoard(){
	return knex.select('by').max('level as maxLevel').min('at as minTime').from('correct').orderBy('maxLevel','desc').orderBy('minTime','asc').having('maxLevel', '>', 0).groupBy('by').limit(50);
}


for(var i = 0;i<100;i++){
	
}