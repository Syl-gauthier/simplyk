'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasicInfos = function (_React$Component) {
	_inherits(BasicInfos, _React$Component);

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
					_react2.default.createElement('input', { type: 'address', className: 'form-control', id: 'address', name: 'intitule_event', required: true })
				),
				_react2.default.createElement(
					'div',
					{ className: 'input-group conn-input' },
					_react2.default.createElement(
						'span',
						{ className: 'input-group-addon' },
						'Adresse de l\'\xE9v\xE8nement'
					),
					_react2.default.createElement('input', { type: 'address', className: 'form-control', id: 'address', name: 'intitule_event', required: true })
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
				),
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
				(this.props.days.map(function (day) {
					var _this2 = this;

					return _react2.default.createElement(
						'div',
						{ key: day.name },
						_react2.default.createElement(
							'div',
							{ className: 'pickadatediv input-group conn-input' },
							_react2.default.createElement(
								'span',
								{ className: 'input-group-addon' },
								day.title
							),
							_react2.default.createElement('input', { type: 'text', name: day.name, className: 'datepicker form-control', placeholder: 'Choisis un jour', id: day.name, required: true })
						),
						_react2.default.createElement(
							'div',
							{ className: 'btn btn-default', onClick: function onClick() {
									_this2.props.addADay();
								}, id: 'addADay' },
							' Ajouter un jour'
						)
					);
				}), this)
			);
		}
	}]);

	return BasicInfos;
}(_react2.default.Component);

var EventForm = function (_React$Component2) {
	_inherits(EventForm, _React$Component2);

	function EventForm(props) {
		_classCallCheck(this, EventForm);

		var _this3 = _possibleConstructorReturn(this, (EventForm.__proto__ || Object.getPrototypeOf(EventForm)).call(this, props));

		_this3.state = {
			days: [],
			blob: ''
		};
		return _this3;
	}

	_createClass(EventForm, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var days = [];
			console.info('type of days : ' + (typeof days === 'undefined' ? 'undefined' : _typeof(days)));
			days.push({
				title: 'Jour 1',
				name: 'day1',
				nb: 1,
				value: 0
			});
			console.info('type of days : ' + (typeof days === 'undefined' ? 'undefined' : _typeof(days)));
			this.setState({ days: this.state.days.concat(days) });
		}
	}, {
		key: 'addADay',
		value: function addADay() {
			var new_index = this.state.days.length + 1;
			var new_day = [{
				title: 'Jour ' + new_index,
				name: 'day' + new_index,
				nb: new_index,
				value: 0
			}];
			this.setState({
				days: this.state.days.concat(new_day)
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var _this4 = this;

			console.info('this.state.days : ' + JSON.stringify(this.state.days));
			console.info('type of this.state.days : ' + _typeof(this.state.days));
			return _react2.default.createElement(
				'div',
				null,
				_react2.default.createElement(
					'h2',
					null,
					'Mon \xE9v\xE8nement'
				),
				_react2.default.createElement(
					'form',
					{ action: 'addevent', method: 'post', id: 'creationeventform', name: 'creationeventform' },
					_react2.default.createElement(BasicInfos, { days: this.state.days, addADay: function addADay() {
							return _this4.addADay();
						} })
				)
			);
		}
	}]);

	return EventForm;
}(_react2.default.Component);

//------------------------------------------------


_reactDom2.default.render(_react2.default.createElement(EventForm, null), document.getElementById('form-container'));