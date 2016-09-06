fs = require('fs');
var Volunteer = require('../models/volunteer_model.js');
fs.readFile('data-sub.txt', 'utf8', function(err,file){
	if(err){
		console.log(err);
	}
	else{
		// console.log(file);
		const allText = file;
		processData(allText);
	}
});


function processData(allText) {
	// \n veut dire que on sépare par saut de ligne
	var allTextLines = allText.split("\n");
	// \t veut dire que on sépare par tabulation
	var headers = allTextLines[0].split('\t');
	var lines = [];
	console.log(headers);

	// console.log(lines);
	for (var i=1; i<allTextLines.length; i++) {
		var data = allTextLines[i].split('\t');
		
		// sert à éliminer les lignes vides 
		if (data[0].length>3){	
			if (data.length == headers.length) {

				
				console.log('coucou');
				console.log(data[2]);

				// newVolunteer = new Volunteer({
				// 	email: data[3],
				// 	email_verified: true,
				// 	lastname: data[1],
				// 	firstname: data[2],
				// 	// birthdate: data[6],
				// 	password: data[4],
				// 	foyer: data[5]
				// });
				// newVolunteer.save(function(err, volunteer){
				// 	if(err){
				// 		console.log(err);
				// 	}
				// 	else{
				// 		console.log('cugksg' + volunteer);
				// 	}
				// });

			}

			}
		}

}
