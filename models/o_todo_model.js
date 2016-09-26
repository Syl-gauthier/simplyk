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
    activity_id: {type: Schema.Types.ObjectId, ref:'Activity'},
    lt_id: ObjectId,
    lt_intitule: String,
    activity_intitule: String,
    day: Date,
    hours: Number,
    student: Boolean,
    organism_questions: [String]
});

var OrgTodo = mongoose.model('OrgTodo', OrgTodoSchema);

module.exports = OrgTodo;