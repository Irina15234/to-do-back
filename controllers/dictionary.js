const db = require("../connection");
exports.getPriority = async function(req, res){
    const query = `select * from dictionaries.priority`;

    const result = await db.query(query);

    return res.json(result);
};