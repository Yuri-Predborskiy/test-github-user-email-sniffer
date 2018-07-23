// github access api
const https = require('https');
const config = require('../../config/config');

function sendMailToGitHubUsers(req, res) {
    console.log('starting mail sender');
    let users = req.body.github_users.replace(/\s/g, '').split(',');
    let results = [];

    let promises = users.map(function(name) {
        let options = {
            headers: {
                'User-Agent': config.userAgent,
                'Authorization': `token ${config.accessToken}`,
            },
            host : `api.github.com`,
            path: `/users/${name}`
        };
        return new Promise(function(resolve, reject) {
            https.get(options, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    // results.push(JSON.parse(data));
                    let dp = JSON.parse(data);
                    let res = {
                        name: dp.name,
                        email: dp.email,
                        location: dp.location ? dp.location.split(',')[0].trim() : null,
                    };
                    if (res.location) {
                        let weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${res.location}&APPID=${config.weatherAPIkey}`;
                        https.get(weatherURL, (resp) => {
                            let data = '';
                            resp.on('data', (chunk) => {
                                data += chunk;
                            });
                            resp.on('end', () => {
                                data = JSON.parse(data);
                                if (data.cod === 200) {
                                    res.weather = data.main;
                                }
                                results.push(res);
                                resolve();
                            });
                        }).on("error", (err) => {
                            console.log("Error: " + err.message);
                            reject();
                        });
                    } else {
                        results.push(res);
                        resolve();
                    }
                });
            }).on("error", (err) => {
                console.log("Error: " + err.message);
                reject();
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json({ success: true, message: 'User data collected', data: results });
        })
        .catch(err => {
            console.error(err);
            res.json({ success: false, message: err });
        });


    // 1 - get list of desired users from query
    // 2 - get message text
    // 3 - if any users contain email - send mail
    // return success if everything went well
    // return success false if couldn't get github access
    // send report for each user
}

module.exports = {
    sendMailToGitHubUsers,
};