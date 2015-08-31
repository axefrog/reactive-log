'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function makeLogMessage(level, category, args) {
  return {
    level: level,
    category: category,
    args: args
  };
}

function decomposeMessage(msg) {
  // todo: introduce serilog-flavoured log arguments, rather than discarding extra args
  var message = undefined,
      error = null,
      args = msg.args;
  if (args[0] instanceof Error) {
    error = args[0];
    message = error.message;
    args = args.slice(1);
  } else if (args[args.length - 1] instanceof Error) {
    message = args[0];
    error = args[args.length - 1];
    args = args.slice(0, args.length - 1);
  } else if (args[0] instanceof Object) {
    message = '';
  } else {
    message = args[0];
    args = args.slice(1);
  }
  return [msg.level, msg.category, message, error, args];
}

function writeConsole(_ref) {
  var _ref2 = _slicedToArray(_ref, 5);

  var level = _ref2[0];
  var category = _ref2[1];
  var message = _ref2[2];
  var error = _ref2[3];
  var args = _ref2[4];

  var catbg = undefined,
      catfg = undefined,
      msgbg = undefined,
      msgfg = undefined,
      levelLabel = undefined;
  switch (level) {
    case 'trace':
      levelLabel = ' TRACE ';
      catbg = '#eee';
      catfg = '#999';
      msgbg = 'default';
      msgfg = '#999';
      break;
    case 'debug':
      levelLabel = ' DEBUG ';
      catbg = '#63c';
      catfg = 'white';
      msgbg = 'default';
      msgfg = '#63c';
      break;
    case 'info':
      levelLabel = ' INFO  ';
      catbg = '#333';
      catfg = '#eee';
      msgbg = 'default';
      msgfg = 'default';
      break;
    case 'notice':
      levelLabel = '═══════';
      catbg = '#eee';
      catfg = '#ccc';
      msgbg = 'default';
      msgfg = '#36c';
      break;
    case 'success':
      levelLabel = 'SUCCESS';
      catbg = '#9d9';
      catfg = '#262';
      msgbg = 'default';
      msgfg = '#090';
      break;
    case 'warn':
      levelLabel = 'WARNING';
      catbg = '#ee0';
      catfg = '#933';
      msgbg = '#ffe';
      msgfg = '#933';
      break;
    case 'error':
      levelLabel = ' ERROR ';
      catbg = '#900';
      catfg = '#ff3';
      msgbg = 'default';
      msgfg = '#c00';
      break;
    case 'fatal':
      levelLabel = ' FATAL ';
      catbg = '#c00';
      catfg = '#ff0';
      msgbg = '#ff3';
      msgfg = '#c00';
      break;
    default:
      return;
  }
  var formatStr = category ? '%c ' + levelLabel + ' %c %c[' + category + '] ' + message : '%c ' + levelLabel + ' %c %c' + message;
  console.log.apply(console, [formatStr, 'background: ' + catbg + '; color: ' + catfg + ';', '', 'background: ' + msgbg + '; color: ' + msgfg + ';'].concat(_toConsumableArray(args)));
  if (error) {
    console.error(error);
  }
}

var listeners = [];
function addListener(func) {
  if (listeners.indexOf(func) === -1) listeners.push(func);
}
function removeListener(func) {
  var n = listeners.indexOf(func);
  if (n > -1) listeners.splice(n, 1);
}
function multicast(msg) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var func = _step.value;

      func(msg);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function defaultConsoleWriter(msg) {
  writeConsole(decomposeMessage(msg));
}

function createLogger(category) {
  function logger() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    multicast(makeLogMessage('info', category, args));
    return logger;
  }
  logger.trace = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    multicast(makeLogMessage('trace', category, args));return logger;
  };
  logger.debug = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    multicast(makeLogMessage('debug', category, args));return logger;
  };
  logger.notice = function () {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    multicast(makeLogMessage('notice', category, args));return logger;
  };
  logger.success = function () {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    multicast(makeLogMessage('success', category, args));return logger;
  };
  logger.info = logger;
  logger.warn = function () {
    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    multicast(makeLogMessage('warn', category, args));return logger;
  };
  logger.error = function () {
    for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    multicast(makeLogMessage('error', category, args));return logger;
  };
  logger.fatal = function () {
    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    multicast(makeLogMessage('fatal', category, args));return logger;
  };

  return logger;
}

createLogger.setWriteToConsole = function (enabled) {
  if (enabled) addListener(defaultConsoleWriter);else removeListener(defaultConsoleWriter);
};
createLogger.addMessageListener = addListener;
createLogger.removeMessageListener = removeListener;

exports['default'] = createLogger;
module.exports = exports['default'];