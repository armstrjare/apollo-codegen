'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isTypeProperSuperTypeOf = isTypeProperSuperTypeOf;
exports.getOperationRootType = getOperationRootType;
exports.getFieldDef = getFieldDef;

var _graphql = require('graphql');

function isTypeProperSuperTypeOf(schema, maybeSuperType, subType) {
  return (0, _graphql.isEqualType)(maybeSuperType, subType) || (0, _graphql.isAbstractType)(maybeSuperType) && schema.isPossibleType(maybeSuperType, subType);
}

// Utility functions extracted from graphql-js

/**
 * Extracts the root type of the operation from the schema.
 */
function getOperationRootType(schema, operation) {
  switch (operation.operation) {
    case 'query':
      return schema.getQueryType();
    case 'mutation':
      var mutationType = schema.getMutationType();
      if (!mutationType) {
        throw new GraphQLError('Schema is not configured for mutations', [operation]);
      }
      return mutationType;
    case 'subscription':
      var subscriptionType = schema.getSubscriptionType();
      if (!subscriptionType) {
        throw new GraphQLError('Schema is not configured for subscriptions', [operation]);
      }
      return subscriptionType;
    default:
      throw new GraphQLError('Can only compile queries, mutations and subscriptions', [operation]);
  }
}

/**
 * Not exactly the same as the executor's definition of getFieldDef, in this
 * statically evaluated environment we do not always have an Object type,
 * and need to handle Interface and Union types.
 */
function getFieldDef(schema, parentType, fieldAST) {
  var name = fieldAST.name.value;
  if (name === _graphql.SchemaMetaFieldDef.name && schema.getQueryType() === parentType) {
    return _graphql.SchemaMetaFieldDef;
  }
  if (name === _graphql.TypeMetaFieldDef.name && schema.getQueryType() === parentType) {
    return _graphql.TypeMetaFieldDef;
  }
  if (name === _graphql.TypeNameMetaFieldDef.name && (parentType instanceof _graphql.GraphQLObjectType || parentType instanceof _graphql.GraphQLInterfaceType || parentType instanceof _graphql.GraphQLUnionType)) {
    return _graphql.TypeNameMetaFieldDef;
  }
  if (parentType instanceof _graphql.GraphQLObjectType || parentType instanceof _graphql.GraphQLInterfaceType) {
    return parentType.getFields()[name];
  }
}
//# sourceMappingURL=graphql.js.map