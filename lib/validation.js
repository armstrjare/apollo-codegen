'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.validateQueryDocument = validateQueryDocument;
exports.NoAnonymousQueries = NoAnonymousQueries;
exports.NoExplicitTypename = NoExplicitTypename;
exports.NoTypenameAlias = NoTypenameAlias;

var _graphql = require('graphql');

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validateQueryDocument(schema, document) {
  var rules = [NoAnonymousQueries, NoExplicitTypename, NoTypenameAlias].concat(_graphql.specifiedRules);

  var validationErrors = (0, _graphql.validate)(schema, document, rules);
  if (validationErrors && validationErrors.length > 0) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(validationErrors), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var error = _step.value;

        (0, _errors.logError)(error);
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

    throw new _errors.ToolError("Validation of GraphQL query document failed");
  }
}

function NoAnonymousQueries(context) {
  return {
    OperationDefinition: function OperationDefinition(node) {
      if (!node.name) {
        context.reportError(new _graphql.GraphQLError('Apollo iOS does not support anonymous operations', [node]));
      }
      return false;
    }
  };
}

function NoExplicitTypename(context) {
  return {
    Field: function Field(node) {
      var fieldName = node.name.value;
      if (fieldName == "__typename") {
        context.reportError(new _graphql.GraphQLError('Apollo iOS inserts __typename automatically when needed, please do not include it explicitly', [node]));
      }
    }
  };
}

function NoTypenameAlias(context) {
  return {
    Field: function Field(node) {
      var aliasName = node.alias && node.alias.value;
      if (aliasName == "__typename") {
        context.reportError(new _graphql.GraphQLError('Apollo iOS needs to be able to insert __typename when needed, please do not use it as an alias', [node]));
      }
    }
  };
}
//# sourceMappingURL=validation.js.map