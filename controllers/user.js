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

exports.updateUser = async function (req, res) {
    const userId = getUserId(req.headers.authorization);

    const user = req.body;

    const query = `UPDATE users SET name='${user.name}', username='${user.username}', phone='${user.phone}', email='${user.email}' WHERE (id = '${userId}')`;

    await db.query(query);

    return res.status(200).send('OK');
};

exports.updateUserPhoto = async function (req, res) {
    const userId = getUserId(req.headers.authorization);

    const photo = req.body.photo;

    const query = `UPDATE users SET photo='${photo}' WHERE (id = '${userId}')`;

    await db.query(query);

    return res.status(200).send('OK');
};

exports.updateUserParameters = async function (req, res) {
    const userId = getUserId(req.headers.authorization);

    const oldUsername = req.body.oldUsername;
    const oldPassword = req.body.oldPassword;

    const query = `SELECT username, password FROM users WHERE ${userId}=users.id`;

    const usersData = await db.query(query);

    if (!usersData?.length) {
        return res.status(500).send('User not found');
    }

    const userData = usersData[0];
    if (userData.username !== oldUsername || userData.password !== oldPassword) {
        return res.status(500).send('Username or password is wrong');
    }
    const newUsername = req.body.newUsername;
    const newPassword = req.body.newPassword;
    if (newUsername && newPassword) {
        const updateQuery = `UPDATE users SET username='${req.body.newUsername}', password='${req.body.newPassword}' WHERE (id = '${userId}')`;
        await db.query(updateQuery);
    } else if (newUsername) {
        const updateQuery = `UPDATE users SET username='${req.body.newUsername}' WHERE (id = '${userId}')`;
        await db.query(updateQuery);
    } else {
        const updateQuery = `UPDATE users SET password='${req.body.newPassword}' WHERE (id = '${userId}')`;
        await db.query(updateQuery);
    }

    return res.status(200).send('OK');
};

exports.createUser = async function (req, res) {
    console.log(req.body);

    const values = [req.body.name, req.body.email, req.body.phone, req.body.username, req.body.password];

    const query = `INSERT users(name, email, phone, username, password) VALUES ?`;

    await db.query(query, [[values]]);

    return res.status(200).send('OK');
};
