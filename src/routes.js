const express = require('express');
const router = express.Router();
const config = require('../config/config');
const apiRoutes = require('./api/index');
// const imageService = require('./services/imageService');

router.use('/api/', apiRoutes);

// routes
router.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + config.port + '/api');
});

// // image routes
// router.get('/images/:imageName', imageService.getImage);
// router.post('/images/upload', imageService.uploadImage);
//
// // error catcher
// router.use((err, req, res, next) => {
//     if (err.code === 'ENOENT') {
//         res.status(404).json({message: 'Image Not Found !'});
//     } else {
//         res.status(500).json({message: err.message});
//     }
// });

module.exports = router;
