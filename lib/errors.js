'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

exports.ToolError = ToolError;
exports.logError = logError;
exports.logErrorMessage = logErrorMessage;

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ToolError is used for errors that are part of the expected flow
// and for which a stack trace should not be printed

function ToolError(message) {
  this.message = message;
}

ToolError.prototype = (0, _create2.default)(Error.prototype, {
  constructor: { value: ToolError },
  name: { value: 'ToolError' }
});

var isRunningFromXcodeScript = process.env.XCODE_VERSION_ACTUAL;

function logError(error) {
  if (error instanceof ToolError) {
    logErrorMessage(error.message);
  } else if (error instanceof _graphql.GraphQLError) {
    var fileName = error.source && error.source.name;
    if (error.locations) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(error.locations), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var location = _step.value;

          logErrorMessage(error.message, fileName, location.line);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      logErrorMessage(error.message, fileName);
    }
  } else {
    console.log(error.stack);
  }
}

function logErrorMessage(message, fileName, lineNumber) {
  if (isRunningFromXcodeScript) {
    if (fileName && lineNumber) {
      // Prefixing error output with file name, line and 'error: ',
      // so Xcode will associate it with the right file and display the error inline
      console.log(fileName + ':' + lineNumber + ': error: ' + message);
    } else {
      // Prefixing error output with 'error: ', so Xcode will display it as an error
      console.log('error: ' + message);
    }
  } else {
    console.log(message);
  }
}
//# sourceMappingURL=errors.js.map