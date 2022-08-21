const db = require('../connection');
const jwt = require("jsonwebtoken");
const {TOKEN_KEY} = require("../common/constants");

exports.getTasks = async function(req, res){
    const userId = getUserId(req.headers.authorization);
    const view = req.query.view || 'MAIN';

    if (view === 'MAIN') {
        const query = `select * from tasks where ${userId}=tasks.executorId`;

        const result = await db.query(query);

        return res.json(result);
    }

    if (view === 'BOARD') {
        const boardId = req.query.boardId;

        const query = `select tasks.id, tasks.executorId, tasks.name, dictionaries.priority.icon as priorityIcon, tasks.columnId
        from tasks
        join dictionaries.priority on dictionaries.priority.id=tasks.priorityId
        join boards_users on tasks.boardId = boards_users.boardId
        where tasks.boardId=${boardId}`;

        const result = await db.query(query);

        return res.json(result);
    }
};

exports.getTask = async function(req, res){
    const userId = getUserId(req.headers.authorization);
    const taskId = req.params.id;

    const query = `select tasks.id, tasks.executorId, tasks.name, dictionaries.priority.icon as priorityIcon, tasks.columnId
        from tasks
        join dictionaries.priority on dictionaries.priority.id=tasks.priorityId
        join boards_users on tasks.boardId = boards_users.boardId
        where tasks.id=${taskId}`;

    const result = await db.query(query);

    return res.json(...result);
};

const getUserId = (token) => {
    let id = null;
    if (token) {
        jwt.verify(token.split(' ')[1], TOKEN_KEY, function (err, decoded) {
            if (decoded) {
                id = decoded.id;
            }
        }, null);
    }
    return id;
};

exports.changeColumns = async function(req, res){
    const targetColumnId = req.body.targetColumnId;
    const taskId = req.body.taskId;

    const query = `UPDATE tasks SET columnId=${targetColumnId} where id=${taskId}`;

    try {
        db.query(query);
        return res.status(200);
    } catch (e) {
        return res.status(500).json({message: "Server error"});
    }
};