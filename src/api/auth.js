const User = require('./../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const config = require('../../config/config');

function authenticate(req, res) {
    User.findOne({
        username: req.body.email
    }, function(err, user) {
        if (err) { throw err; }
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {
            if (user.password !== req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {
                const payload = {
                    username: user.username,
                    // password: user.password,
                };
                let token = jwt.sign(payload, config.JWTSecret);

                res.json({
                    success: true,
                    token: token
                });
            }
        }
    });
}

function verifyToken(req, res, next) {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config.JWTSecret, function(err, decoded) {
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

// todo: rewrite using promises, generators or async-await ? to limit the number of callbacks one in another
function createUser(req, res) {
    User.findOne({
        username: req.body.email
    }, function(err, user) {
        if (err) { throw err; }
        if (user) {
            res.json({ success: false, message: 'User already exists. Please log in.' });
        } else if (!user) {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    console.error('Failed to create a testing account. ' + err.message);
                    res.json({ success: false, message: `Error when creating email: ${err.message}`});
                }
                else {
                    let newUser = User({
                        username: req.body.email,
                        password: req.body.password,
                        mail: {
                            host: account.smtp.host,
                            port: account.smtp.port,
                            secure: account.smtp.secure,
                            auth: {
                                user: account.user,
                                pass: account.pass
                            }
                        }
                    });
                    newUser.save().then(() => authenticate(req, res));
                }
            });
        }
    });
}

module.exports = {
    authenticate,
    verifyToken,
    createUser,
};