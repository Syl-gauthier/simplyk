var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//OrgTodo schema creation
var OrgTodoSchema = new Schema({
	id: ObjectId,
	org_id: {type: Schema.Types.ObjectId, ref:'Organism'},
	type: String, //pending or smthg else
	lastName: String, //Contact info
	firstName: String,
    vol_id: { type: Schema.Types.ObjectId, ref: 'Volunteer' },
    activity: {type: Schema.Types.ObjectId, ref:'Activity'}
});

var OrgTodo = mongoose.model('OrgTodo', OrgTodoSchema);

module.exports = OrgTodo;