'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

exports.generateSource = generateSource;
exports.typeDeclarationForGraphQLType = typeDeclarationForGraphQLType;
exports.interfaceVariablesDeclarationForOperation = interfaceVariablesDeclarationForOperation;
exports.typeDeclarationForOperation = typeDeclarationForOperation;
exports.typeDeclarationForFragment = typeDeclarationForFragment;
exports.propertiesFromFields = propertiesFromFields;
exports.propertyFromField = propertyFromField;
exports.propertyDeclarations = propertyDeclarations;

var _graphql = require('graphql');

var _graphql2 = require('../utilities/graphql');

var _changeCase = require('change-case');

var _inflected = require('inflected');

var _inflected2 = _interopRequireDefault(_inflected);

var _printing = require('../utilities/printing');

var _CodeGenerator = require('../utilities/CodeGenerator');

var _CodeGenerator2 = _interopRequireDefault(_CodeGenerator);

var _language = require('./language');

var _types = require('./types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generateSource(context) {
  var generator = new _CodeGenerator2.default(context);

  generator.printOnNewline('/* @flow */');
  generator.printOnNewline('//  This file was automatically generated and should not be edited.');
  typeDeclarationForGraphQLType(context.typesUsed.forEach(function (type) {
    return typeDeclarationForGraphQLType(generator, type);
  }));
  (0, _values2.default)(context.operations).forEach(function (operation) {
    interfaceVariablesDeclarationForOperation(generator, operation);
    typeDeclarationForOperation(generator, operation);
  });
  (0, _values2.default)(context.fragments).forEach(function (operation) {
    return typeDeclarationForFragment(generator, operation);
  });

  return generator.output;
}

function typeDeclarationForGraphQLType(generator, type) {
  if (type instanceof _graphql.GraphQLEnumType) {
    enumerationDeclaration(generator, type);
  } else if (type instanceof _graphql.GraphQLInputObjectType) {
    structDeclarationForInputObjectType(generator, type);
  }
}

function enumerationDeclaration(generator, type) {
  var name = type.name,
      description = type.description;

  var values = type.getValues();

  generator.printNewlineIfNeeded();
  generator.printOnNewline(description && '// ' + description);
  generator.printOnNewline('export type ' + name + ' =');
  var nValues = values.length;
  values.forEach(function (value, i) {
    return generator.printOnNewline('  "' + value.value + '"' + (i === nValues - 1 ? ';' : ' |') + (0, _printing.wrap)(' // ', value.description));
  });
  generator.printNewline();
}

function structDeclarationForInputObjectType(generator, type) {
  var interfaceName = (0, _changeCase.pascalCase)(type.name);
  (0, _language.typeDeclaration)(generator, {
    interfaceName: interfaceName
  }, function () {
    var properties = propertiesFromFields(generator.context, (0, _values2.default)(type.getFields()));
    propertyDeclarations(generator, properties, true);
  });
}

function interfaceNameFromOperation(_ref) {
  var operationName = _ref.operationName,
      operationType = _ref.operationType;

  switch (operationType) {
    case 'query':
      return (0, _changeCase.pascalCase)(operationName) + 'Query';
      break;
    case 'mutation':
      return (0, _changeCase.pascalCase)(operationName) + 'Mutation';
      break;
    case 'subscription':
      return (0, _changeCase.pascalCase)(operationName) + 'Subscription';
      break;
    default:
      throw new _graphql.GraphQLError('Unsupported operation type "' + operationType + '"');
  }
}

function interfaceVariablesDeclarationForOperation(generator, _ref2) {
  var operationName = _ref2.operationName,
      operationType = _ref2.operationType,
      variables = _ref2.variables,
      fields = _ref2.fields,
      fragmentsReferenced = _ref2.fragmentsReferenced,
      source = _ref2.source;

  if (!variables || variables.length < 1) {
    return null;
  }
  var interfaceName = interfaceNameFromOperation({ operationName: operationName, operationType: operationType }) + 'Variables';

  (0, _language.typeDeclaration)(generator, {
    interfaceName: interfaceName
  }, function () {
    var properties = propertiesFromFields(generator.context, variables);
    propertyDeclarations(generator, properties, true);
  });
}

function typeDeclarationForOperation(generator, _ref3) {
  var operationName = _ref3.operationName,
      operationType = _ref3.operationType,
      variables = _ref3.variables,
      fields = _ref3.fields,
      fragmentSpreads = _ref3.fragmentSpreads,
      fragmentsReferenced = _ref3.fragmentsReferenced,
      source = _ref3.source;

  var interfaceName = interfaceNameFromOperation({ operationName: operationName, operationType: operationType });
  (0, _language.typeDeclaration)(generator, {
    interfaceName: interfaceName,
    extendTypes: fragmentSpreads ? fragmentSpreads.map(function (f) {
      return (0, _changeCase.pascalCase)(f) + 'Fragment';
    }) : null
  }, function () {
    var properties = propertiesFromFields(generator.context, fields);
    propertyDeclarations(generator, properties, true);
  });
}

function typeDeclarationForFragment(generator, _ref4) {
  var fragmentName = _ref4.fragmentName,
      typeCondition = _ref4.typeCondition,
      fields = _ref4.fields,
      inlineFragments = _ref4.inlineFragments,
      fragmentSpreads = _ref4.fragmentSpreads,
      source = _ref4.source;

  var interfaceName = (0, _changeCase.pascalCase)(fragmentName) + 'Fragment';

  (0, _language.typeDeclaration)(generator, {
    interfaceName: interfaceName,
    extendTypes: fragmentSpreads ? fragmentSpreads.map(function (f) {
      return (0, _changeCase.pascalCase)(f) + 'Fragment';
    }) : null
  }, function () {
    var _propertiesFromFields;

    var properties = (_propertiesFromFields = propertiesFromFields(generator.context, fields)).concat.apply(_propertiesFromFields, (0, _toConsumableArray3.default)((inlineFragments || []).map(function (fragment) {
      return propertiesFromFields(generator.context, fragment.fields, true);
    })));

    propertyDeclarations(generator, properties, true);
  });
}

function propertiesFromFields(context, fields, forceNullable) {
  return fields.map(function (field) {
    return propertyFromField(context, field, forceNullable);
  });
}

function propertyFromField(context, field, forceNullable) {
  var fieldName = field.name,
      fieldType = field.type,
      description = field.description,
      fragmentSpreads = field.fragmentSpreads,
      inlineFragments = field.inlineFragments;

  fieldName = fieldName || field.responseName;

  var propertyName = fieldName;

  var property = { fieldName: fieldName, fieldType: fieldType, propertyName: propertyName, description: description };

  var namedType = (0, _graphql.getNamedType)(fieldType);

  if ((0, _graphql.isCompositeType)(namedType)) {
    var bareTypeName = (0, _changeCase.pascalCase)(_inflected2.default.singularize(propertyName));
    var typeName = (0, _types.typeNameFromGraphQLType)(context, fieldType, bareTypeName);
    var isArray = false;
    if (fieldType instanceof _graphql.GraphQLList) {
      isArray = true;
    }
    var isNullable = true;
    if (fieldType instanceof _graphql.GraphQLNonNull && !forceNullable) {
      isNullable = false;
    }
    return (0, _extends3.default)({}, property, {
      typeName: typeName, bareTypeName: bareTypeName, fields: field.fields, isComposite: true, fragmentSpreads: fragmentSpreads, inlineFragments: inlineFragments, fieldType: fieldType,
      isArray: isArray, isNullable: isNullable
    });
  } else {
    var _typeName = (0, _types.typeNameFromGraphQLType)(context, fieldType);
    return (0, _extends3.default)({}, property, { typeName: _typeName, isComposite: false, fieldType: fieldType });
  }
}

function propertyDeclarations(generator, properties, inInterface) {
  if (!properties) return;
  properties.forEach(function (property) {
    if (property.fields && property.fields.length > 0 || property.inlineFragments && property.inlineFragments.length > 0) {
      (0, _language.propertyDeclaration)(generator, (0, _extends3.default)({}, property, { inInterface: inInterface }), function () {
        var _propertiesFromFields2;

        var properties = (_propertiesFromFields2 = propertiesFromFields(generator.context, property.fields)).concat.apply(_propertiesFromFields2, (0, _toConsumableArray3.default)((property.inlineFragments || []).map(function (fragment) {
          return propertiesFromFields(generator.context, fragment.fields, true);
        })));
        propertyDeclarations(generator, properties);
      });
    } else {
      (0, _language.propertyDeclaration)(generator, (0, _extends3.default)({}, property, { inInterface: inInterface }));
    }
  });
}
//# sourceMappingURL=codeGeneration.js.map