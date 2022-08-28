const db = require('../connection');
const {getUserId} = require("../common/helpers");

exports.getBoards = async function(req, res){
    const userId = getUserId(req.headers.authorization);

    const query = `select boards.boardId as id, boards.name
            from boards
            join boards_users on boards.boardId=boards_users.boardId
            where boards_users.userId=${userId}`;

    const result = await db.query(query);

    return res.json(result);
};

exports.getBoard = async function(req, res){
    const query = `select boards.boardId as id, boards.name, boards_columns.columnId, boards_columns.columnName
        from boards left join boards_columns
        on boards.boardId=boards_columns.boardId
        where boards.boardId=${req.params.id}`;

    const result = await db.query(query);

    const finishResult = [];
    result.forEach((item) => {
        const index = finishResult.findIndex((i) => i.id === item.id);
        const isNeedAddItem = index === -1;
        if (isNeedAddItem) {
            const newItem = {...item, columns: item.columnName ? [{id: item.columnId,name: item.columnName}] : []};
            delete newItem.columnId;
            delete newItem.columnName;
            finishResult.push(newItem);
        } else {
            finishResult[index].columns.push({id: item.columnId,name: item.columnName});
        }
    });

    if (!finishResult.columns) {
        finishResult.columns = [];
    }

    return res.json(...finishResult);
};

exports.saveBoard = async function(req, res){
    if(!req.body) return res.status(400);

    const board = req.body;
    const columns = req.body.columns;

    const addBoardQuery = `INSERT boards(boardId, name) VALUES (${req.body.id}, '${req.body.name}')`;
    const getBoardIdQuery = `SELECT boardId FROM boards ORDER BY boardId DESC LIMIT 1`;

    await db.query(addBoardQuery);

    const newBoardIdObject = await db.query(getBoardIdQuery);
    const newBoardId = newBoardIdObject[0].boardId;

    if (columns.length) {
        const addColumnsQuery = `INSERT boards_columns(id, boardId, columnId, columnName) VALUES ?`;
        const columnsValues = columns.map((column) => {
            return [null, newBoardId, column.id, column.name];
        });

        db.query(addColumnsQuery, [columnsValues]);
    }

    const authorId = getUserId(req.headers.authorization);

    if (authorId) {
        const adminId = 1;
        const addBoardsUsersQuery = `INSERT boards_users(id, boardId, userId, roleId) VALUES (null, ${newBoardId}, ${authorId}, ${adminId})`;
        db.query(addBoardsUsersQuery);
    }

    return res.json({ ...board, id: newBoardId });
};

exports.updateBoard = async function(req, res){
    if(!req.body) return res.status(400);

    const board = req.body;
    const columns = req.body.columns;

    const updateBoardQuery = `UPDATE boards SET name='${board.name}' WHERE (id = '${board.id}')`;

    await db.query(updateBoardQuery);

    return res.status(200);
};

exports.deleteBoard = async function(req, res){
    const boardId = req.params.id;

    const deleteBoardQuery = `DELETE FROM boards WHERE (boardId = '${boardId}');`;
    const deleteTasksQuery = `DELETE FROM tasks WHERE (boardId = '${boardId}');`;
    const deleteColumnsQuery = `DELETE FROM boards_columns WHERE (boardId = '${boardId}');`;
    const deleteUsersQuery = `DELETE FROM boards_users WHERE (boardId = '${boardId}');`;

    await db.query(deleteBoardQuery);
    db.query(deleteTasksQuery);
    db.query(deleteColumnsQuery);
    db.query(deleteUsersQuery);

    return res.status(200).send('OK');
};
