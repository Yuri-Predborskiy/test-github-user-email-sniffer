const https = require('https');
const nodemailer = require('nodemailer');
const config = require('../../config/config');
const User = require('./../models/user');

let mail = {};

async function sendMailToGitHubUsers(req, res) {
    let me = await User.findOne({ username: req.decoded.username }, function(err, user) {
        if (err) { res.json({ success: false, message: 'error getting user mail account data from db' }) }
        return user;
    });
    mail = me.mail;
    mail.message = req.body.message;
    let users = req.body.github_users.replace(/\s/g, '').split(',');
    let promises = users.map(getUserData);
    try {
        users = await Promise.all(promises);
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'error getting user data from github' });
    }
    promises = users.map(getWeather);
    try {
        users = await Promise.all(promises);
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'error getting user weather data from open weather map API' });
    }
    promises = users.map(sendMail);
    let result = null;
    try {
        result = await Promise.all(promises);
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'error sending mail to users' });
    }
    res.json({ success: true, data: result });
}

function getUserData(username) {
    let options = {
        headers: {
            'User-Agent': config.userAgent,
            'Authorization': `token ${config.accessToken}`,
        },
        host : `api.github.com`,
        path: `/users/${username}`
    };
    return new Promise(function(resolve, reject) {
        https.get(options, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let dp = JSON.parse(data);
                let res = {
                    login: dp.login,
                    name: dp.name,
                    email: dp.email,
                    location: dp.location ? dp.location.split(',')[0].trim() : null,
                };
                resolve(res);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err);
        });
    });
}

function getWeather(user) {
    let location = user.location ? user.location.split(',')[0].trim() : null;
    if (!location) {
        return new Promise((resolve) => resolve(user));
    }
    let weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=${config.weatherAPIkey}&units=metric`;
    return new Promise(function(resolve) {
        https.get(weatherURL, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                data = JSON.parse(data);
                if (data.cod === 200) {
                    user.weather = data.main;
                }
                resolve(user);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            resolve(user);
        });
    });
}

function sendMail(user) {
    if (!user.email) {
        user.mailReport = 'no email provided, mail not sent';
        return new Promise(resolve => resolve(user));
    }
    let transporter = nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        secure: mail.secure,
        auth: {
            user: mail.auth.user,
            pass: mail.auth.pass
        }
    });

    let text = mail.message;
    if (user.weather) {
        text += `\n-----\nCurrent weather at ${user.location}:\n${JSON.stringify(user.weather)}`;
    }

    let mailOptions = {
        from: `"Yuri Predborski" <${mail.auth.user}>`,
        to: user.email,
        subject: 'Hello from shiny new API',
        text,
        html: text
    };

    return new Promise((resolve) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                user.report = `error sending mail: ${error}`;
            } else {
                user.report = `mail sent, preview URL: ${nodemailer.getTestMessageUrl(info)}`;
            }
            resolve(user);
        });
    });
}

module.exports = {
    sendMailToGitHubUsers,
};