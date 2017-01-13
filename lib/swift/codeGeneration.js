'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

exports.generateSource = generateSource;
exports.classDeclarationForOperation = classDeclarationForOperation;
exports.initializerDeclarationForProperties = initializerDeclarationForProperties;
exports.mappedProperty = mappedProperty;
exports.structDeclarationForFragment = structDeclarationForFragment;
exports.structDeclarationForSelectionSet = structDeclarationForSelectionSet;
exports.initializationForProperty = initializationForProperty;
exports.propertiesFromFields = propertiesFromFields;
exports.propertyFromField = propertyFromField;
exports.structNameForProperty = structNameForProperty;
exports.typeNameForFragmentName = typeNameForFragmentName;
exports.possibleTypesForType = possibleTypesForType;
exports.typeDeclarationForGraphQLType = typeDeclarationForGraphQLType;

var _graphql = require('graphql');

var _graphql2 = require('../utilities/graphql');

var _changeCase = require('change-case');

var _inflected = require('inflected');

var _inflected2 = _interopRequireDefault(_inflected);

var _printing = require('../utilities/printing');

var _language = require('./language');

var _strings = require('./strings');

var _types = require('./types');

var _CodeGenerator = require('../utilities/CodeGenerator');

var _CodeGenerator2 = _interopRequireDefault(_CodeGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generateSource(context) {
  var generator = new _CodeGenerator2.default(context);

  generator.printOnNewline('//  This file was automatically generated and should not be edited.');
  generator.printNewline();
  generator.printOnNewline('import Apollo');

  context.typesUsed.forEach(function (type) {
    typeDeclarationForGraphQLType(generator, type);
  });

  (0, _values2.default)(context.operations).forEach(function (operation) {
    classDeclarationForOperation(generator, operation);
  });

  (0, _values2.default)(context.fragments).forEach(function (fragment) {
    structDeclarationForFragment(generator, fragment);
  });

  return generator.output;
}

function classDeclarationForOperation(generator, _ref) {
  var operationName = _ref.operationName,
      operationType = _ref.operationType,
      variables = _ref.variables,
      fields = _ref.fields,
      fragmentsReferenced = _ref.fragmentsReferenced,
      source = _ref.source;


  var className = void 0;
  var protocol = void 0;

  switch (operationType) {
    case 'query':
      className = (0, _changeCase.pascalCase)(operationName) + 'Query';
      protocol = 'GraphQLQuery';
      break;
    case 'mutation':
      className = (0, _changeCase.pascalCase)(operationName) + 'Mutation';
      protocol = 'GraphQLMutation';
      break;
    default:
      throw new _graphql.GraphQLError('Unsupported operation type "' + operationType + '"');
  }

  (0, _language.classDeclaration)(generator, {
    className: className,
    modifiers: ['public', 'final'],
    adoptedProtocols: [protocol]
  }, function () {
    if (source) {
      generator.printOnNewline('public static let operationDefinition =');
      generator.withIndent(function () {
        (0, _strings.multilineString)(generator, source);
      });
    }

    if (fragmentsReferenced && fragmentsReferenced.length > 0) {
      generator.printOnNewline('public static let queryDocument = operationDefinition');
      fragmentsReferenced.forEach(function (fragment) {
        generator.print('.appending(' + typeNameForFragmentName(fragment) + '.fragmentDefinition)');
      });
    }

    if (variables && variables.length > 0) {
      (function () {
        var properties = variables.map(function (_ref2) {
          var name = _ref2.name,
              type = _ref2.type;

          var propertyName = (0, _changeCase.camelCase)(name);
          var typeName = (0, _types.typeNameFromGraphQLType)(generator.context, type);
          var isOptional = !(type instanceof _graphql.GraphQLNonNull || type.ofType instanceof _graphql.GraphQLNonNull);
          return { name: name, propertyName: propertyName, type: type, typeName: typeName, isOptional: isOptional };
        });
        generator.printNewlineIfNeeded();
        (0, _language.propertyDeclarations)(generator, properties);
        generator.printNewlineIfNeeded();
        initializerDeclarationForProperties(generator, properties);
        generator.printNewlineIfNeeded();
        generator.printOnNewline('public var variables: GraphQLMap?');
        generator.withinBlock(function () {
          generator.printOnNewline((0, _printing.wrap)('return [', (0, _printing.join)(properties.map(function (_ref3) {
            var name = _ref3.name,
                propertyName = _ref3.propertyName;
            return '"' + name + '": ' + propertyName;
          }), ', '), ']'));
        });
      })();
    } else {
      initializerDeclarationForProperties(generator, []);
    }

    structDeclarationForSelectionSet(generator, {
      structName: "Data",
      fields: fields
    });
  });
}

function initializerDeclarationForProperties(generator, properties) {
  generator.printOnNewline('public init');
  generator.print('(');
  generator.print((0, _printing.join)(properties.map(function (_ref4) {
    var propertyName = _ref4.propertyName,
        type = _ref4.type,
        typeName = _ref4.typeName,
        isOptional = _ref4.isOptional;
    return (0, _printing.join)([propertyName + ': ' + typeName, isOptional && ' = nil']);
  }), ', '));
  generator.print(')');

  generator.withinBlock(function () {
    properties.forEach(function (_ref5) {
      var propertyName = _ref5.propertyName;

      generator.printOnNewline('self.' + propertyName + ' = ' + propertyName);
    });
  });
}

function mappedProperty(generator, _ref6, properties) {
  var propertyName = _ref6.propertyName,
      propertyType = _ref6.propertyType;

  generator.printOnNewline('public var ' + propertyName + ': ' + propertyType);
  generator.withinBlock(function () {
    generator.printOnNewline((0, _printing.wrap)('return [', (0, _printing.join)(properties.map(function (_ref7) {
      var propertyName = _ref7.propertyName;
      return '"' + propertyName + '": ' + propertyName;
    }), ', '), ']'));
  });
}

function structDeclarationForFragment(generator, _ref8) {
  var fragmentName = _ref8.fragmentName,
      typeCondition = _ref8.typeCondition,
      fields = _ref8.fields,
      inlineFragments = _ref8.inlineFragments,
      fragmentSpreads = _ref8.fragmentSpreads,
      source = _ref8.source;

  var structName = (0, _changeCase.pascalCase)(fragmentName);

  structDeclarationForSelectionSet(generator, {
    structName: structName,
    adoptedProtocols: ['GraphQLNamedFragment'],
    parentType: typeCondition,
    possibleTypes: possibleTypesForType(generator.context, typeCondition),
    fields: fields,
    fragmentSpreads: fragmentSpreads,
    inlineFragments: inlineFragments
  }, function () {
    if (source) {
      generator.printOnNewline('public static let fragmentDefinition =');
      generator.withIndent(function () {
        (0, _strings.multilineString)(generator, source);
      });
    }
  });
}

function structDeclarationForSelectionSet(generator, _ref9, beforeClosure) {
  var structName = _ref9.structName,
      _ref9$adoptedProtocol = _ref9.adoptedProtocols,
      adoptedProtocols = _ref9$adoptedProtocol === undefined ? ['GraphQLMappable'] : _ref9$adoptedProtocol,
      parentType = _ref9.parentType,
      possibleTypes = _ref9.possibleTypes,
      fields = _ref9.fields,
      fragmentSpreads = _ref9.fragmentSpreads,
      inlineFragments = _ref9.inlineFragments;

  (0, _language.structDeclaration)(generator, { structName: structName, adoptedProtocols: adoptedProtocols }, function () {
    if (beforeClosure) {
      beforeClosure();
    }

    if (possibleTypes) {
      generator.printNewlineIfNeeded();
      generator.printOnNewline('public static let possibleTypes = [');
      generator.print((0, _printing.join)(possibleTypes.map(function (type) {
        return '"' + String(type) + '"';
      }), ', '));
      generator.print(']');
    }

    var properties = fields && propertiesFromFields(generator.context, fields);

    var fragmentProperties = fragmentSpreads && fragmentSpreads.map(function (fragmentName) {
      var fragment = generator.context.fragments[fragmentName];
      if (!fragment) {
        throw new _graphql.GraphQLError('Cannot find fragment "' + fragmentName + '"');
      }
      var propertyName = (0, _changeCase.camelCase)(fragmentName);
      var typeName = typeNameForFragmentName(fragmentName);
      var isProperSuperType = (0, _graphql2.isTypeProperSuperTypeOf)(generator.context.schema, fragment.typeCondition, parentType);
      return { propertyName: propertyName, typeName: typeName, bareTypeName: typeName, isProperSuperType: isProperSuperType };
    });

    var inlineFragmentProperties = inlineFragments && inlineFragments.map(function (inlineFragment) {
      var bareTypeName = 'As' + (0, _changeCase.pascalCase)(String(inlineFragment.typeCondition));
      var propertyName = (0, _changeCase.camelCase)(bareTypeName);
      var typeName = bareTypeName + '?';
      return (0, _extends3.default)({}, inlineFragment, { propertyName: propertyName, typeName: typeName, bareTypeName: bareTypeName });
    });

    generator.printNewlineIfNeeded();

    if (parentType) {
      generator.printOnNewline('public let __typename');

      if ((0, _graphql.isAbstractType)(parentType)) {
        generator.print(': String');
      } else {
        generator.print(' = "' + String(parentType) + '"');
      }
    }

    (0, _language.propertyDeclarations)(generator, properties);

    if (fragmentProperties && fragmentProperties.length > 0) {
      generator.printNewlineIfNeeded();
      (0, _language.propertyDeclaration)(generator, { propertyName: 'fragments', typeName: 'Fragments' });
    }

    if (inlineFragmentProperties && inlineFragmentProperties.length > 0) {
      generator.printNewlineIfNeeded();
      (0, _language.propertyDeclarations)(generator, inlineFragmentProperties);
    }

    generator.printNewlineIfNeeded();
    generator.printOnNewline('public init(reader: GraphQLResultReader) throws');
    generator.withinBlock(function () {
      if (parentType && (0, _graphql.isAbstractType)(parentType)) {
        generator.printOnNewline('__typename = try reader.value(for: Field(responseName: "__typename"))');
      }

      if (properties) {
        properties.forEach(function (property) {
          return initializationForProperty(generator, property);
        });
      }

      if (fragmentProperties && fragmentProperties.length > 0) {
        generator.printNewlineIfNeeded();
        fragmentProperties.forEach(function (_ref10) {
          var propertyName = _ref10.propertyName,
              typeName = _ref10.typeName,
              bareTypeName = _ref10.bareTypeName,
              isProperSuperType = _ref10.isProperSuperType;

          generator.printOnNewline('let ' + propertyName + ' = try ' + typeName + '(reader: reader');
          if (isProperSuperType) {
            generator.print(')');
          } else {
            generator.print(', ifTypeMatches: __typename)');
          }
        });
        generator.printOnNewline('fragments = Fragments(');
        generator.print((0, _printing.join)(fragmentSpreads.map(function (fragmentName) {
          var propertyName = (0, _changeCase.camelCase)(fragmentName);
          return propertyName + ': ' + propertyName;
        }), ', '));
        generator.print(')');
      }

      if (inlineFragmentProperties && inlineFragmentProperties.length > 0) {
        generator.printNewlineIfNeeded();
        inlineFragmentProperties.forEach(function (_ref11) {
          var propertyName = _ref11.propertyName,
              typeName = _ref11.typeName,
              bareTypeName = _ref11.bareTypeName;

          generator.printOnNewline(propertyName + ' = try ' + bareTypeName + '(reader: reader, ifTypeMatches: __typename)');
        });
      }
    });

    if (fragmentProperties && fragmentProperties.length > 0) {
      (0, _language.structDeclaration)(generator, {
        structName: 'Fragments'
      }, function () {
        fragmentProperties.forEach(function (_ref12) {
          var propertyName = _ref12.propertyName,
              typeName = _ref12.typeName,
              isProperSuperType = _ref12.isProperSuperType;

          if (!isProperSuperType) {
            typeName += '?';
          }
          (0, _language.propertyDeclaration)(generator, { propertyName: propertyName, typeName: typeName });
        });
      });
    }

    if (inlineFragmentProperties && inlineFragmentProperties.length > 0) {
      inlineFragmentProperties.forEach(function (property) {
        structDeclarationForSelectionSet(generator, {
          structName: property.bareTypeName,
          parentType: property.typeCondition,
          possibleTypes: possibleTypesForType(generator.context, property.typeCondition),
          adoptedProtocols: ['GraphQLConditionalFragment'],
          fields: property.fields,
          fragmentSpreads: property.fragmentSpreads
        });
      });
    }

    if (properties) {
      properties.filter(function (property) {
        return property.isComposite;
      }).forEach(function (property) {
        structDeclarationForSelectionSet(generator, {
          structName: structNameForProperty(property),
          parentType: (0, _graphql.getNamedType)(property.type),
          fields: property.fields,
          fragmentSpreads: property.fragmentSpreads,
          inlineFragments: property.inlineFragments
        });
      });
    }
  });
}

function initializationForProperty(generator, _ref13) {
  var propertyName = _ref13.propertyName,
      responseName = _ref13.responseName,
      fieldName = _ref13.fieldName,
      type = _ref13.type,
      isOptional = _ref13.isOptional;

  var isList = type instanceof _graphql.GraphQLList || type.ofType instanceof _graphql.GraphQLList;

  var methodName = isOptional ? isList ? 'optionalList' : 'optionalValue' : isList ? 'list' : 'value';

  var fieldArgs = (0, _printing.join)(['responseName: "' + responseName + '"', responseName != fieldName ? 'fieldName: "' + fieldName + '"' : null], ', ');
  var args = ['for: Field(' + fieldArgs + ')'];

  generator.printOnNewline(propertyName + ' = try reader.' + methodName + '(' + (0, _printing.join)(args, ', ') + ')');
}

function propertiesFromFields(context, fields) {
  return fields.map(function (field) {
    return propertyFromField(context, field);
  });
}

function propertyFromField(context, field) {
  var name = field.name || field.responseName;
  var propertyName = (0, _changeCase.camelCase)(name);

  var type = field.type;
  var isOptional = field.isConditional || !(type instanceof _graphql.GraphQLNonNull || type.ofType instanceof _graphql.GraphQLNonNull);
  var bareType = (0, _graphql.getNamedType)(type);

  if ((0, _graphql.isCompositeType)(bareType)) {
    var bareTypeName = (0, _changeCase.pascalCase)(_inflected2.default.singularize(propertyName));
    var typeName = (0, _types.typeNameFromGraphQLType)(context, type, bareTypeName, isOptional);
    return (0, _extends3.default)({}, field, { propertyName: propertyName, typeName: typeName, bareTypeName: bareTypeName, isOptional: isOptional, isComposite: true });
  } else {
    var _typeName = (0, _types.typeNameFromGraphQLType)(context, type, undefined, isOptional);
    return (0, _extends3.default)({}, field, { propertyName: propertyName, typeName: _typeName, isOptional: isOptional, isComposite: false });
  }
}

function structNameForProperty(property) {
  return (0, _changeCase.pascalCase)(_inflected2.default.singularize(property.responseName));
}

function typeNameForFragmentName(fragmentName) {
  return (0, _changeCase.pascalCase)(fragmentName);
}

function possibleTypesForType(context, type) {
  if ((0, _graphql.isAbstractType)(type)) {
    return context.schema.getPossibleTypes(type);
  } else {
    return [type];
  }
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
  generator.printOnNewline(description && '/// ' + description);
  generator.printOnNewline('public enum ' + name + ': String');
  generator.withinBlock(function () {
    values.forEach(function (value) {
      return generator.printOnNewline('case ' + (0, _changeCase.camelCase)(value.name) + ' = "' + value.value + '"' + (0, _printing.wrap)(' /// ', value.description));
    });
  });
  generator.printNewline();
  generator.printOnNewline('extension ' + name + ': JSONDecodable, JSONEncodable {}');
}

function structDeclarationForInputObjectType(generator, type) {
  var structName = type.name,
      description = type.description;

  var adoptedProtocols = ['GraphQLMapConvertible'];
  var properties = propertiesFromFields(generator.context, (0, _values2.default)(type.getFields()));

  (0, _language.structDeclaration)(generator, { structName: structName, description: description, adoptedProtocols: adoptedProtocols }, function () {
    generator.printOnNewline('public var graphQLMap: GraphQLMap');

    // Compute permutations with and without optional properties
    var permutations = [[]];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var _ref16;

        var property = _step.value;

        permutations = (_ref16 = []).concat.apply(_ref16, (0, _toConsumableArray3.default)(permutations.map(function (prefix) {
          if (property.isOptional) {
            return [prefix, [].concat((0, _toConsumableArray3.default)(prefix), [property])];
          } else {
            return [[].concat((0, _toConsumableArray3.default)(prefix), [property])];
          }
        })));
      };

      for (var _iterator = (0, _getIterator3.default)(properties), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
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

    permutations.forEach(function (properties) {
      generator.printNewlineIfNeeded();
      generator.printOnNewline('public init');
      generator.print('(');
      generator.print((0, _printing.join)(properties.map(function (_ref14) {
        var propertyName = _ref14.propertyName,
            typeName = _ref14.typeName;
        return propertyName + ': ' + typeName;
      }), ', '));
      generator.print(')');

      generator.withinBlock(function () {
        generator.printOnNewline((0, _printing.wrap)('graphQLMap = [', (0, _printing.join)(properties.map(function (_ref15) {
          var propertyName = _ref15.propertyName;
          return '"' + propertyName + '": ' + propertyName;
        }), ', ') || ':', ']'));
      });
    });
  });
}
//# sourceMappingURL=codeGeneration.js.map