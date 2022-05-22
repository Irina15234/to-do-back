const express = require("express");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const db = require('./connection');
const { promisify } = require('util');
jwt.verifyP = promisify(jwt.verify);

const app = express();
app.use(cors());

const tokenKey = '1a2b-3c4d-5e6f-7g8h';

app.use(express.json())
app.use((req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(req.headers.authorization, tokenKey, function(err, decoded) {
            console.log(decoded);
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
                const token = jwt.sign({ id: req.body.password }, tokenKey, {
                    expiresIn: 86400
                }, null);

                return res.status(200).json({
                    token,
                    id: user.id
                })
            }
        }

        return res.status(404).json({ message: 'User not found' })
    });
})

app.get('/user', (req, res) => {
    if (req.user) return res.status(200).json(req.user)
    else
        return res
            .status(401)
            .json({ message: 'Not authorized' })
})

const boardRouter = require("./routes/boardRouter.js");
const userRouter = require("./routes/userRouter.js");

app.use("/", [userRouter, boardRouter]);

app.listen(4000, function(){
    console.log("Сервер ожидает подключения...");
});

