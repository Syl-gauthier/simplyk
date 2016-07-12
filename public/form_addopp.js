(function(){
	var form_addopp = angular.module('form_addopp', []);
	app.controller('FormController', function(){
		this.listfields = listfields;
	});
	var listfields= {
		'length': 4,
		'fields': {
			'name': 'intitule',
			'type': 'text'
		}
	};
})();