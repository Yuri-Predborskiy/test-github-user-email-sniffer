const express = require('express');
const auth = require('./auth');
const userApi = require('./userApi');
const githubApi = require('./github');
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, next) {
        next(null, 'public/avatars');
    },
    filename: function(req, file, next){
        const ext = file.mimetype.split('/')[1];
        next(null, file.fieldname + '-' + Date.now() + '.' + ext);
    },
    fileFilter: function(req, file, next){
        if (!file) {
            next();
        }
        const image = file.mimetype.startsWith('image/');
        if (image) {
            next(null, true);
        } else {
            next();
        }
    }
});

const upload = multer({ storage: storage });

router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

router.post('/register', upload.single('avatar'), auth.createUser);
router.post('/authenticate', auth.authenticate);

// to access the following API routes you must be logged in
router.use(auth.verifyToken);

router.get('/user', userApi.getCurrentUser);
router.post('/sendmail', githubApi.sendMailToGitHubUsers);

module.exports = router;
