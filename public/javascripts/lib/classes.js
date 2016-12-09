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

var ClassesTable = function (_React$Component) {
	_inherits(ClassesTable, _React$Component);

	function ClassesTable() {
		_classCallCheck(this, ClassesTable);

		var _this = _possibleConstructorReturn(this, (ClassesTable.__proto__ || Object.getPrototypeOf(ClassesTable)).call(this));

		_this.state = {};
		var url = '/admin/classes__react';
		_this.getDatas(url);
		return _this;
	}

	_createClass(ClassesTable, [{
		key: 'getDatas',
		value: function getDatas(url) {
			var _this2 = this;

			fetch(url, {
				method: 'GET'
			}).then(function (response) {
				console.log('response : ' + JSON.stringify(response));return response.json();
			}).then(function (responseJSON) {
				console.log(responseJSON);
				_this2.setState({
					datas: responseJSON
				});
			});
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'div',
				null,
				' ',
				this.state.datas,
				' '
			);
		}
	}]);

	return ClassesTable;
}(_react2.default.Component);

//------------------------------------------------


_reactDom2.default.render(_react2.default.createElement(ClassesTable, null), document.getElementById('table__container'));