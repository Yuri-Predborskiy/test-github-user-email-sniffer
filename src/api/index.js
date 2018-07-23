const express = require('express');
const auth = require('./auth');
const userApi = require('./userApi');
const githubApi = require('./github');

const router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

router.post('/register', auth.createUser);
router.post('/authenticate', auth.authenticate);

// to access the following API routes you must be logged in
router.use(auth.verifyToken);

router.get('/user', userApi.getCurrentUser);
router.post('/sendmail', githubApi.sendMailToGitHubUsers);

module.exports = router;
