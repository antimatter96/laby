var knex = require('./db/knex.js');

/*
knex.schema.createTable('attempts', function (table) {
	table.increments('_id').primary();
	table.string('by').notNullable();
	table.integer('level').notNullable();
	table.string('attemptAnswer').notNullable();
	table.dateTime('created_at').defaultTo(knex.fn.now());
}).asCallback(function(err,result){
	if(err){
		console.log(err);
	}
});

knex.schema.createTable('correct', function (table) {
	table.increments('_id').primary();
	table.string('by').notNullable();
	table.integer('level').notNullable();
	table.string('attemptAnswer').notNullable();
	table.dateTime('created_at').defaultTo(knex.fn.now());
}).asCallback(function(err,result){
	if(err){
		console.log(err);
	}
});



knex.schema.createTable('teams', function (table) {
	table.increments('_id').primary();
	table.string('loginBy').notNullable();
	table.string('secMemId');
	table.string('thirdMemId');	
	table.string('name').notNullable();
	table.integer('level').notNullable().defaultTo(0);
	table.timestamps(false, true);
}).asCallback(function(err,result){
	if(err){
		console.log(err);
	}
	else{
		knex.schema.alterTable('teams', function (table) {
			table.unique('name');
		}).asCallback(function(err,result){
			if(err){
				console.log(err);
			}
		});
	}
});

*/

var strr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
/*
for(let i = 0; i<100; i++){
	var name = parseInt(Math.random()*20)
	var level = parseInt(Math.random()*10);
	for(var j=0;j<3;j++){
		var po = parseInt(Math.random()*36);
		name += strr[po];
	}
	knex('attempts').insert({ by : name, level : level, attemptAnswer : "Arttttgghh"}).asCallback(function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			console.log(rows);
		}
	});
}
*/

/*
for(let i = 0; i<100; i++){
	var name = parseInt(Math.random()*20)
	var userId1 = "";
	var level = parseInt(Math.random()*10);
	for(var j=0;j<3;j++){
		var po = parseInt(Math.random()*36);
		name += strr[po];
	}
	for(var j=0;j<3;j++){
		var po = parseInt(Math.random()*36);
		userId1 += strr[po];
	}
	knex('teams').returning('_id').insert({ loginBy : userId1, name: name}).asCallback(function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			console.log(rows);
		}
	});
}
*/


/* for(let i = 0; i<50; i++){
	
	var name = parseInt(Math.random()*100);
	knex('teams').where('_id',name).update({
		updated_at : knex.fn.now(),
		level : knex.raw('level + 100')
	}).asCallback(function(err,rows){
		if(err){
			console.log(err);
		}
		else{
			console.log(rows);
		}
	});
}


knex.select('name','level','updated_at').from('teams').orderBy('level','desc').orderBy('updated_at','asc').limit(50).asCallback(function(err,rows){
	if(err){
		console.log(err);
	}
	else{
		rows.forEach(function(element) {
			console.log(element.name + "    " + element.level + "     " + element.updated_at);	
		});
	}
}); 
*/

console.log("ASdas");

var teamId = "8";
console.log(knex('attempts').where({ by : teamId  }).orderBy('level').orderBy('created_at').limit(50).toString());
knex('attempts').where({ by : teamId  }).orderBy('level').orderBy('created_at').limit(50).asCallback(function(err,rows){
	if(err){
		console.log(err);
	}
	else{
		console.log(rows);
	}
});

/*
var dbq = require('./db/queries');
console.log(dbq.getTeamName("userId").toString());
console.log(dbq.updateLevel("userId").toString());

*/