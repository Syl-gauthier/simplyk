var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//OrgTodo schema creation
var OrgTodoSchema = new Schema({
	id: ObjectId,
	org_id: {type: Schema.Types.ObjectId, ref:'Organism'},
	type: String, //pending or smthg else
	lastname: String, //Contact info
	firstname: String,
    vol_id: { type: Schema.Types.ObjectId, ref: 'Volunteer' },
    activity: {type: Schema.Types.ObjectId, ref:'Activity'},
    activity_intitule: String,
    day: Date
});

var OrgTodo = mongoose.model('OrgTodo', OrgTodoSchema);

module.exports = OrgTodo;