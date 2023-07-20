const db = require('../connection');
const {getUserId} = require("../common/helpers");

exports.getBoards = async function(req, res){
    const userId = getUserId(req.headers.authorization);

    const query = `select boards.boardId as id, boards.name, roleId
            from boards
            join boards_users on boards.boardId=boards_users.boardId
            where boards_users.userId=${userId}`;

    const permissionQuery = `select * from dictionaries.roles_permissions`;

    const result = await db.query(query);
    const permissionResult = await db.query(permissionQuery);

    const finishResult = [];
    result.forEach((item) => {
        const permissions = permissionResult.filter((permItem) => permItem.roleId === item.roleId)
            .map((permItem) => permItem.permissionId);
        finishResult.push({ id: item.id, name: item.name, permissions });
    });

    return res.json(finishResult);
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

exports.getBoardsUsers = async function(req, res){
    const view = req.query.view;

    if (view === 'FULL') {
        const query = `select boards_users.userId as id, users.name, users.photo, roles.name as roleName, roles.id as roleId
            from boards_users
            join users on users.id=boards_users.userId
            join dictionaries.roles on roles.id=boards_users.roleId
            where boards_users.boardId=${req.params.id}`;

        const result = await db.query(query);

        const correctResult = result.map((item) => ({ id: item.id, name: item.name, photo: item.photo, role: { id: item.roleId, name: item.roleName } }));

        return res.json(correctResult);
    }

    if (view === 'INACTIVE') {
        const query = `select id, name, photo
                from users
                where users.id not in (select userId from boards_users where boardId=${req.params.id})`;

        const result = await db.query(query);

        return res.json(result);
    }

    const query = `select boards_users.userId as id, users.name, users.photo
            from boards_users
            join users on users.id=boards_users.userId
            where boards_users.boardId=${req.params.id}`;

    const result = await db.query(query);

    return res.json(result);
};

exports.deleteColumn = async function(req, res){
    if(!req.body) return res.status(400);

    const boardId = req.body.boardId;
    const columnId = req.body.columnId;

    const tasksQuery = `select * from tasks
            where boardId='${boardId}' and columnId='${columnId}'`;

    const tasksInDeletedColumns = await db.query(tasksQuery);

    if (tasksInDeletedColumns.length) {
        return res.status(500).send('Deleted columns includes tasks.');
    }

    const deleteColumnQuery = `DELETE FROM boards_columns WHERE (boardId = '${boardId}' AND columnId = '${columnId}')`;

    await db.query(deleteColumnQuery);

    return res.status(200).send('OK');
};

exports.renameColumn = async function(req, res){
    if(!req.body) return res.status(400);

    const boardId = req.body.boardId;
    const column = req.body.column;

    const query = `UPDATE boards_columns SET columnName='${column.name}' WHERE (boardId = '${boardId}' and columnId = '${column.id}')`;

    await db.query(query);

    return res.status(200).send('OK');
};

exports.renameBoard = async function(req, res){
    if(!req.body) return res.status(400);

    const boardId = req.body.boardId;
    const boardName = req.body.boardName;

    const query = `UPDATE boards SET name='${boardName}' WHERE (boardId = '${boardId}')`;

    await db.query(query);

    return res.status(200).send('OK');
};

exports.addColumn = async function(req, res){
    if(!req.body) return res.status(400);

    const boardId = req.body.boardId;
    const column = req.body.column;

    const query = `INSERT boards_columns(boardId, columnId, columnName) VALUES ?`;

    await db.query(query, [[[boardId, column.id, column.name]]]);

    return res.status(200).send('OK');
};

exports.getBoardColumns = async function(req, res){
    const boardId = req.params.id;
    const query = `select columnId as id, columnName as name
            from boards_columns
            where boards_columns.boardId=${boardId}`;

    const result = await db.query(query);

    return res.json(result);
};

exports.updateUsers = async function(req, res){
    const users = req.body;
    const boardId = req.params.id;

    const deletedUsers = users.filter((user) => user.changeType === 'delete').map((user) => user.id);
    const addedUsers = users.filter((user) => user.changeType === 'add').map((user) => ({ userId: user.id, roleId: user.role.id }));
    const editedUsers = users.filter((user) => user.changeType === 'edit').map((user) => ({ userId: user.id, roleId: user.role.id }));

    if (deletedUsers.length || editedUsers.length) {
        const deletedUsersList = deletedUsers.concat(editedUsers.map((user) => user.userId)).join(',');
        const deleteQuery = `DELETE FROM boards_users WHERE (boardId = '${boardId}' AND userId IN (${deletedUsersList}))`;
        await db.query(deleteQuery);
    }

    if (addedUsers.length || editedUsers.length) {
        const addedUsersList = addedUsers.concat(editedUsers).map((user) => [boardId, user.userId, user.roleId]);
        const addQuery = `INSERT boards_users(boardId, userId, roleId) VALUES ?`;
        await db.query(addQuery, [addedUsersList]);
    }

    return res.status(200).send('OK');
};
