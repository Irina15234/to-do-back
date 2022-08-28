const jwt = require("jsonwebtoken");
const {TOKEN_KEY} = require("./constants");

const getUserId = (token) => {
    let id = null;
    if (token) {
        jwt.verify(token.split(' ')[1], TOKEN_KEY, function (err, decoded) {
            if (decoded) {
                id = decoded.id;
            }
        }, null);
    }
    return id;
};

module.exports = Object.freeze({
    getUserId: getUserId,
});