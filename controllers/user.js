const db = require('../connection');
const {getUserId} = require("../common/helpers");

exports.getUser = function (req, res) {
    const userId = getUserId(req.headers.authorization);
    db.query(`SELECT * FROM users WHERE ${userId}=users.id LIMIT 1`, function (err, data) {
        if (err) return console.log(err);
        res.send({ id: data[0].id, name: data[0].name, photo: data[0].photo });
    });
};