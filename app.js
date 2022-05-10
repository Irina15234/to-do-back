const express = require("express");
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());

const mysql = require("mysql2");
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "trello",
    password: "StarS3000"
});

const tokenKey = '1a2b-3c4d-5e6f-7g8h';

app.use(express.json())
app.use((req, res, next) => {
    console.log(req.headers.authorization);
    if (req.headers.authorization) {
        let tokenParts = req.headers.authorization
            .split(' ')[1]
            .split('.')
        let signature = crypto
            .createHmac('SHA256', tokenKey)
            .update(`${tokenParts[0]}.${tokenParts[1]}`)
            .digest('base64')

        if (signature === tokenParts[2])
            req.user = JSON.parse(
                Buffer.from(tokenParts[1], 'base64').toString(
                    'utf8'
                )
            )

        next()
    }

    next()
});

app.post('/auth', (req, res) => {
    connection.query("SELECT * FROM user", function(err, data) {
        if(err) return console.log(err);

        for (let user of data) {
            if (
                req.body.username === user.username &&
                req.body.password === user.password
            ) {
                let head = Buffer.from(
                    JSON.stringify({ alg: 'HS256', typ: 'jwt' })
                ).toString('base64')
                let body = Buffer.from(JSON.stringify(user)).toString(
                    'base64'
                )
                let signature = crypto
                    .createHmac('SHA256', tokenKey)
                    .update(`${head}.${body}`)
                    .digest('base64')

                return res.status(200).json({
                    token: `${head}.${body}.${signature}`,
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

app.use("/", boardRouter);

app.listen(4000, function(){
    console.log("Сервер ожидает подключения...");
});

