(function(){
	var form = angular.module('form', []);
	form.controller('FormController', function(){
		this.listfields = listfields;
	});
	var listfields= [{
			'name': 'Intitulé de l\'opportunitée',
			'type': 'text'
		},
		{
			'name': 'Date',
			'type': 'date'
		},
		{
			'name': 'Saint-Tropez',
			'type': 'number'
		}
		];
})();