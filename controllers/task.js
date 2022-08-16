const db = require('../connection');
const jwt = require("jsonwebtoken");
const {TOKEN_KEY} = require("../common/constants");

exports.getTasks = async function(req, res){
    const query = "select * from tasks";

    const result = await db.query(query);

    return res.json(result);
};

exports.getTask = async function(req, res){
    const userId = getUserId(req.headers.authorization);

    const query = `select tasks.id, tasks.authorId, tasks.executorId, tasks.name, dictionaries.priority.name as priorityName, tasks.columnId, tasks.date, tasks.boardId
        from tasks
        join dictionaries.priority on dictionaries.priority.id=tasks.priorityId
        join boards_users on tasks.boardId = boards_users.boardId
        where userId=${userId}`;

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

};