'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.classDeclaration = classDeclaration;
exports.structDeclaration = structDeclaration;
exports.propertyDeclaration = propertyDeclaration;
exports.propertyDeclarations = propertyDeclarations;
exports.protocolDeclaration = protocolDeclaration;
exports.protocolPropertyDeclaration = protocolPropertyDeclaration;
exports.protocolPropertyDeclarations = protocolPropertyDeclarations;

var _printing = require('../utilities/printing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function classDeclaration(generator, _ref, closure) {
  var className = _ref.className,
      modifiers = _ref.modifiers,
      superClass = _ref.superClass,
      _ref$adoptedProtocols = _ref.adoptedProtocols,
      adoptedProtocols = _ref$adoptedProtocols === undefined ? [] : _ref$adoptedProtocols,
      properties = _ref.properties;

  generator.printNewlineIfNeeded();
  generator.printNewline();
  generator.print((0, _printing.wrap)('', (0, _printing.join)(modifiers, ' '), ' '));
  generator.print('class ' + className);
  generator.print((0, _printing.wrap)(': ', (0, _printing.join)([superClass].concat((0, _toConsumableArray3.default)(adoptedProtocols)), ', ')));
  generator.pushScope({ typeName: className });
  generator.withinBlock(closure);
  generator.popScope();
}

function structDeclaration(generator, _ref2, closure) {
  var structName = _ref2.structName,
      description = _ref2.description,
      _ref2$adoptedProtocol = _ref2.adoptedProtocols,
      adoptedProtocols = _ref2$adoptedProtocol === undefined ? [] : _ref2$adoptedProtocol;

  generator.printNewlineIfNeeded();
  generator.printOnNewline(description && '/// ' + description);
  generator.printOnNewline('public struct ' + structName);
  generator.print((0, _printing.wrap)(': ', (0, _printing.join)(adoptedProtocols, ', ')));
  generator.pushScope({ typeName: structName });
  generator.withinBlock(closure);
  generator.popScope();
}

function propertyDeclaration(generator, _ref3) {
  var propertyName = _ref3.propertyName,
      typeName = _ref3.typeName,
      description = _ref3.description;

  generator.printOnNewline('public let ' + propertyName + ': ' + typeName);
  generator.print(description && ' /// ' + description);
}

function propertyDeclarations(generator, properties) {
  if (!properties) return;
  properties.forEach(function (property) {
    return propertyDeclaration(generator, property);
  });
}

function protocolDeclaration(generator, _ref4, closure) {
  var protocolName = _ref4.protocolName,
      adoptedProtocols = _ref4.adoptedProtocols,
      properties = _ref4.properties;

  generator.printNewlineIfNeeded();
  generator.printOnNewline('public protocol ' + protocolName);
  generator.print((0, _printing.wrap)(': ', (0, _printing.join)(adoptedProtocols, ', ')));
  generator.pushScope({ typeName: protocolName });
  generator.withinBlock(closure);
  generator.popScope();
}

function protocolPropertyDeclaration(generator, _ref5) {
  var propertyName = _ref5.propertyName,
      typeName = _ref5.typeName;

  generator.printOnNewline('var ' + propertyName + ': ' + typeName + ' { get }');
}

function protocolPropertyDeclarations(generator, properties) {
  if (!properties) return;
  properties.forEach(function (property) {
    return protocolPropertyDeclaration(generator, property);
  });
}
//# sourceMappingURL=language.js.map