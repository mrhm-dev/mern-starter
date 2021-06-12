const multer = require('multer');
const path = require('path');

// setup storage and rename file to store uploaded files
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, 'public/uploads');
	},
	filename: (_req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
	},
});

// configure multer to accept our accepted files
const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024 * 1024 * 5, // it can accept upto 5MB image
	},
	fileFilter: (_req, file, cb) => {
		// filter out accepted file types
		const types = /jpeg|jpg|png|gif/;
		const extName = types.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimeType = types.test(file.mimetype);

		if (extName && mimeType) {
			cb(null, true);
		} else {
			cb(new Error('Only Support Images'));
		}
	},
});

module.exports = upload;
