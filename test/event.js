const EventEmitter = require('events');


var emitter = new EventEmitter.MyEmitter();
emitter.setMaxListeners(100);