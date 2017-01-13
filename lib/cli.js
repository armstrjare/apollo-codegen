#!/usr/bin/env node
'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _ = require('.');

var _errors = require('./errors');

require('source-map-support/register');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Make sure unhandled errors in async code are propagated correctly
_process2.default.on('unhandledRejection', function (error) {
  throw error;
});

_process2.default.on('uncaughtException', handleError);

function handleError(error) {
  (0, _errors.logError)(error);
  _process2.default.exit(1);
}

_yargs2.default.command('download-schema <server>', 'Download a GraphQL schema from a server', {
  output: {
    demand: true,
    describe: 'Output path for GraphQL schema file',
    default: 'schema.json',
    normalize: true,
    coerce: _path2.default.resolve
  },
  header: {
    alias: 'H',
    describe: 'Additional header to send to the server as part of the introspection query request',
    type: 'array',
    coerce: function coerce(arg) {
      var additionalHeaders = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(arg), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var header = _step.value;

          var _header$split = header.split(/\s*:\s*/),
              _header$split2 = (0, _slicedToArray3.default)(_header$split, 2),
              name = _header$split2[0],
              value = _header$split2[1];

          if (!(name && value)) {
            throw new _errors.ToolError('Headers should be specified as "Name: Value"');
          }
          additionalHeaders[name] = value;
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

      return additionalHeaders;
    }
  }
}, function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(argv) {
    var outputPath, additionalHeaders;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            outputPath = _path2.default.resolve(argv.output);
            additionalHeaders = argv.header;
            _context.next = 4;
            return (0, _.downloadSchema)(argv.server, outputPath, additionalHeaders);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}()).command('generate [input...]', 'Generate code from a GraphQL schema and query documents', {
  schema: {
    demand: true,
    describe: 'Path to GraphQL schema file',
    default: 'schema.json',
    normalize: true,
    coerce: _path2.default.resolve
  },
  output: {
    describe: 'Output directory for the generated files',
    normalize: true,
    coerce: _path2.default.resolve
  },
  target: {
    demand: false,
    describe: 'Code generation target language',
    choices: ['swift', 'json', 'ts', 'typescript', 'flow'],
    default: 'swift'
  },
  "passthrough-custom-scalars": {
    demand: false,
    describe: "Don't attempt to map custom scalars [temporary option]",
    default: false
  },
  "ts-namespace": {
    demand: false,
    describe: "Typescript: An [optional] namespace name for generated types.",
    default: null
  },
  "ts-namespace-type": {
    demand: false,
    describe: "Typescript: How the namespace should be generated. Either `export` or `declare`." + "Defaults to `export`, unless the `output` path ends in `.d.ts`, in which case it deafults to `declare`.",
    default: null
  }
}, function (argv) {
  var inputPaths = argv.input.map(function (input) {
    return _path2.default.resolve(input);
  });

  var options = {
    passthroughCustomScalars: argv["passthrough-custom-scalars"],
    tsNamespace: argv["ts-namespace"],
    tsNamespaceType: argv["ts-namespace-type"] || (argv["ts-namespace"] && argv.output.match(/\.d\.ts$/) ? "declare" : "export")
  };
  (0, _.generate)(inputPaths, argv.schema, argv.output, argv.target, options);
}).fail(function (message, error) {
  handleError(error ? error : new _errors.ToolError(message));
}).help().version().strict().argv;
//# sourceMappingURL=cli.js.map