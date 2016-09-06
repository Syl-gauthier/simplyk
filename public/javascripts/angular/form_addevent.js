(function(){
	var form = angular.module('form', []);
	form.directive('onLastRepeat', function() {
		return function(scope, element, attrs) {
			if (scope.$last) setTimeout(function(){
				scope.$emit('onRepeatLast', element, attrs);
			}, 1);
		};
	})
	.controller('FormController', function($scope){
		var form = this;
		form.requiredEventFields = requiredEventFields;
		form.unnecessaryEventFields = unnecessaryEventFields;
		form.activitiesList = activitiesList;
		form.daysList = daysList;
		form.dayRequired = true;
		form.errorMessage = null;
		console.log('On débute');
		console.log('required : ' + form.dayRequired);
		$scope.$on('onRepeatLast', function(){
			var input = $('.datepicker');
			input.pickadate({
				firstDay: 1,
				formatSubmit: 'yyyy-mm-dd'
			});
			var input = $('.timepicker');
			input.pickatime({
			});
		});
		//form.addDay = addDay;
		this.addActivity = function(){
			var nActivity = form.activitiesList.length + 1;
			console.log('On est dans addActivity et nActivity = ' + nActivity);
			form.activitiesList.push({
				'activityTitle': 'Tâche ' + nActivity,
				'activityName': 'activity' + nActivity,
				'activityRequiredFields': requiredActivityFields,
				'activityUnnecessaryFields': unnecessaryActivityFields,
				'dayRequired': true
			});
		};
		this.addDay = function(){
			nDay = daysList.length + 1;
			console.log('On est dans addDay et nDay = ' + nDay);
			form.daysList.push({
				'title': 'Jour ' + nDay,
				'name': 'day' + nDay,
				'nb': nDay,
				'value': 0
			});
		};
		this.checkRequired = function(day, activity){
			const day_index = form.daysList.map(function(el){return el.name}).indexOf(day.name);
			console.log('index day clicked : ' + day_index);
			console.log('daysList : ' + daysList);
			console.log('daysList[day_index] : ' + JSON.stringify(daysList[day_index]));
			console.log('daysList[day_index].value : ' + daysList[day_index].value);
			if (daysList[day_index].value == 1){
				console.log('unchecked');
				daysList[day_index].value = 0;
			}
			else {
				console.log('checked');
				daysList[day_index].value = 1;
			}
			function isValue1(day){
				console.log('day : ' +day);
				return day.value == 1;
			}
			var listValues1 = daysList.filter(isValue1);
			console.log('there is ' +listValues1.length+ ' days selected');
			if (listValues1.length > 0){
				activity.dayRequired = false;
			}
			else{
				activity.dayRequired = true;
			}
			console.log('required : ' + activity.dayRequired);
		};
		this.error = function(){
			return form.errorMessage;
		};
		this.delete = function(activityName){
			if (form.activitiesList.length > 1){
				console.log('Just delete an activity ! ' + activitiesList.length);
				console.log('** 1 ** activitiesList : ' + JSON.stringify(form.activitiesList));
				var isNotId = function(activity){
					console.log('activity.activityName : '+activity.activityName);
					console.log('activityName : '+activityName);
					console.log('activity.activityName != activityName : '+ (activity.activityName != activityName));
					return activity.activityName != activityName;
				} 
				var list = form.activitiesList.filter(isNotId);
				form.activitiesList = [];
				Array.prototype.push.apply(form.activitiesList, list);
				console.log('** 2 ** list : ' + JSON.stringify(list));
				console.log('** 2 ** activitiesList : ' + JSON.stringify(form.activitiesList));
				for (var actI = form.activitiesList.length - 1; actI >= 0; actI--) {
					form.activitiesList[actI].activityTitle = 'Tâche ' + (actI+1);
					form.activitiesList[actI].activityName = 'activity' + (actI+1);
				}
				console.log('** 3 ** activitiesList : ' + JSON.stringify(form.activitiesList));
			}
			else {
				form.errorMessage = 'Un évènement comporte toujours au moins une activité !';
			}
		}
	});


	var requiredEventFields= [{
		'title': 'Titre de l\'évènement',
		'type': 'text',
		'id': 'intitule_event'
	},
	{
		'title': 'Description de l\'évènement',
		'type': 'text',
		'id': 'event_description',
		'class': 'bigtext'
	},
	{
		'title': 'Adresse de l\'évènement',
		'type': 'address',
		'id': 'address'
		}/*,
		{
			'title': 'Dates de l\'évènement',
			'type': 'date',
			'id': 'dates'
		}*/];
		var unnecessaryEventFields= [];
		var requiredActivityFields= [{
			'title': 'Titre de la tâche',
			'type': 'text',
			'id': 'intitule_activity'
		},
		{
			'title': 'Description de la tâche',
			'type': 'text',
			'id': 'activity_description'
		}];
		var unnecessaryActivityFields= [{
			'title': 'Heures minimales à effectuer dans une journée',
			'type': 'number',
			'id': 'min_hours'
		}];


		var activitiesList = [{
			'activityTitle': 'Tâche 1',
			'activityName': 'activity1',
			'activityRequiredFields': requiredActivityFields,
			'activityUnnecessaryFields': unnecessaryActivityFields,
			'dayRequired': true
		}];

		var daysList = [{
			'title': 'Jour 1',
			'name': 'day1',
			'nb': 1,
			'value': 0
		}];

	/*var addDay = function(){
		nDay = daysList.length + 1;
		console.log('On est dans addDay et nDay = :' + nDay);
		form.daysList.push({
			'title': 'Jour ' + nDay,
			'nb': n Day
		});
	};*/
})();