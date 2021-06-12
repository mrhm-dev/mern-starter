const fs = require('fs');
const router = require('express').Router();

const User = require('../../models/User');
const auth = require('../../middleware/auth');
const upload = require('../../middleware/uploadMiddleware');

/**
 * @ROUTE   POST (API/Uploads/avatar)
 * @desc    Upload Profile Picture
 * @access  Private
 *
 */
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
	if (req.file) {
		try {
			// find user information with avatar
			const user = await User.findById(req.user.id);
			const oldAvatar = user.avatar;

			// update avatar image and save user information
			user.avatar = `/uploads/${req.file.filename}`;
			await user.save();

			// remove previous profile picture from disk if available
			if (!oldAvatar.includes('//www.gravatar.com')) {
				fs.unlink(`public${oldAvatar}`, (err) => {
					if (err) console.log(err);
				});
			}

			// response back with a success message and newly created avatar
			res.status(201).json({
				msg: 'Profile Picture Uploaded Successfully',
				avatar: user.avatar,
			});
		} catch (e) {
			console.log('Error', e);
			res.status(500).json({
				msg: 'Upload Failed',
				error: '500 Internal Server Error',
			});
		}
	} else {
		console.log('Req.File Error - ', req.file);
		res.status(500).json({
			msg: 'Upload Failed',
			error: '500 Internal Server Error',
		});
	}
});

module.exports = router;
