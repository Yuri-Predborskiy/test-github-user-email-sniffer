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
                };
                let token = jwt.sign(payload, config.JWTSecret);

                res.json({
                    success: true,
                    token: token,
                    avatar: req.body.avatar
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

async function createUser(req, res) {
    let user = null;
    try {
        user = await User.findOne({ username: req.body.email });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'error creating new user' });
    }
    if (user && user.length > 0) {
        res.json({ success: false, message: 'user already exists, please log in' });
    }
    nodemailer.createTestAccount(async (err, account) => { // does not support async - relies on callback function
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            res.json({ success: false, message: `Error when creating email: ${err.message}`});
        }
        else {
            let newUser = User({
                username: req.body.email,
                password: req.body.password,
                avatar: req.file.filename,
                mail: {
                    host: account.smtp.host,
                    port: account.smtp.port,
                    secure: account.smtp.secure,
                    auth: {
                        user: account.user,
                        pass: account.pass
                    },
                }
            });
            await newUser.save();
            req.body.avatar = `${req.protocol}://${req.get('host')}/avatars/${req.file.filename}`;
            authenticate(req, res);
        }
    });
}

module.exports = {
    authenticate,
    verifyToken,
    createUser,
};