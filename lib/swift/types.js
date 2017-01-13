'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _builtInScalarMap;

exports.typeNameFromGraphQLType = typeNameFromGraphQLType;

var _printing = require('../utilities/printing');

var _changeCase = require('change-case');

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var builtInScalarMap = (_builtInScalarMap = {}, (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLString.name, 'String'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLInt.name, 'Int'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLFloat.name, 'Double'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLBoolean.name, 'Bool'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLID.name, 'GraphQLID'), _builtInScalarMap);

function typeNameFromGraphQLType(context, type, bareTypeName, isOptional) {
  if (type instanceof _graphql.GraphQLNonNull) {
    return typeNameFromGraphQLType(context, type.ofType, bareTypeName, isOptional || false);
  } else if (isOptional === undefined) {
    isOptional = true;
  }

  var typeName = void 0;
  if (type instanceof _graphql.GraphQLList) {
    typeName = '[' + typeNameFromGraphQLType(context, type.ofType, bareTypeName) + ']';
  } else if (type instanceof _graphql.GraphQLScalarType) {
    typeName = builtInScalarMap[type.name] || (context.passthroughCustomScalars ? type.name : _graphql.GraphQLString);
  } else {
    typeName = bareTypeName || type.name;
  }

  return isOptional ? typeName + '?' : typeName;
}
//# sourceMappingURL=types.js.map