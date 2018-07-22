const User = require('./../models/user');
const jwt = require('jsonwebtoken');

function authenticate(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) { throw err; }
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {
            if (user.password !== req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {
                const payload = {
                    username: user.name,
                    password: user.password,
                };
                let token = jwt.sign(payload, app.get('superSecret'), {
                    expiresInMinutes: 1440 // expires in 24 hours
                });

                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
        }
    });
}

function verifyToken(req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}

module.exports = {
    authenticate,
    verifyToken,
};