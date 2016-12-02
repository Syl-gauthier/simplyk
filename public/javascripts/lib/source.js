'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DayItem = function (_React$Component) {
	_inherits(DayItem, _React$Component);

	function DayItem() {
		_classCallCheck(this, DayItem);

		return _possibleConstructorReturn(this, (DayItem.__proto__ || Object.getPrototypeOf(DayItem)).call(this));
	}

	_createClass(DayItem, [{
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'div',
				{ key: this.props.day.name },
				_react2.default.createElement(
					'div',
					{ className: 'pickadatediv input-group conn-input' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						this.props.day.title
					),
					_react2.default.createElement('input', { type: 'text', name: this.props.day.name, className: 'datepicker form-control', placeholder: 'Choisis un jour', id: this.props.day.name, required: true })
				)
			);
		}
	}]);

	return DayItem;
}(_react2.default.Component);

var AgeItem = function (_React$Component2) {
	_inherits(AgeItem, _React$Component2);

	function AgeItem() {
		_classCallCheck(this, AgeItem);

		var _this2 = _possibleConstructorReturn(this, (AgeItem.__proto__ || Object.getPrototypeOf(AgeItem)).call(this));

		_this2.state = {
			isChecked: false
		};
		return _this2;
	}

	_createClass(AgeItem, [{
		key: 'onChange',
		value: function onChange() {
			this.setState({
				isChecked: !this.state.isChecked
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var _this3 = this;

			return _react2.default.createElement(
				'div',
				{ className: 'age__container' },
				_react2.default.createElement(
					'label',
					null,
					_react2.default.createElement('input', { type: 'checkbox', checked: this.state.isChecked, onChange: function onChange() {
							return _this3.onChange();
						} }),
					' Ajouter un \xE2ge minimal'
				),
				_react2.default.createElement(
					'div',
					{ className: this.state.isChecked ? '' : 'hidden' },
					_react2.default.createElement(
						'div',
						{ className: 'input-group conn-input' },
						_react2.default.createElement(
							'span',
							{ className: 'input-group-addon' },
							'\xC2ge minimal'
						),
						_react2.default.createElement('input', { type: 'number', name: 'min_age', className: 'form-control', placeholder: 'Plus l\'\xE2ge minimal est faible, plus vous aurez de b\xE9n\xE9voles', id: 'min_age', min: '5', max: '100' })
					)
				)
			);
		}
	}]);

	return AgeItem;
}(_react2.default.Component);

var ActivityItem = function (_React$Component3) {
	_inherits(ActivityItem, _React$Component3);

	function ActivityItem(props) {
		_classCallCheck(this, ActivityItem);

		var _this4 = _possibleConstructorReturn(this, (ActivityItem.__proto__ || Object.getPrototypeOf(ActivityItem)).call(this, props));

		console.info('In activity constructor');
		var days_array = [];
		days_array.push(_this4.props.days);
		console.info('days_array : ' + days_array);
		_this4.state = {
			days: days_array,
			days_list: new Array(_this4.props.days.length).fill(false)
		};
		return _this4;
	}

	_createClass(ActivityItem, [{
		key: 'onChange',
		value: function onChange(i) {
			var new_days_list = this.state.days_list;
			new_days_list[i] = !new_days_list[i];
			this.setState({
				days_list: new_days_list
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var _this5 = this;

			console.log('In activity render');
			return _react2.default.createElement(
				'div',
				{ className: 'activity__container' },
				_react2.default.createElement(
					'h2',
					null,
					'Tâche ' + (this.props.n + 1)
				),
				_react2.default.createElement(
					'button',
					{ type: 'button', onClick: function onClick() {
							return _this5.props.removeActivity();
						} },
					'Supprimer la t\xE2che'
				),
				_react2.default.createElement(
					'div',
					{ className: 'input-group conn-input' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Titre de la t\xE2che'
					),
					_react2.default.createElement('input', { type: 'text', className: 'form-control', id: "activity" + this.props.n + "_intitule_activity", name: "activity" + this.props.n + "_intitule_activity", required: true })
				),
				_react2.default.createElement(
					'div',
					{ className: 'input-group conn-input' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Description de la t\xE2che'
					),
					_react2.default.createElement('input', { type: 'text', className: 'form-control', id: "activity" + this.props.n + "_description_activity", name: "activity" + this.props.n + "_description_activity", required: true })
				),
				_react2.default.createElement(
					'div',
					{ className: 'row' },
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3 col-md-offset-3' },
						_react2.default.createElement(
							'p',
							null,
							_react2.default.createElement(
								'strong',
								null,
								'Heure de d\xE9but'
							)
						)
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(
							'p',
							null,
							_react2.default.createElement(
								'strong',
								null,
								'Heure de fin'
							)
						)
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(
							'p',
							null,
							_react2.default.createElement(
								'strong',
								null,
								'Nombres de b\xE9n\xE9voles'
							)
						)
					)
				),
				(this.props.days.map(function (day, i) {
					var _this6 = this;

					_react2.default.createElement(
						'div',
						{ className: 'row' },
						_react2.default.createElement(
							'div',
							{ className: 'col-md-3' },
							_react2.default.createElement(
								'label',
								null,
								_react2.default.createElement('input', { type: 'checkbox', checked: 'false', onChange: function onChange() {
										return _this6.onChange(i);
									} }),
								' gfiek'
							)
						),
						_react2.default.createElement(
							'div',
							{ className: 'col-md-3' },
							_react2.default.createElement('input', { type: 'number', name: 'min_age', className: 'form-control', id: 'min_age', min: '5', max: '10000' })
						),
						_react2.default.createElement(
							'div',
							{ className: 'col-md-3' },
							_react2.default.createElement('input', { type: 'number', name: 'min_age', className: 'form-control', id: 'min_age', min: '5', max: '10000' })
						),
						_react2.default.createElement(
							'div',
							{ className: 'col-md-3' },
							_react2.default.createElement('input', { type: 'number', name: 'min_age', className: 'form-control', id: 'min_age', min: '1', max: '10000' })
						)
					);
				}), this)
			);
		}
	}]);

	return ActivityItem;
}(_react2.default.Component);

var BasicInfos = function (_React$Component4) {
	_inherits(BasicInfos, _React$Component4);

	function BasicInfos() {
		_classCallCheck(this, BasicInfos);

		return _possibleConstructorReturn(this, (BasicInfos.__proto__ || Object.getPrototypeOf(BasicInfos)).call(this));
	}

	_createClass(BasicInfos, [{
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'div',
				null,
				_react2.default.createElement(
					'div',
					{ className: 'input-group conn-input' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Titre de l\'\xE9v\xE8nement'
					),
					_react2.default.createElement('input', { type: 'text', className: 'form-control', id: 'intitule_event', name: 'intitule_event', required: true })
				),
				_react2.default.createElement(
					'div',
					{ className: 'input-group conn-input' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Adresse de l\'\xE9v\xE8nement'
					),
					_react2.default.createElement('input', { type: 'address', className: 'form-control', id: 'address', name: 'address', required: true })
				),
				_react2.default.createElement(
					'div',
					{ className: 'input-group' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Description de l\'\xE9v\xE8nement'
					),
					_react2.default.createElement('textarea', { className: 'form-control', id: 'description', name: 'description', rows: '6', required: true })
				)
			);
		}
	}]);

	return BasicInfos;
}(_react2.default.Component);

var EventForm = function (_React$Component5) {
	_inherits(EventForm, _React$Component5);

	function EventForm(props) {
		_classCallCheck(this, EventForm);

		var _this8 = _possibleConstructorReturn(this, (EventForm.__proto__ || Object.getPrototypeOf(EventForm)).call(this, props));

		var days = [];
		var first_day = {};
		first_day.nb = 1;
		first_day.title = 'Jour 1';
		first_day.name = 'day1';
		days.push(first_day);
		_this8.state = {
			nbActivities: 1,
			days: days,
			blob: ''
		};
		return _this8;
	}

	_createClass(EventForm, [{
		key: 'addADay',
		value: function addADay() {
			var new_index = this.state.days.length + 1;
			var new_day_list = new Array(1);
			var new_day = {};
			new_day.nb = new_index;
			new_day.title = 'Jour ' + new_index;
			new_day.name = 'day' + new_index;
			new_day_list[0] = new_day;
			var new_days = this.state.days.concat(new_day_list);
			this.setState({
				days: new_days
			});
		}
	}, {
		key: 'addAnActivity',
		value: function addAnActivity() {
			var new_nb_activities = this.state.nbActivities + 1;
			this.setState({
				nbActivities: new_nb_activities
			});
		}
	}, {
		key: 'removeActivity',
		value: function removeActivity() {
			console.info('In activity removal before if');
			if (this.state.nbActivities > 1) {
				console.info('In activity removal');
				var new_nb_activities = this.state.nbActivities;
				console.info('new_nb_activities : ' + new_nb_activities);
				this.setState({
					nbActivities: new_nb_activities - 1
				});
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this9 = this;

			return _react2.default.createElement(
				'div',
				null,
				_react2.default.createElement(
					'h1',
					null,
					'Mon \xE9v\xE8nement'
				),
				_react2.default.createElement(
					'form',
					{ action: 'addevent', method: 'post', id: 'creationeventform', name: 'creationeventform' },
					_react2.default.createElement(BasicInfos, null),
					_react2.default.createElement(
						'h4',
						null,
						'Dates de l\'\xE9v\xE8nement'
					),
					_react2.default.createElement(
						'p',
						{ className: 'alert alert-danger hidden', id: 'day-alert' },
						'Chaque jour doit \xEAtre d\xE9fini par une date'
					),
					_react2.default.createElement(
						'ul',
						null,
						this.state.days.map(function (day) {
							return _react2.default.createElement(DayItem, { day: day, key: day.nb });
						})
					),
					_react2.default.createElement(
						'div',
						{ className: 'btn btn-default', onClick: function onClick() {
								_this9.addADay();
							}, id: 'addADay' },
						' Ajouter un jour'
					),
					_react2.default.createElement(AgeItem, null),
					_react2.default.createElement(
						'ul',
						null,
						new Array(this.state.nbActivities).fill(1).map(function (d, i) {
							var _this10 = this;

							return _react2.default.createElement(ActivityItem, { n: i, key: i, days: this.state.days, removeActivity: function removeActivity() {
									_this10.removeActivity();
								} });
						}, this)
					),
					_react2.default.createElement(
						'div',
						{ className: 'btn btn-default', onClick: function onClick() {
								_this9.addAnActivity();
							}, id: 'addAnActivity' },
						' Ajouter une t\xE2che'
					)
				)
			);
		}
	}]);

	return EventForm;
}(_react2.default.Component);

//------------------------------------------------


_reactDom2.default.render(_react2.default.createElement(EventForm, null), document.getElementById('form-container'));