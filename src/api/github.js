// github access api
const https = require('https');
const config = require('../../config/config');

async function sendMailToGitHubUsers(req, res) {
    console.log('starting mail sender');
    let users = req.body.github_users.replace(/\s/g, '').split(',');
    let promises = users.map(getUserData);
    users = await Promise.all(promises);
    promises = users.map(getWeather);
    users = await Promise.all(promises);
    // promises = users.map(sendMail);
    // let result = await Promise.all(promises);
    res.json({ success: true, data: users });
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
    return new Promise(function(resolve, reject) {
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
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: 'bar@example.com, baz@example.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });

}

module.exports = {
    sendMailToGitHubUsers,
};