const db = require('../connection');
const {getUserId} = require("../common/helpers");

exports.getTasks = async function(req, res){
    const userId = getUserId(req.headers.authorization);
    const view = req.query.view || 'MAIN';

    if (view === 'MAIN') {
        const query = `select tasks.id, tasks.name, dictionaries.priority.icon as priorityIcon, dictionaries.priority.name as priorityName
            from tasks
            join dictionaries.priority on dictionaries.priority.id=tasks.priorityId
            where ${userId}=tasks.executorId`;

        const result = await db.query(query);

        return res.json(result);
    }

    if (view === 'BOARD') {
        const boardId = req.query.boardId;

        const query = `select tasks.id, tasks.name, dictionaries.priority.icon as priorityIcon, tasks.columnId
        from tasks
        join dictionaries.priority on dictionaries.priority.id=tasks.priorityId
        join boards_users on tasks.boardId = boards_users.boardId
        where tasks.boardId=${boardId}`;

        const result = await db.query(query);

        return res.json(result);
    }
};

exports.getTask = async function(req, res){
    const taskId = req.params.id;

    const query = `select tasks.id, tasks.authorId, tasks.executorId, tasks.name, dictionaries.priority.name as priorityName,
        dictionaries.priority.icon as priorityIcon, dictionaries.priority.id as priorityId, tasks.columnId, tasks.date, tasks.boardId
        from tasks
        join dictionaries.priority on dictionaries.priority.id=tasks.priorityId
        join boards_users on tasks.boardId = boards_users.boardId
        where tasks.id=${taskId}`;

    const result = await db.query(query);

    const finishResult = result.map((item) => {
        const finishItem = {...item};
        finishItem.priority = {
            id: item.priorityId,
            name: item.priorityName,
            icon: item.priorityIcon
        };
        delete finishItem.priorityId;
        delete finishItem.priorityName;
        delete finishItem.priorityIcon;

        return finishItem;
    });

    return res.json(...finishResult);
};

exports.changeColumns = async function(req, res){
    const targetColumnId = req.body.targetColumnId;
    const taskId = req.body.taskId;

    const query = `UPDATE tasks SET columnId=${targetColumnId} where id=${taskId}`;

    try {
        db.query(query);
        return res.status(200).send('OK');
    } catch (error) {
        return res.status(500).send(error);
    }
};

exports.saveTask = async function(req, res){
    if(!req.body) return res.sendStatus(400);

    const task = req.body;

    const addTaskQuery = `INSERT tasks(name, authorId, executorId, date, boardId, priorityId, columnId) 
    VALUES ('${task.name}', '${task.authorId}', '${task.executorId}', '${task.date}', '${task.boardId}', '${task.priorityId}', '${task.columnId}')`;
    const getTaskIdQuery = `SELECT id FROM tasks ORDER BY id DESC LIMIT 1`;

    await db.query(addTaskQuery);

    const newTaskId = await db.query(getTaskIdQuery);

    return res.json(newTaskId[0].id);
};

exports.deleteTask = async function(req, res){
    const taskId = req.params.id;

    const deleteTaskQuery = `DELETE FROM tasks WHERE (id = '${taskId}')`;

    await db.query(deleteTaskQuery);

    return res.status(200).send('OK');
};

exports.updateTask = async function(req, res){
    const field = req.body.field;
    const value = req.body.value;
    const taskId = req.params.id;

    const query = `UPDATE tasks SET ${field}=${value} where id=${taskId}`;

    try {
        await db.query(query);
        return res.status(200).send('OK');
    } catch (error) {
        return res.status(500).send(error);
    }
};