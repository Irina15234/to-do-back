const db = require('../connection');

exports.getUser = function (req, res) {
    const userId = req.params.id;
    db.query(`SELECT * FROM users WHERE ${userId}=users.id LIMIT 1`, function (err, data) {
        if (err) return console.log(err);
        res.send({ id: data[0].id, name: data[0].name });
    });
};