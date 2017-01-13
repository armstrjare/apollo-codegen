'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _printing = require('./printing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CodeGenerator = function () {
  function CodeGenerator(context) {
    (0, _classCallCheck3.default)(this, CodeGenerator);

    this.context = context;

    this.scopeStack = [];

    this.indentWidth = 2;
    this.indentLevel = 0;

    this.output = '';
  }

  (0, _createClass3.default)(CodeGenerator, [{
    key: 'pushScope',
    value: function pushScope(scope) {
      this.scopeStack.push(scope);
    }
  }, {
    key: 'popScope',
    value: function popScope() {
      return this.scopeStack.pop();
    }
  }, {
    key: 'print',
    value: function print(maybeString) {
      if (maybeString) {
        this.output += maybeString;
      }
    }
  }, {
    key: 'printNewline',
    value: function printNewline() {
      if (this.output) {
        this.print('\n');
        this.startOfIndentLevel = false;
      }
    }
  }, {
    key: 'printNewlineIfNeeded',
    value: function printNewlineIfNeeded() {
      if (!this.startOfIndentLevel) {
        this.printNewline();
      }
    }
  }, {
    key: 'printOnNewline',
    value: function printOnNewline(maybeString) {
      if (maybeString) {
        this.printNewline();
        this.printIndent();
        this.print(maybeString);
      }
    }
  }, {
    key: 'printIndent',
    value: function printIndent() {
      var indentation = ' '.repeat(this.indentLevel * this.indentWidth);
      this.output += indentation;
    }
  }, {
    key: 'withIndent',
    value: function withIndent(closure) {
      if (!closure) return;

      this.indentLevel++;
      this.startOfIndentLevel = true;
      closure();
      this.indentLevel--;
    }
  }, {
    key: 'withinBlock',
    value: function withinBlock(closure) {
      this.print(' {');
      this.withIndent(closure);
      this.printOnNewline('}');
    }
  }]);
  return CodeGenerator;
}();

exports.default = CodeGenerator;
//# sourceMappingURL=CodeGenerator.js.map