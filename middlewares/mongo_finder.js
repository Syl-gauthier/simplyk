//Module where all the functions to navigate in the DB are displayed

//Function to get the right activity and event from activity_id inside an organism informations
function getActivityAndEvent(organism, act_id){
	//Find the activity in the organism infos
	var act_index = -1;
	console.log('Get activity and event infos from organism infos : START');
	function isRightActivity(activity){
		if (activity._id.toString()===act_id){
			console.log('return true');
			return true;
		}
		return false;
	};
	//Find the event which contains the activity
	function isRightEvent(event){
		for (var actI = event.activities.length - 1; actI >= 0; actI--) {
			if (event.activities[actI]._id.toString()===act_id){
				console.log('return true');
				act_index = actI;
				return true;
			}
		}
		console.log('return false');
		return false;
	};
	var filtered_event = organism.events.find(isRightEvent);
	var filtered_activity = filtered_event.activities.find(isRightActivity);
	console.log('Get activity and event infos from organism infos : END');
	return {event: filtered_event, activity: filtered_activity, activity_index: act_index};
};

module.exports = {getActivityAndEvent: getActivityAndEvent};