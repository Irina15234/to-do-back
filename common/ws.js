const { WebSocketServer } = require('ws');
const http = require('http');
const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 9000;
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});

const boardStatuses = {};
const taskStatuses = {};

const EventTypes = {
    BOARD_STATUS: 'BOARD_STATUS',
    TASK_STATUS: 'TASK_STATUS',
}

const StatusTypes = {
    ACTUAL: 'ACTUAL',
    OUTDATED: 'OUTDATED',
}

function handleMessage(message, id, fromRequest = false) {
    const dataFromClient = fromRequest ? message : JSON.parse(message.toString());

    if (dataFromClient.type === EventTypes.BOARD_STATUS) {
        boardStatuses[id] && boardStatuses[id].send(message.message);
    } else if (dataFromClient.type === EventTypes.TASK_STATUS) {
        taskStatuses[id] && taskStatuses[id].send(message.message);
    }
}

wsServer.on('connection', function(connection, req) {
    const queryParams = url.parse(req.url, true).query;
    if (queryParams.type === 'board') {
        boardStatuses[queryParams.id] = connection;
    } else {
        taskStatuses[queryParams.id] = connection;
    }
    connection.on('message', (message) => handleMessage(message, queryParams.id));
});

module.exports = {
    handleMessage,
    EventTypes,
    StatusTypes
}
