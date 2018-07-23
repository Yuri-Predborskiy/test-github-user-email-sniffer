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
                    password: user.password,
                };
                let token = jwt.sign(payload, config.JWTSecret);

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
                    newUser.save().then(()=>authenticate(req, res));
                    // res.json({ success: true, message: 'registered' });

                }
                console.log('Credentials obtained, sending message...');
            });
            // nodemailer.createTestAccount((err, account) => {
            //     if (err) {
            //         console.error('Failed to create a testing account. ' + err.message);
            //         return process.exit(1);
            //     }
            //
            //     console.log('Credentials obtained, sending message...');
            //
            //     // Create a SMTP transporter object
            //     let transporter = nodemailer.createTransport({
            //         host: account.smtp.host,
            //         port: account.smtp.port,
            //         secure: account.smtp.secure,
            //         auth: {
            //             user: account.user,
            //             pass: account.pass
            //         }
            //     });
            //
            //     // Message object
            //     let message = {
            //         from: 'Sender Name <sender@example.com>',
            //         to: 'Recipient <recipient@example.com>',
            //         subject: 'Nodemailer is unicode friendly ✔',
            //         text: 'Hello to myself!',
            //         html: '<p><b>Hello</b> to myself!</p>'
            //     };
            //
            //     transporter.sendMail(message, (err, info) => {
            //         if (err) {
            //             console.log('Error occurred. ' + err.message);
            //             return process.exit(1);
            //         }
            //
            //         console.log('Message sent: %s', info.messageId);
            //         // Preview only available when sending through an Ethereal account
            //         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            //     });
            // });
        }
    });
}

module.exports = {
    authenticate,
    verifyToken,
    createUser,
};