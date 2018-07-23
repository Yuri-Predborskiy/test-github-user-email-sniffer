const express = require('express');
const auth = require('./auth.js');
const userApi = require('./userApi');

const router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

router.post('/register', auth.createUser);
router.post('/authenticate', auth.authenticate);

// to access the following API routes you must be logged in
router.use(auth.verifyToken);

router.get('/users', userApi.getAll);

module.exports = router;
