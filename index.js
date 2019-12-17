const Logger = require('winston'), logger = Logger.createLogger({ format: Logger.format.combine(Logger.format.splat(), Logger.format.simple(), Logger.format.timestamp(), Logger.format.printf(info => { return `[${info.timestamp}] [${info.level}] ${info.message}`; })), levels: Logger.config.syslog.levels, transports: [ new Logger.transports.Console({ level: 'debug' }), new Logger.transports.File({ filename: 'debug.log', level: 'debug' })]});
let Config;
try {
	Config = require('./config');
} catch {
	logger.info('[SYST] Configuration file not found, The server will run with default values.');
	Config = { Server: { Port: 80, NewMailInterval: 10000 }};
}
const WebSocket = require('ws'), server = new WebSocket.Server({ port: Config.Server.Port });
const AsyncRequest = require('./modules/AsyncRequest');
const MoogleMail = require('./modules/MoogleMail'), moogleMail = new MoogleMail();

server.broadcast = data => server.clients.forEach(client => client.readyState === WebSocket.OPEN && client.authorized && client.send(data));

server.on('connection', client => {
	client.on('message', msg => {
		try {
			msg = JSON.parse(msg);
			switch(msg.type) {
				case 'authorize': return AsyncRequest('https://hentaiverse.org', { Cookie: msg.data.value }).then(r => r ? (client.auth = msg.data.value) & client.send(JSON.stringify({ type: 'authorizeResult', value: { success: true }})) & logger.info(`[API:AUTH] ${client._socket.remoteAddress}: SUCCESS`) : client.send(JSON.stringify({ type: 'authorizeResult', value: { success: false, type: 'InvalidAuthData' }})) & logger.info(`[API:AUTH] ${client._socket.remoteAddress}: FAILED`));
				default: return client.send(JSON.stringify({ type: 'result', value: { success: false, type: 'InvalidType' }})) & logger.info(`[API:E] ${client._socket.remoteAddress}: INVALIDTYPE`);
			}
		} catch(e) {
			logger.error(`[API:E] ${client._socket.remoteAddress}: INVALID DATA (${e.name})`);
		}
	});
});

setInterval(() => {
	server.clients.forEach(async client => {
		if(client.readyState !== WebSocket.OPEN || !client.auth) return;
		try {
			const mailList = moogleMail.getNewMailList(await AsyncRequest('https://hentaiverse.org/?s=Bazaar&ss=mm&filter=inbox', { Cookie: client.auth }));
			mailList.length && client.send(JSON.stringify(mailList));
		} catch(e) {
			logger.error(`[MC:E] ${client._socket.remoteAddress}: ${e.name}`);
		}
	});
}, Config.Server.NewMailInterval);
