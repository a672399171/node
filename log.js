const log4js = require('log4js');
log4js.configure({
	appenders: [
		{type: 'file', filename: 'app.log', category: 'app'},
		{type: 'stdout', category: 'out'}
	]
});
const logger = log4js.getLogger('out');
logger.setLevel('DEBUG');

logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Gouda.');
logger.warn('Cheese is quite smelly.');
logger.error('Cheese is too ripe!');
logger.fatal('Cheese was breeding ground for listeria.');