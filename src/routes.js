const express = require('express');
const router = express.Router();
const apiRoutes = require('./api/index');

router.use('/api/', apiRoutes);

// routes
router.get('/', function(req, res) {
    res.send(`Hello! The API is available at /api`);
});

module.exports = router;
