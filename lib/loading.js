'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadSchema = loadSchema;
exports.loadAndMergeQueryDocuments = loadAndMergeQueryDocuments;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _graphql = require('graphql');

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadSchema(schemaPath) {
  if (!_fs2.default.existsSync(schemaPath)) {
    throw new _errors.ToolError('Cannot find GraphQL schema file: ' + schemaPath);
  }
  var schemaData = require(schemaPath);

  if (!schemaData.data && !schemaData.__schema) {
    throw new _errors.ToolError('GraphQL schema file should contain a valid GraphQL introspection query result');
  }
  return (0, _graphql.buildClientSchema)(schemaData.data ? schemaData.data : schemaData);
}

function loadAndMergeQueryDocuments(inputPaths) {
  var sources = inputPaths.map(function (inputPath) {
    var body = _fs2.default.readFileSync(inputPath, 'utf8');
    if (!body) {
      return null;
    }
    return new _graphql.Source(body, inputPath);
  }).filter(function (source) {
    return source;
  });

  return (0, _graphql.concatAST)(sources.map(function (source) {
    return (0, _graphql.parse)(source);
  }));
}
//# sourceMappingURL=loading.js.map