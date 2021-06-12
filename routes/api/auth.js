const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// Bring in 'auth' to protect this route
const auth = require('../../middleware/auth');
// Bring in JSON Web Token (JWT)
const jwt = require('jsonwebtoken');
// Require config for jwt secret
const config = require('config');
// Add express validtor to 'check' certain conditions
const { check, validationResult } = require('express-validator/check');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(config.get('googleClientID'));

// Bring in the user model
const User = require('../../models/User');

/**
 * @ROUTE   POST (API/auth)
 * @desc    Test route
 * @access  Public
 *
 */
// Pass in 'auth' to protect the route with JWT
router.get('/', auth, async (req, res) => {
	try {
		// Find user by id by passing in the req.user.id, leaving off the password in the data
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error!');
	}
});

/**
 * @ROUTE   POST (API/Auth)
 * @desc    Authenticate user & get token
 * @access  Public
 *
 */
router.post(
	'/',
	[
		// Validate that email is in correct email format using express validator
		check('email', 'Please include a valid email').isEmail(),
		// Validate that password contains at least 6 characters
		check('password', 'Password is required.').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		// If there is a Bad Request - return an object containing an errors: array {msg, param, location}
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		// Destructure req.body (name, email, password)
		const { email, password } = req.body;

		try {
			// See if a user with the email already exists
			let user = await User.findOne({
				email,
			});

			// If a user with that email was found - user already exists - Bad Request
			if (!user) {
				// Send a message that the user already exists
				return res.status(400).json({
					errors: [
						{
							msg: 'Invalid credentials.',
						},
					],
				});
			}

			// Match email and password from found user
			const isMatch = await bcrypt.compare(password, user.password);

			// If no match...
			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid credentials' }] });
			}

			// Check account is activated or not
			if (!user.isActive) {
				return res.status(400).json({
					errors: [
						{
							msg: 'Account is Not Active, Please Check Your Email',
						},
					],
				});
			}

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 60 * 60 * 2 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error!');
		}
	}
);

/**
 * @ROUTE   POST (API/Auth)
 * @desc    Authenticate google user & verify token
 * @access  Public
 *
 */

router.post('/google', async (req, res) => {
	const { token } = req.body;
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID,
	});

	const { name, email, picture } = ticket.getPayload();

	try {
		// See if a user with the email already exists
		let user = await User.findOne({
			email,
		});

		if (!user) {
			// Create an instance of a user (still need to call save() after encrypting pass)
			user = new User({
				name,
				email,
				avatar: picture,
			});

			// Save the user which returns a promise (use await in front of anything that returns a promise)
			await user.save();
		}

		const payload = {
			user: {
				id: user.id,
			},
		};

		jwt.sign(
			payload,
			config.get('jwtSecret'),
			{ expiresIn: 360000 },
			(err, token) => {
				if (err) throw err;
				res.json({ token });
			}
		);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error!');
	}
});

module.exports = router;
