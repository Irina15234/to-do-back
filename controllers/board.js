const db = require('../connection');

exports.getBoards = async function(req, res){
    const query = "select boards.boardId, boards.name, boards.userIds, boards.authorId, columns.columnId, columns.columnName\n" +
        "from boards join boards_columns\n" +
        "on boards.boardId=boards_columns.boardId\n" +
        "join columns\n" +
        "on boards_columns.columnId=columns.columnId";

    const result = await db.query(query);
    console.log(result);
    console.log(11);
    return res.json(result);
};