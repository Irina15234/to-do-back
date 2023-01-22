const db = require('../connection');
const {getUserId, setTree} = require("../common/helpers");

exports.getComments = async function(req, res){
    const taskId = req.params.taskId;

    const query = `select id, date, authorId, parentId, text, authorName, isDeleted
            from comments
            where comments.taskId=${taskId}`;

    const result = await db.query(query);
    const correctResult = result.map((item) => ({ ...item, isDeleted: Boolean(item.isDeleted)  }));

    const parentsComments = correctResult.filter((item) => !item.parentId);
    setTree(parentsComments, correctResult);

    return res.json(parentsComments);
};

exports.saveComment = async function(req, res){
    const userId = getUserId(req.headers.authorization);
    const date = new Date();

    const values = [date, userId, req.body.parentId, req.body.text, req.body.taskId, req.body.authorName];

    const query = `INSERT comments(date, authorId, parentId, text, taskId, authorName) VALUES ?`;

    await db.query(query, [[values]]);

    return res.status(200).send('OK');
};

exports.updateComment = async function(req, res){
    const id = req.params.id;
    const date = new Date();

    const updateQuery = `UPDATE comments SET text='${req.body.text}' update='${date}' WHERE (id = '${id}')`;
    await db.query(updateQuery);

    return res.status(200).send('OK');
};

exports.deleteComment = async function(req, res){
    const id = req.params.id;

    const isCommentWithChildren = (await db.query(`select * from comments where comments.parentId=${id}`)).length > 0;

    const deleteQuery = isCommentWithChildren ? `UPDATE comments SET isDeleted='${1}' WHERE (id = '${id}')` : `DELETE FROM comments WHERE (id = '${id}');`;
    await db.query(deleteQuery);

    return res.status(200).send('OK');
};