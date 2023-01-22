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

const setTree = (commentsList, fullCommentsList) => {
    return commentsList.reduce(function(prev,current){
        const children = fullCommentsList.filter((resItem) => resItem.parentId === current.id) || [];
        children.length && (current.children = children);

        return setTree(children, fullCommentsList);
    }, []);
};

module.exports = Object.freeze({
    getUserId: getUserId,
    setTree: setTree,
});