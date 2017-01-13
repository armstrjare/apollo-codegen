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

var builtInScalarMap = (_builtInScalarMap = {}, (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLString.name, 'string'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLInt.name, 'number'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLFloat.name, 'number'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLBoolean.name, 'boolean'), (0, _defineProperty3.default)(_builtInScalarMap, _graphql.GraphQLID.name, 'string'), _builtInScalarMap);

function typeNameFromGraphQLType(context, type, bareTypeName) {
  var nullable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  if (type instanceof _graphql.GraphQLNonNull) {
    return typeNameFromGraphQLType(context, type.ofType, bareTypeName, false);
  }

  var typeName = void 0;
  if (type instanceof _graphql.GraphQLList) {
    typeName = 'Array< ' + typeNameFromGraphQLType(context, type.ofType, bareTypeName, true) + ' >';
  } else if (type instanceof _graphql.GraphQLScalarType) {
    typeName = builtInScalarMap[type.name] || (context.passthroughCustomScalars ? type.name : _graphql.GraphQLString);
  } else {
    typeName = bareTypeName || type.name;
  }

  return nullable ? typeName + ' | null' : typeName;
}
//# sourceMappingURL=types.js.map