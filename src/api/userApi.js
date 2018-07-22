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

function setup(req, res) {
    let yuri = new User({
        name: 'Yuri Predborski',
        password: 'safePassword!'
    });

    // save the sample user
    yuri.save(function(err) {
        if (err) { throw err; }
        console.log('User saved successfully');
        res.json({ success: true });
    });
}

module.exports = {
    getAll,
    getCurrentUser,
    setup,
};