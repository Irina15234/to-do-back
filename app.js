const express = require("express");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const db = require('./connection');
const { promisify } = require('util');
jwt.verifyP = promisify(jwt.verify);

const app = express();
app.use(cors());

require('./common/ws');

app.use(express.json())
app.use((req, res, next) => {
    const token = req.headers.authorization;
    const isAuth = req.url === '/auth';

    if (isAuth) return next();

    if (token) {
        jwt.verify(token.split(' ')[1], TOKEN_KEY, async function(err, decoded) {
            if (decoded) {
                const users = await db.query("SELECT * FROM users");
                for (let user of users) {
                    if (user.id === decoded.id) {
                        req.user = user;
                    }
                }

                if (!req.user) return next();
            }
        }, null);

        return next();
    }
    return next();
});

app.post('/auth', (req, res) => {
    db.query("SELECT * FROM users", function(err, data) {
        if(err) return console.log(err);

        for (let user of data) {
            if (
                req.body.username === user.username &&
                req.body.password === user.password
            ) {
                const token = jwt.sign({ id: user.id }, TOKEN_KEY, {
                    expiresIn: 86400
                }, null);

                return res.status(200).json({
                    token,
                })
            }
        }

        return res.status(404).json({ message: 'User not found' })
    });
})

const boardRouter = require("./routes/boardRouter.js");
const taskRouter = require("./routes/taskRouter.js");
const commentRouter = require("./routes/commentRouter.js");
const userRouter = require("./routes/userRouter.js");
const {TOKEN_KEY} = require("./common/constants");
const dictionaryRouter = require("./routes/dictionaryRouter");

app.use("/user", [userRouter]);
app.use("/board", [boardRouter]);
app.use("/task", [taskRouter]);
app.use("/comment", [commentRouter]);
app.use("/dictionary", [dictionaryRouter]);

app.listen(4000, function(){
    console.log("Сервер ожидает подключения...");
});
