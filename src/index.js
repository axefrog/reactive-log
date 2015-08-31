function makeLogMessage(level, category, args) {
  return {
    level: level,
    category: category,
    args: args
  };
}

function decomposeMessage(msg) {
  // todo: introduce serilog-flavoured log arguments, rather than discarding extra args
  let message, error = null, args = msg.args;
  if(args[0] instanceof Error) {
    error = args[0];
    message = error.message;
    args = args.slice(1);
  }
  else if(args[args.length - 1] instanceof Error) {
    message = args[0];
    error = args[args.length - 1];
    args = args.slice(0, args.length - 1);
  }
  else if(args[0] instanceof Object) {
    message = '';
  }
  else {
    message = args[0];
    args = args.slice(1);
  }
  return [msg.level, msg.category, message, error, args];
}

function writeConsole([level, category, message, error, args]) {
  let catbg, catfg, msgbg, msgfg, levelLabel;
  switch(level) {
    case 'trace':    [levelLabel, catbg, catfg, msgbg, msgfg] = [' TRACE ', '#eee', '#999',  'default', '#999']; break;
    case 'debug':    [levelLabel, catbg, catfg, msgbg, msgfg] = [' DEBUG ', '#63c', 'white', 'default', '#63c']; break;
    case 'info':     [levelLabel, catbg, catfg, msgbg, msgfg] = [' INFO  ', '#333', '#eee',  'default', 'default']; break;
    case 'notice':   [levelLabel, catbg, catfg, msgbg, msgfg] = ['═══════', '#eee', '#ccc',  'default', '#36c']; break;
    case 'success':  [levelLabel, catbg, catfg, msgbg, msgfg] = ['SUCCESS', '#9d9', '#262',  'default', '#090']; break;
    case 'warn':     [levelLabel, catbg, catfg, msgbg, msgfg] = ['WARNING', '#ee0', '#933',  '#ffe',    '#933']; break;
    case 'error':    [levelLabel, catbg, catfg, msgbg, msgfg] = [' ERROR ', '#900', '#ff3',  'default', '#c00']; break;
    case 'fatal':    [levelLabel, catbg, catfg, msgbg, msgfg] = [' FATAL ', '#c00', '#ff0',  '#ff3',    '#c00']; break;
    default: return;
  }
  var formatStr = category ? `%c ${levelLabel} %c %c[${category}] ${message}` : `%c ${levelLabel} %c %c${message}`;
  console.log(formatStr,
              `background: ${catbg}; color: ${catfg};`, '',
              `background: ${msgbg}; color: ${msgfg};`, ...args);
  if(error) {
    console.error(error);
  }
}

const listeners = [];
function addListener(func) {
  if(listeners.indexOf(func) === -1)
    listeners.push(func);
}
function removeListener(func) {
  let n = listeners.indexOf(func);
  if(n > -1)
    listeners.splice(n, 1);
}
function multicast(msg) {
  for(let func of listeners)
    func(msg);
}

function defaultConsoleWriter(msg) {
  writeConsole(decomposeMessage(msg));
}

function createLogger(category) {
  function logger(...args) {
    multicast(makeLogMessage('info', category, args));
    return logger;
  }
  logger.trace = function(...args) { multicast(makeLogMessage('trace', category, args)); return logger; }
  logger.debug = function(...args) { multicast(makeLogMessage('debug', category, args)); return logger; }
  logger.notice = function(...args) { multicast(makeLogMessage('notice', category, args)); return logger; }
  logger.success = function(...args) { multicast(makeLogMessage('success', category, args)); return logger; }
  logger.info = logger;
  logger.warn = function(...args) { multicast(makeLogMessage('warn', category, args)); return logger; }
  logger.error = function(...args) { multicast(makeLogMessage('error', category, args)); return logger; }
  logger.fatal = function(...args) { multicast(makeLogMessage('fatal', category, args)); return logger; }

  return logger;
}

createLogger.setWriteToConsole = function(enabled) {
  if(enabled)
    addListener(defaultConsoleWriter);
  else
    removeListener(defaultConsoleWriter);
}
createLogger.addMessageListener = addListener;
createLogger.removeMessageListener = removeListener;

export default createLogger;
