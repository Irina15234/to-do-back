const db = require('../connection');
const {getUserId} = require("../common/helpers");

exports.getUser = function (req, res) {
    const userId = getUserId(req.headers.authorization);

    const view = req.query.view;

    db.query(`SELECT id, name, username, email, phone, photo FROM users WHERE ${userId}=users.id LIMIT 1`, function (err, data) {
        if (err) return console.log(err);
        if (!data.length) return console.log('User not found');

        const result = view === 'FULL' ? {...data[0]} : { id: data[0].id, name: data[0].name, photo: data[0].photo };
        res.send(result);
    });
};