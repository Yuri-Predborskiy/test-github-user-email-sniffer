const User = require('./../models/user'); // get our mongoose model

function getAll(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
}

function getCurrentUser(req, res) {
    User.findOne({ username: req.user.username }, function(err, user) {
        res.json(user);
    });
}

module.exports = {
    getAll,
    getCurrentUser,
};