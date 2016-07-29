(function(){
	var form = angular.module('form', []);
	form.controller('FormController', function(){
		this.listfields = listfields;
	});
	var listfields= [{
			'name': 'Intitulé de l\'opportunitée',
			'type': 'text',
			'id': 'intitule'
		},
		{
			'name': 'Date',
			'type': 'date',
			'id': 'date'
		},
		{
			'name': 'Saint-Tropez',
			'type': 'number',
			'id': 'place'
		}
		];
})();