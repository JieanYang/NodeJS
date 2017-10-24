const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const dboper = require('./operations');

const url = 'mongodb://localhost:27017/conFusion';

MongoClient.connect(url, (err,db) => {

	assert.equal(err, null);

	console.log('Connected correctly to server');

	dboper.insertDocument(db, {name: "Vadonut",description: "Test"}, 
		"dishes", (result) =>{
			console.log("Insert Document:\n", result.ops);

			dboper.findDocument(db, "dishes", (docs) => {
				console.log("Found Documents:\n", docs);

				dboper.updateDocument(db, {name:"Vadonut"},
				 {description: "Updated Test"}, "dishes",
				  (result) => {
				  	console.log("Updated Document:\n",result.result);

				  	dboper.findDocument(db, "dishes", (docs) => {
				  		console.log("Found Documents:\n", docs);

				  		db.dropCollection("dishes", (result) => {
				  			//here result is the result of err
				  			console.log("Dropped Collection: ", result);

				  			db.close();
				  		});
				  	});
				});
			});
		});
});