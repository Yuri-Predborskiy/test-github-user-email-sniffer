const multer = require('multer');
const fileType = require('file-type');
const fs = require('fs');

const upload = multer({
    dest:'images/',
    limits: {fileSize: 1000000, files: 1},
    fileFilter:  (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
            return callback(new Error('Only Images are allowed !'), false)
        }
        callback(null, true);
    }
}).single('image');

function uploadImage(req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.status(400).json({message: err.message})
        } else {
            let path = `/images/${req.file.filename}`;
            res.status(200).json({message: 'Image Uploaded Successfully !', path: path})
        }
    })
}

function getImage(req, res) {
    let imageName = req.params.imageName;
    let imagePath = __dirname + '/images/' + imageName;
    let image = fs.readFileSync(imagePath);
    let mime = fileType(image).mime;

    res.writeHead(200, {'Content-Type': mime });
    res.end(image, 'binary');
}

module.exports = {
    uploadImage,
    getImage,
};
