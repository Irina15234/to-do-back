const db = require('../connection');

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
    const getBoardIdQuery = `SELECT LAST_INSERT_ID() as id`;

    await db.query(addBoardQuery);

    const newBoardId = await db.query(getBoardIdQuery);

    const addColumnsQuery = `INSERT boards_columns(id, boardId, columnId, columnName) VALUES ?`;
    const columnsValues = columns.map((column) => {
        return [null, newBoardId[0].id, column.id, column.name];
    });

    db.query(addColumnsQuery, [columnsValues]);

    return res.json({ ...board, id: newBoardId[0].id });
};