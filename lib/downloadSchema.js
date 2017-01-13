'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utilities = require('graphql/utilities');

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}; // Based on https://facebook.github.io/relay/docs/guides-babel-plugin.html#using-other-graphql-implementations

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(url, outputPath, additionalHeaders) {
    var headers, result, response, schemaData;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            headers = (0, _assign2.default)(defaultHeaders, additionalHeaders);
            result = void 0;
            _context.prev = 2;
            _context.next = 5;
            return (0, _nodeFetch2.default)(url, {
              method: 'POST',
              headers: headers,
              body: (0, _stringify2.default)({ 'query': _utilities.introspectionQuery })
            });

          case 5:
            response = _context.sent;
            _context.next = 8;
            return response.json();

          case 8:
            result = _context.sent;
            _context.next = 14;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](2);
            throw new _errors.ToolError('Error while fetching introspection query result: ' + _context.t0.message);

          case 14:
            if (!result.errors) {
              _context.next = 16;
              break;
            }

            throw new _errors.ToolError('Errors in introspection query result: ' + result.errors);

          case 16:
            schemaData = result;

            if (schemaData.data) {
              _context.next = 19;
              break;
            }

            throw new _errors.ToolError('No introspection query result data found, server responded with: ' + (0, _stringify2.default)(result));

          case 19:

            _fs2.default.writeFileSync(outputPath, (0, _stringify2.default)(schemaData, null, 2));

          case 20:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 11]]);
  }));

  function downloadSchema(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return downloadSchema;
}();
//# sourceMappingURL=downloadSchema.js.map