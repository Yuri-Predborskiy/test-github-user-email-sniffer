const express = require('express');
const router = express.Router();
const config = require('../config/config');
const apiRoutes = require('./api/index');

router.use('/api/', apiRoutes);

// routes
router.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + config.port + '/api');
});

module.exports = router;
