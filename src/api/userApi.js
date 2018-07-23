const User = require('./../models/user'); // get our mongoose model

function getCurrentUser(req, res) {
    User.findOne({ username: req.decoded.username }, function(err, user) {
        if (err) {
            res.json({
                success: false,
                message: 'error', err
            })
        } else {
            res.json({
                success: true,
                message: 'fetched user data',
                user
            });
        }
    });
}

module.exports = {
    getCurrentUser,
};