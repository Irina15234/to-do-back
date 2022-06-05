const db = require('../connection');

exports.getTasks = async function(req, res){
    const query = "select * from tasks";

    const result = await db.query(query);

    return res.json(result);
};