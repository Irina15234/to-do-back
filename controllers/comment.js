const db = require('../connection');
const {getUserId} = require("../common/helpers");

exports.getComments = async function(req, res){
    const taskId = req.params.taskId;

    const query = `select id, date, authorId, parentId, text
            from comments
            where comments.taskId=${taskId}`;

    const result = await db.query(query);

    return res.json(result);
};

exports.saveComment = async function(req, res){
    const userId = getUserId(req.headers.authorization);

    const values = [req.body.date, userId, req.body.parentId, req.body.text];

    const query = `INSERT comments(date, authorId, parentId, text) VALUES ?`;

    await db.query(query, [[values]]);

    return res.status(200).send('OK');
};

exports.updateComment = async function(req, res){
    const id = req.params.id;

    const updateQuery = `UPDATE comments SET text='${req.body.text}' update='${req.body.update}' WHERE (id = '${id}')`;
    await db.query(updateQuery);

    return res.status(200).send('OK');
};

exports.deleteComment = async function(req, res){
    const id = req.params.id;

    const deleteQuery = `DELETE FROM comments WHERE (id = '${id}');`;

    await db.query(deleteQuery);

    return res.status(200).send('OK');
};