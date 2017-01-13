'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escapedString = escapedString;
exports.multilineString = multilineString;
function escapedString(string) {
  return string.replace(/"/g, '\\"');
}

function multilineString(context, string) {
  var lines = string.split('\n');
  lines.forEach(function (line, index) {
    var isLastLine = index != lines.length - 1;
    context.printOnNewline('"' + escapedString(line) + '"' + (isLastLine ? ' +' : ''));
  });
}
//# sourceMappingURL=strings.js.map