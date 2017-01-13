'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Compiler = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

exports.compileToIR = compileToIR;
exports.printIR = printIR;

var _graphql = require('graphql');

var _graphql2 = require('./utilities/graphql');

var _printing = require('./utilities/printing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Parts of this code are adapted from graphql-js

function compileToIR(schema, document) {
  var compiler = new Compiler(schema, document);

  var operations = (0, _create2.default)(null);

  compiler.operations.forEach(function (operation) {
    operations[operation.name.value] = compiler.compileOperation(operation);
  });

  var fragments = (0, _create2.default)(null);

  compiler.fragments.forEach(function (fragment) {
    fragments[fragment.name.value] = compiler.compileFragment(fragment);
  });

  var typesUsed = compiler.typesUsed;

  return { schema: schema, operations: operations, fragments: fragments, typesUsed: typesUsed };
}

var Compiler = exports.Compiler = function () {
  function Compiler(schema, document) {
    (0, _classCallCheck3.default)(this, Compiler);

    this.schema = schema;

    this.typesUsedSet = new _set2.default();

    this.fragmentMap = (0, _create2.default)(null);
    this.operations = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(document.definitions), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var definition = _step.value;

        switch (definition.kind) {
          case _graphql.Kind.OPERATION_DEFINITION:
            this.operations.push(definition);
            break;
          case _graphql.Kind.FRAGMENT_DEFINITION:
            this.fragmentMap[definition.name.value] = definition;
            break;
        }
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

    this.compiledFragmentMap = (0, _create2.default)(null);
  }

  (0, _createClass3.default)(Compiler, [{
    key: 'addTypeUsed',
    value: function addTypeUsed(type) {
      if (type instanceof _graphql.GraphQLEnumType || type instanceof _graphql.GraphQLInputObjectType) {
        this.typesUsedSet.add(type);
      }
      if (type instanceof _graphql.GraphQLInputObjectType) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = (0, _getIterator3.default)((0, _values2.default)(type.getFields())), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var field = _step2.value;

            this.addTypeUsed((0, _graphql.getNamedType)(field.type));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }
  }, {
    key: 'fragmentNamed',
    value: function fragmentNamed(fragmentName) {
      return this.fragmentMap[fragmentName];
    }
  }, {
    key: 'compileOperation',
    value: function compileOperation(operationDefinition) {
      var _this = this;

      var operationName = operationDefinition.name.value;
      var operationType = operationDefinition.operation;

      var variables = operationDefinition.variableDefinitions.map(function (node) {
        var name = node.variable.name.value;
        var type = (0, _graphql.typeFromAST)(_this.schema, node.type);
        _this.addTypeUsed((0, _graphql.getNamedType)(type));
        return { name: name, type: type };
      });

      var source = (0, _graphql.print)(withTypenameFieldAddedWhereNeeded(this.schema, operationDefinition));

      var rootType = (0, _graphql2.getOperationRootType)(this.schema, operationDefinition);

      var groupedVisitedFragmentSet = new _map2.default();
      var groupedFieldSet = this.collectFields(rootType, operationDefinition.selectionSet, undefined, groupedVisitedFragmentSet);

      var fragmentsReferencedSet = (0, _create2.default)(null);

      var _resolveFields = this.resolveFields(rootType, groupedFieldSet, groupedVisitedFragmentSet, fragmentsReferencedSet),
          fields = _resolveFields.fields;

      var fragmentsReferenced = (0, _keys2.default)(fragmentsReferencedSet);

      return { operationName: operationName, operationType: operationType, variables: variables, source: source, fields: fields, fragmentsReferenced: fragmentsReferenced };
    }
  }, {
    key: 'compileFragment',
    value: function compileFragment(fragmentDefinition) {
      var fragmentName = fragmentDefinition.name.value;

      var source = (0, _graphql.print)(withTypenameFieldAddedWhereNeeded(this.schema, fragmentDefinition));

      var typeCondition = (0, _graphql.typeFromAST)(this.schema, fragmentDefinition.typeCondition);

      var groupedVisitedFragmentSet = new _map2.default();
      var groupedFieldSet = this.collectFields(typeCondition, fragmentDefinition.selectionSet, undefined, groupedVisitedFragmentSet);

      var fragmentsReferencedSet = (0, _create2.default)(null);

      var _resolveFields2 = this.resolveFields(typeCondition, groupedFieldSet, groupedVisitedFragmentSet, fragmentsReferencedSet),
          fields = _resolveFields2.fields,
          fragmentSpreads = _resolveFields2.fragmentSpreads,
          inlineFragments = _resolveFields2.inlineFragments;

      var fragmentsReferenced = (0, _keys2.default)(fragmentsReferencedSet);

      return { fragmentName: fragmentName, source: source, typeCondition: typeCondition, fields: fields, fragmentSpreads: fragmentSpreads, inlineFragments: inlineFragments, fragmentsReferenced: fragmentsReferenced };
    }
  }, {
    key: 'collectFields',
    value: function collectFields(parentType, selectionSet) {
      var groupedFieldSet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _create2.default)(null);
      var groupedVisitedFragmentSet = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new _map2.default();

      if (!(0, _graphql.isCompositeType)(parentType)) {
        throw new Error('parentType should be a composite type, but is "' + String(parentType) + '"');
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = (0, _getIterator3.default)(selectionSet.selections), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var selection = _step3.value;

          switch (selection.kind) {
            case _graphql.Kind.FIELD:
              {
                var fieldName = selection.name.value;
                var responseName = selection.alias ? selection.alias.value : fieldName;

                var field = (0, _graphql2.getFieldDef)(this.schema, parentType, selection);
                if (!field) {
                  throw new _graphql.GraphQLError('Cannot query field "' + fieldName + '" on type "' + String(parentType) + '"', [selection]);
                }

                if (groupedFieldSet) {
                  if (!groupedFieldSet[responseName]) {
                    groupedFieldSet[responseName] = [];
                  }

                  groupedFieldSet[responseName].push([parentType, { responseName: responseName, fieldName: fieldName, type: field.type, directives: selection.directives, selectionSet: selection.selectionSet }]);
                }
                break;
              }
            case _graphql.Kind.INLINE_FRAGMENT:
              {
                var typeCondition = selection.typeCondition;
                var inlineFragmentType = typeCondition ? (0, _graphql.typeFromAST)(this.schema, typeCondition) : parentType;

                var effectiveType = parentType instanceof _graphql.GraphQLObjectType ? parentType : inlineFragmentType;

                this.collectFields(effectiveType, selection.selectionSet, groupedFieldSet, groupedVisitedFragmentSet);
                break;
              }
            case _graphql.Kind.FRAGMENT_SPREAD:
              {
                var fragmentName = selection.name.value;

                var fragment = this.fragmentNamed(fragmentName);
                if (!fragment) throw new _graphql.GraphQLError('Cannot find fragment "' + fragmentName + '"');

                var _typeCondition = fragment.typeCondition;
                var fragmentType = (0, _graphql.typeFromAST)(this.schema, _typeCondition);

                if (groupedVisitedFragmentSet) {
                  var visitedFragmentSet = groupedVisitedFragmentSet.get(parentType);
                  if (!visitedFragmentSet) {
                    visitedFragmentSet = {};
                    groupedVisitedFragmentSet.set(parentType, visitedFragmentSet);
                  }

                  if (visitedFragmentSet[fragmentName]) continue;
                  visitedFragmentSet[fragmentName] = true;
                }

                var _effectiveType = parentType instanceof _graphql.GraphQLObjectType ? parentType : fragmentType;

                this.collectFields(_effectiveType, fragment.selectionSet, null, groupedVisitedFragmentSet);
                break;
              }
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return groupedFieldSet;
    }
  }, {
    key: 'mergeSelectionSets',
    value: function mergeSelectionSets(parentType, fieldSet, groupedVisitedFragmentSet) {
      var groupedFieldSet = (0, _create2.default)(null);

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = (0, _getIterator3.default)(fieldSet), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2),
              field = _step4$value[1];

          var selectionSet = field.selectionSet;

          if (selectionSet) {
            this.collectFields(parentType, selectionSet, groupedFieldSet, groupedVisitedFragmentSet);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return groupedFieldSet;
    }
  }, {
    key: 'resolveFields',
    value: function resolveFields(parentType, groupedFieldSet, groupedVisitedFragmentSet, fragmentsReferencedSet) {
      var _this2 = this;

      var fields = [];

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = (0, _getIterator3.default)((0, _entries2.default)(groupedFieldSet)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _step5$value = (0, _slicedToArray3.default)(_step5.value, 2),
              responseName = _step5$value[0],
              fieldSet = _step5$value[1];

          fieldSet = fieldSet.filter(function (_ref) {
            var _ref2 = (0, _slicedToArray3.default)(_ref, 1),
                typeCondition = _ref2[0];

            return (0, _graphql.isTypeSubTypeOf)(_this2.schema, parentType, typeCondition);
          });
          if (fieldSet.length < 1) continue;

          var _fieldSet$ = (0, _slicedToArray3.default)(fieldSet[0], 2),
              firstField = _fieldSet$[1];

          var fieldName = firstField.fieldName;
          var type = firstField.type;

          var field = { responseName: responseName, fieldName: fieldName, type: type };

          var isConditional = fieldSet.some(function (_ref3) {
            var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
                field = _ref4[1];

            return field.directives && field.directives.some(function (directive) {
              var directiveName = directive.name.value;
              return directiveName == 'skip' || directiveName == 'include';
            });
          });

          if (isConditional) {
            field.isConditional = true;
          }

          var bareType = (0, _graphql.getNamedType)(type);

          this.addTypeUsed(bareType);

          if ((0, _graphql.isCompositeType)(bareType)) {
            var subSelectionGroupedVisitedFragmentSet = new _map2.default();
            var subSelectionGroupedFieldSet = this.mergeSelectionSets(bareType, fieldSet, subSelectionGroupedVisitedFragmentSet);

            var _resolveFields3 = this.resolveFields(bareType, subSelectionGroupedFieldSet, subSelectionGroupedVisitedFragmentSet, fragmentsReferencedSet),
                _fields = _resolveFields3.fields,
                _fragmentSpreads = _resolveFields3.fragmentSpreads,
                _inlineFragments = _resolveFields3.inlineFragments;

            (0, _assign2.default)(field, { fields: _fields, fragmentSpreads: _fragmentSpreads, inlineFragments: _inlineFragments });
          }

          fields.push(field);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var fragmentSpreads = this.fragmentSpreadsForParentType(parentType, groupedVisitedFragmentSet);
      var inlineFragments = this.resolveInlineFragments(parentType, groupedFieldSet, groupedVisitedFragmentSet, fragmentsReferencedSet);

      if (fragmentsReferencedSet) {
        _assign2.default.apply(Object, [fragmentsReferencedSet].concat((0, _toConsumableArray3.default)(groupedVisitedFragmentSet.values())));

        // TODO: This is a really inefficient way of keeping track of fragments referenced by other fragments
        // We need to either cache compiled fragments or find a way to make resolveFields smarter
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = (0, _getIterator3.default)(fragmentSpreads), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var fragmentName = _step6.value;

            var fragment = this.fragmentNamed(fragmentName);
            if (!fragment) throw new _graphql.GraphQLError('Cannot find fragment "' + fragmentName + '"');

            var _compileFragment = this.compileFragment(fragment),
                fragmentsReferencedFromFragment = _compileFragment.fragmentsReferenced;

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
              for (var _iterator7 = (0, _getIterator3.default)(fragmentsReferencedFromFragment), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var fragmentReferenced = _step7.value;

                fragmentsReferencedSet[fragmentReferenced] = true;
              }
            } catch (err) {
              _didIteratorError7 = true;
              _iteratorError7 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                  _iterator7.return();
                }
              } finally {
                if (_didIteratorError7) {
                  throw _iteratorError7;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }

      return { fields: fields, fragmentSpreads: fragmentSpreads, inlineFragments: inlineFragments };
    }
  }, {
    key: 'resolveInlineFragments',
    value: function resolveInlineFragments(parentType, groupedFieldSet, groupedVisitedFragmentSet, fragmentsReferencedSet) {
      var _this3 = this;

      return this.collectPossibleTypes(parentType, groupedFieldSet, groupedVisitedFragmentSet).map(function (typeCondition) {
        var _resolveFields4 = _this3.resolveFields(typeCondition, groupedFieldSet, groupedVisitedFragmentSet, fragmentsReferencedSet),
            fields = _resolveFields4.fields,
            fragmentSpreads = _resolveFields4.fragmentSpreads;

        return { typeCondition: typeCondition, fields: fields, fragmentSpreads: fragmentSpreads };
      });
    }
  }, {
    key: 'collectPossibleTypes',
    value: function collectPossibleTypes(parentType, groupedFieldSet, groupedVisitedFragmentSet) {
      if (!(0, _graphql.isAbstractType)(parentType)) return [];

      var possibleTypes = new _set2.default();

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = (0, _getIterator3.default)((0, _values2.default)(groupedFieldSet)), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var fieldSet = _step8.value;
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = (0, _getIterator3.default)(fieldSet), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var _step10$value = (0, _slicedToArray3.default)(_step10.value, 1),
                  typeCondition = _step10$value[0];

              if (this.schema.isPossibleType(parentType, typeCondition)) {
                possibleTypes.add(typeCondition);
              }
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }
        }

        // Also include type conditions for fragment spreads
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      if (groupedVisitedFragmentSet) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = (0, _getIterator3.default)(groupedVisitedFragmentSet.keys()), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var effectiveType = _step9.value;

            if (this.schema.isPossibleType(parentType, effectiveType)) {
              possibleTypes.add(effectiveType);
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }

      return (0, _from2.default)(possibleTypes);
    }
  }, {
    key: 'fragmentSpreadsForParentType',
    value: function fragmentSpreadsForParentType(parentType, groupedVisitedFragmentSet) {
      if (!groupedVisitedFragmentSet) return [];

      var fragmentSpreads = new _set2.default();

      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = (0, _getIterator3.default)(groupedVisitedFragmentSet), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var _step11$value = (0, _slicedToArray3.default)(_step11.value, 2),
              effectiveType = _step11$value[0],
              visitedFragmentSet = _step11$value[1];

          if (!(0, _graphql2.isTypeProperSuperTypeOf)(this.schema, effectiveType, parentType)) continue;

          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = (0, _getIterator3.default)((0, _keys2.default)(visitedFragmentSet)), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var fragmentName = _step12.value;

              fragmentSpreads.add(fragmentName);
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      return (0, _from2.default)(fragmentSpreads);
    }
  }, {
    key: 'typesUsed',
    get: function get() {
      return (0, _from2.default)(this.typesUsedSet);
    }
  }, {
    key: 'fragments',
    get: function get() {
      return (0, _values2.default)(this.fragmentMap);
    }
  }]);
  return Compiler;
}();

var typenameField = { kind: _graphql.Kind.FIELD, name: { kind: _graphql.Kind.NAME, value: '__typename' } };

function withTypenameFieldAddedWhereNeeded(schema, ast) {
  var typeInfo = new _graphql.TypeInfo(schema);

  return (0, _graphql.visit)(ast, (0, _graphql.visitWithTypeInfo)(typeInfo, {
    leave: {
      SelectionSet: function SelectionSet(node) {
        var parentType = typeInfo.getParentType();

        if ((0, _graphql.isAbstractType)(parentType)) {
          return (0, _extends3.default)({}, node, { selections: [typenameField].concat((0, _toConsumableArray3.default)(node.selections)) });
        }
      }
    }
  }));
}

function sourceAt(location) {
  return location.source.body.slice(location.start, location.end);
}

function printIR(_ref5) {
  var fields = _ref5.fields,
      inlineFragments = _ref5.inlineFragments,
      fragmentSpreads = _ref5.fragmentSpreads;

  return fields && (0, _printing.wrap)('<', (0, _printing.join)(fragmentSpreads, ', '), '> ') + (0, _printing.block)(fields.map(function (field) {
    return field.name + ': ' + String(field.type) + (0, _printing.wrap)(' ', printIR(field));
  }).concat(inlineFragments && inlineFragments.map(function (inlineFragment) {
    return '' + String(inlineFragment.typeCondition) + (0, _printing.wrap)(' ', printIR(inlineFragment));
  })));
}
//# sourceMappingURL=compilation.js.map