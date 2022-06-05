const db = require('../connection');
const jwt = require("jsonwebtoken");
const {TOKEN_KEY} = require("../common/constants");

exports.getBoards = async function(req, res){
    const query = "select boards.boardId as id, boards.name, boards_columns.columnId, boards_columns.columnName\n" +
        "from boards join boards_columns\n" +
        "on boards.boardId=boards_columns.boardId";

    const result = await db.query(query);

    const finishResult = [];
    result.forEach((item) => {
        const index = finishResult.findIndex((i) => i.id === item.id);
        const isNeedAddItem = index === -1;
        if (isNeedAddItem) {
            const newItem = {...item, columns: [{id: item.columnId, name: item.columnName}]};
            delete newItem.columnId;
            delete newItem.columnName;
            finishResult.push(newItem);
        } else {
            finishResult[index].columns.push({id: item.columnId,name: item.columnName});
        }
    });

    return res.json(finishResult);
};

exports.getBoard = async function(req, res){
    const query = `select boards.boardId as id, boards.name, boards_columns.columnId, boards_columns.columnName
        from boards join boards_columns
        on boards.boardId=boards_columns.boardId
        where boards.boardId=${req.params.id}`;

    const result = await db.query(query);

    const finishResult = [];
    result.forEach((item) => {
        const index = finishResult.findIndex((i) => i.id === item.id);
        const isNeedAddItem = index === -1;
        if (isNeedAddItem) {
            const newItem = {...item, columns: [{id: item.columnId,name: item.columnName}]};
            delete newItem.columnId;
            delete newItem.columnName;
            finishResult.push(newItem);
        } else {
            finishResult[index].columns.push({id: item.columnId,name: item.columnName});
        }
    });

    return res.json(...finishResult);
};

exports.saveBoard = async function(req, res){
    if(!req.body) return res.sendStatus(400);

    const board = req.body;
    const columns = req.body.columns;

    const addBoardQuery = `INSERT boards(boardId, name) VALUES (${req.body.id}, '${req.body.name}')`;
    const getBoardIdQuery = `SELECT boardId FROM boards ORDER BY boardId DESC LIMIT 1`;

    await db.query(addBoardQuery);

    const newBoardId = await db.query(getBoardIdQuery);

    const addColumnsQuery = `INSERT boards_columns(id, boardId, columnId, columnName) VALUES ?`;
    const columnsValues = columns.map((column) => {
        return [null, newBoardId[0].boardId, column.id, column.name];
    });

    db.query(addColumnsQuery, [columnsValues]);

    const authorId = getUserId(req.headers.authorization);

    if (authorId) {
        const adminId = 1;
        const addBoardsUsersQuery = `INSERT boards_users(id, boardId, userId, roleId) VALUES (null, ${newBoardId[0].boardId}, ${authorId}, ${adminId})`;
        db.query(addBoardsUsersQuery);
    }

    return res.json({ ...board, id: newBoardId[0].boardId });
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