'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DayItem = function (_React$Component) {
	_inherits(DayItem, _React$Component);

	function DayItem() {
		_classCallCheck(this, DayItem);

		var _this = _possibleConstructorReturn(this, (DayItem.__proto__ || Object.getPrototypeOf(DayItem)).call(this));

		_this.state = {
			valid: 'u'
		};
		return _this;
	}
	/*
 validate(value) {
 	console.log('Input date val : ' + value);
 	if (Moment(value).isValid()){
 		this.setState({
 			valid: 'y'
 		});
 	} else {
 		this.setState({
 			valid: 'n'
 		});
 	}
 };*/

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
					_react2.default.createElement(DatePicker, { name: this.props.day.name, placeholder: 'Choisis un jour (yyyy-mm-dd)', id: this.props.day.name /*validate={this.validate}*/, required: true })
				)
			);
		}
	}]);

	return DayItem;
}(_react2.default.Component);

var DatePicker = function (_React$Component2) {
	_inherits(DatePicker, _React$Component2);

	function DatePicker(props) {
		_classCallCheck(this, DatePicker);

		var _this2 = _possibleConstructorReturn(this, (DatePicker.__proto__ || Object.getPrototypeOf(DatePicker)).call(this, props));

		_this2.state = {
			value: null,
			valid: 'u'
		};
		return _this2;
	}

	_createClass(DatePicker, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.setupDatepicker();
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			this.setupDatepicker();
		}
	}, {
		key: 'setupDatepicker',
		value: function setupDatepicker() {
			// cache this so we can reference it inside the datepicker
			var comp = this;
			// the element
			var el = this.refs.datepicker;
			$(el).pickadate({
				format: 'yyyy-mm-dd',
				formatSubmit: 'yyyy-mm-dd',
				selectMonths: true,
				selectYears: 5,
				onSet: function onSet(e) {
					// you can use any of the pickadate options here
					var val = this.get('select', 'yyyy-mm-dd');
					comp.onDateChange({ target: { value: val } });
				}
			});
		}
	}, {
		key: 'onDateChange',
		value: function onDateChange(event) {
			this.setState({ operand: event.target.value });
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement('input', { type: 'date', ref: 'datepicker', key: this.props.name, name: this.props.name, value: this.state.value, className: 'datepicker form-control', placeholder: 'Choisis un jour (yyyy-mm-dd)' /*onBlur={this.props.validate(this.state.value)}*/, required: true });
		}
	}]);

	return DatePicker;
}(_react2.default.Component);

var TimePicker = function (_React$Component3) {
	_inherits(TimePicker, _React$Component3);

	function TimePicker(props) {
		_classCallCheck(this, TimePicker);

		var _this3 = _possibleConstructorReturn(this, (TimePicker.__proto__ || Object.getPrototypeOf(TimePicker)).call(this, props));

		_this3.state = {
			value: null,
			valid: 'u'
		};
		return _this3;
	}

	_createClass(TimePicker, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.setupTimepicker();
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			this.setupTimepicker();
		}
	}, {
		key: 'setupTimepicker',
		value: function setupTimepicker() {
			// cache this so we can reference it inside the timepicker
			var comp = this;
			// the element
			var el = this.refs.timepicker;
			$(el).pickatime({
				onSet: function onSet(e) {
					// you can use any of the pickatime options here
					var val = this.get('select');
					comp.onDateChange({ target: { value: val } });
				}
			});
		}
	}, {
		key: 'onDateChange',
		value: function onDateChange(event) {
			this.setState({ operand: event.target.value });
		}
	}, {
		key: 'render',
		value: function render() {
			if (this.props.required == 'true') {
				if (this.props.checked == 'true') {
					return _react2.default.createElement('input', { type: 'text', key: this.props.name, ref: 'timepicker', name: this.props.name, value: this.state.value, className: 'timepicker form-control', placeholder: this.props.placeholder /*onBlur={this.props.validate(this.state.value)}*/, required: true });
				} else {
					return _react2.default.createElement('input', { type: 'text', key: this.props.name, ref: 'timepicker', name: this.props.name, value: this.state.value, className: 'timepicker form-control', placeholder: this.props.placeholder /*onBlur={this.props.validate(this.state.value)}*/, disabled: true });
				}
			} else {
				return _react2.default.createElement('input', { type: 'text', key: this.props.name, ref: 'timepicker', name: this.props.name, value: this.state.value, className: 'timepicker form-control', placeholder: this.props.placeholder /*onBlur={this.props.validate(this.state.value)}*/ });
			}
		}
	}]);

	return TimePicker;
}(_react2.default.Component);

var DayInActivity = function (_React$Component4) {
	_inherits(DayInActivity, _React$Component4);

	function DayInActivity(props) {
		_classCallCheck(this, DayInActivity);

		return _possibleConstructorReturn(this, (DayInActivity.__proto__ || Object.getPrototypeOf(DayInActivity)).call(this, props));
	}

	_createClass(DayInActivity, [{
		key: 'isDisabled',
		value: function isDisabled() {
			if (this.props.checked == 'true') {
				console.log('Checked');
				return _react2.default.createElement('input', { type: 'number', key: this.props.activity + '_' + this.props.day + '_vol_nb', name: this.props.activity + '_' + this.props.day + '_vol_nb', className: 'form-control', id: 'min_age', min: '1', max: '10000', required: true });
			} else {
				console.log('Not checked');
				return _react2.default.createElement('input', { type: 'number', key: this.props.activity + '_' + this.props.day + '_vol_nb', name: this.props.activity + '_' + this.props.day + '_vol_nb', className: 'form-control', id: 'min_age', min: '1', max: '10000', disabled: true });
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this5 = this;

			if (this.props.required == 'true') {
				return _react2.default.createElement(
					'div',
					{ className: 'row' },
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(
							'label',
							null,
							_react2.default.createElement('input', { type: 'checkbox', value: 'on', key: this.props.activity + '_' + this.props.day, name: this.props.activity + '_' + this.props.day, onChange: function onChange() {
									return _this5.props.onChange();
								}, required: true }),
							' ',
							'Jour ' + (this.props.i + 1)
						)
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(TimePicker, { placeholder: 'D\xE9but', key: this.props.activity + '_' + this.props.day + '_startTime', name: this.props.activity + '_' + this.props.day + '_startTime', required: 'true', checked: this.props.checked })
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(TimePicker, { placeholder: 'Fin', key: this.props.activity + '_' + this.props.day + '_endTime', name: this.props.activity + '_' + this.props.day + '_endTime', required: 'true', checked: this.props.checked })
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						this.isDisabled()
					)
				);
			} else {
				return _react2.default.createElement(
					'div',
					{ className: 'row' },
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(
							'label',
							null,
							_react2.default.createElement('input', { type: 'checkbox', value: 'on', key: this.props.activity + '_' + this.props.day, name: this.props.activity + '_' + this.props.day, onChange: function onChange() {
									return _this5.props.onChange();
								} }),
							' ',
							'Jour ' + (this.props.i + 1)
						)
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(TimePicker, { placeholder: 'D\xE9but', key: this.props.activity + '_' + this.props.day + '_startTime', name: this.props.activity + '_' + this.props.day + '_startTime', required: 'false', checked: this.props.checked })
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						_react2.default.createElement(TimePicker, { placeholder: 'Fin', key: this.props.activity + '_' + this.props.day + '_endTime', name: this.props.activity + '_' + this.props.day + '_endTime', required: 'false', checked: this.props.checked })
					),
					_react2.default.createElement(
						'div',
						{ className: 'col-md-3' },
						this.isDisabled()
					)
				);
			}
		}
	}]);

	return DayInActivity;
}(_react2.default.Component);

var AgeItem = function (_React$Component5) {
	_inherits(AgeItem, _React$Component5);

	function AgeItem() {
		_classCallCheck(this, AgeItem);

		var _this6 = _possibleConstructorReturn(this, (AgeItem.__proto__ || Object.getPrototypeOf(AgeItem)).call(this));

		_this6.state = {
			isChecked: false
		};
		return _this6;
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
			var _this7 = this;

			return _react2.default.createElement(
				'div',
				{ className: 'age__container' },
				_react2.default.createElement(
					'label',
					null,
					_react2.default.createElement('input', { type: 'checkbox', value: 'on', checked: this.state.isChecked, onChange: function onChange() {
							return _this7.onChange();
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

var ActivityItem = function (_React$Component6) {
	_inherits(ActivityItem, _React$Component6);

	function ActivityItem(props) {
		_classCallCheck(this, ActivityItem);

		var _this8 = _possibleConstructorReturn(this, (ActivityItem.__proto__ || Object.getPrototypeOf(ActivityItem)).call(this, props));

		console.info('In activity constructor');
		console.info('this.props.days : ' + _this8.props.days);
		_this8.state = {
			days_list: Array.apply(null, Array(_this8.props.days.length)).map(function () {
				return false;
			})
		};
		return _this8;
	}

	_createClass(ActivityItem, [{
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			if (this.props.days.length < nextProps.days.length) {
				console.log('typeof this.state.days_list : ' + _typeof(this.state.days_list));
				console.log('this.state.days_list : ' + JSON.stringify(this.state.days_list));
				this.state.days_list.push(false);
				console.log('this.state.days_list : ' + JSON.stringify(this.state.days_list));
				var days_pushed = this.state.days_list;
				console.log('this.state.days_list : ' + JSON.stringify(this.state.days_list));
				this.setState({
					days_list: days_pushed
				});
				console.log('Had just push false in days_list and new days_list : ' + this.state.days_list);
			}
		}
	}, {
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
			var _this9 = this;

			console.log('In activity render');
			return _react2.default.createElement(
				'div',
				{ className: 'activity__container' },
				_react2.default.createElement(
					'h2',
					{ className: 'text-center' },
					'Tâche ' + (this.props.n + 1)
				),
				_react2.default.createElement(
					'div',
					{ type: 'button', className: 'btn btn-default', onClick: function onClick() {
							return _this9.props.removeActivity();
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
					_react2.default.createElement('input', { type: 'text', className: 'form-control', id: "activity" + (this.props.n + 1) + "_intitule_activity", name: "activity" + (this.props.n + 1) + "_intitule_activity", required: true })
				),
				_react2.default.createElement(
					'div',
					{ className: 'input-group conn-input' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Description de la t\xE2che'
					),
					_react2.default.createElement('input', { type: 'text', className: 'form-control', id: "activity" + (this.props.n + 1) + "_activity_description", name: "activity" + (this.props.n + 1) + "_description_activity", required: true })
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
				this.props.days.map(function (day, i) {
					var _this10 = this;

					if (this.state.days_list.indexOf(true) != -1) {
						if (this.state.days_list[i]) {
							return _react2.default.createElement(DayInActivity, { i: i, onChange: function onChange() {
									return _this10.onChange(i);
								}, activity: 'activity' + (this.props.n + 1), day: 'day' + (i + 1), required: 'true', checked: 'true' });
						} else {
							return _react2.default.createElement(DayInActivity, { i: i, onChange: function onChange() {
									return _this10.onChange(i);
								}, activity: 'activity' + (this.props.n + 1), day: 'day' + (i + 1), required: 'false', checked: 'false' });
						}
					} else {
						return _react2.default.createElement(DayInActivity, { i: i, onChange: function onChange() {
								return _this10.onChange(i);
							}, activity: 'activity' + (this.props.n + 1), day: 'day' + (i + 1), required: 'true', checked: 'false' });
					}
				}, this)
			);
		}
	}]);

	return ActivityItem;
}(_react2.default.Component);

var BasicInfos = function (_React$Component7) {
	_inherits(BasicInfos, _React$Component7);

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
					{ className: 'input-group conn-input', id: 'address_container' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Adresse de l\'\xE9v\xE8nement'
					),
					_react2.default.createElement('input', { type: 'address', className: 'form-control', id: 'address', name: 'address', placeholder: 'Indiquez un lieu UNIQUE (format: n\xB0 de rue, nom de rue, ville)', required: true })
				),
				_react2.default.createElement(
					'div',
					{ className: 'input-group' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Description de l\'\xE9v\xE8nement'
					),
					_react2.default.createElement('textarea', { className: 'form-control', id: 'description', name: 'event_description', rows: '6', required: true })
				)
			);
		}
	}]);

	return BasicInfos;
}(_react2.default.Component);

var EventForm = function (_React$Component8) {
	_inherits(EventForm, _React$Component8);

	function EventForm(props) {
		_classCallCheck(this, EventForm);

		var _this12 = _possibleConstructorReturn(this, (EventForm.__proto__ || Object.getPrototypeOf(EventForm)).call(this, props));

		var days = [];
		var first_day = {};
		first_day.nb = 1;
		first_day.title = 'Jour 1';
		first_day.name = 'day1';
		days.push(first_day);
		_this12.state = {
			nbActivities: 1,
			days: days,
			blob: ''
		};
		console.log('this.state.days ' + JSON.stringify(_this12.state.days));
		return _this12;
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
			console.log('this.state.days ' + JSON.stringify(this.state.days));
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
		key: 'getDaysToRender',
		value: function getDaysToRender() {
			var to_render = this.state.days.map(function (day) {
				console.log('day.name : ' + day.name);
				return day.name;
			});
			return to_render;
		}
	}, {
		key: 'render',
		value: function render() {
			var _this13 = this;

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
					{ action: 'addevent', method: 'post', id: 'creationeventform', name: 'creationeventform', style: { paddingBottom: '100px' } },
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
						'div',
						null,
						this.state.days.map(function (day) {
							return _react2.default.createElement(DayItem, { day: day, key: day.name });
						})
					),
					_react2.default.createElement(
						'div',
						{ className: 'btn btn-default', onClick: function onClick() {
								_this13.addADay();
							}, id: 'addADay' },
						' Ajouter un jour'
					),
					_react2.default.createElement(AgeItem, null),
					_react2.default.createElement(
						'div',
						{ style: { paddingBottom: '40px' } },
						Array.apply(null, Array(this.state.nbActivities)).map(function () {
							return 1;
						}).map(function (d, i) {
							var _this14 = this;

							console.log('activité : ' + i);
							return _react2.default.createElement(ActivityItem, { n: i, key: i, days: this.getDaysToRender(), removeActivity: function removeActivity() {
									_this14.removeActivity();
								} });
						}, this)
					),
					_react2.default.createElement(
						'div',
						{ className: 'btn btn-default', onClick: function onClick() {
								_this13.addAnActivity();
							}, id: 'addAnActivity' },
						' Ajouter une t\xE2che'
					),
					_react2.default.createElement('input', { className: 'btn btn-default', type: 'Submit', id: 'submit', value: 'Terminer' })
				)
			);
		}
	}]);

	return EventForm;
}(_react2.default.Component);

//------------------------------------------------


_reactDom2.default.render(_react2.default.createElement(EventForm, null), document.getElementById('form-container'));

ActivityItem.propTypes = {
	n: _react2.default.PropTypes.number,
	key: _react2.default.PropTypes.number,
	removeActivity: _react2.default.PropTypes.func,
	days: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string)
};

DayItem.propTypes = {
	key: _react2.default.PropTypes.number,
	day: _react2.default.PropTypes.object
};