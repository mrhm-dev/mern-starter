const express = require('express');
const router = express.Router();
// Bring in gravatar package
const gravatar = require('gravatar');
// Bring in bcrypt to encrypt user passwords
const bcrypt = require('bcryptjs');
// Bring in JSON Web Token (JWT)
const jwt = require('jsonwebtoken');
// Require config for jwt secret
const config = require('config');
// Add express validtor to 'check' certain conditions
const { check, validationResult } = require('express-validator');

// Bring in our user model
const User = require('../../models/User');

// Bring in nodemailer transporter
const transporter = require('../../email/transporter');
const {
	getActivationTemplate,
	getWelcomeMailTemplate,
	getPasswordResetTemplate,
	getPasswordResetSuccessTemplate,
} = require('../../email/templates');
const sendSMS = require('../../sms');

/**
 * @ROUTE   POST (API/Users)
 * @desc    Register user
 * @access  Public
 *
 */
router.post(
	'/',
	[
		// Validate that name is not empty using express validator
		check('name', 'Name is required').not().isEmpty(),
		// Validate that email is in correct email format using express validator
		check('email', 'Please include a valid email').isEmail(),
		// Validate that password contains at least 6 characters
		check('phone', 'Please provide a valid phone number').isMobilePhone(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({
			min: 6,
		}),
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
		const { name, email, phone, password } = req.body;

		try {
			// See if a user with the email already exists
			let user = await User.findOne({
				email,
			});

			// If a user with that email was found - user already exists - Bad Request
			if (user) {
				// Send a message that the user already exists
				return res.status(400).json({
					errors: [
						{
							msg: 'User already exists!',
						},
					],
				});
			}

			// Get users gravatar
			const avatar = gravatar.url(email, {
				// default avatar size
				s: '200',
				// rating
				r: 'pg',
				// default image
				d: 'mm',
			});

			// Create an instance of a user (still need to call save() after encrypting pass)
			user = new User({
				name,
				email,
				phone,
				avatar,
				password,
			});
			// Generate Activation Token
			const activationToken = jwt.sign(
				{ email: user.email },
				config.get('jwtSecret')
			);
			user.activationToken = activationToken;

			// Encrypt password (using bcrypt)
			// First create a salt

			// Get a promise from bcrypt.gensalt passing in the number of rounds to salt (10 is current standard)
			const salt = await bcrypt.genSalt(10);

			// Hash password now using the password and the salt to the user.password
			user.password = await bcrypt.hash(password, salt);

			// Save the user which returns a promise (use await in front of anything that returns a promise)
			await user.save();

			// Send Activation Email - Options
			const mailOptions = {
				from: process.env.GMAIL_USER,
				to: user.email,
				subject: 'XYZ - Activate Your Account',
				html: getActivationTemplate(activationToken),
			};

			// Send Activation Email
			transporter.sendMail(mailOptions, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});

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
 * @ROUTE   GET (API/Users/activate/:activationToken)
 * @desc    Activate User Account
 * @access  Public
 *
 */
router.get('/activate/:activationToken', async (req, res) => {
	const { activationToken } = req.params;

	try {
		// verify the given token
		const { email } = jwt.verify(activationToken, config.get('jwtSecret'));
		// find user if exist
		const user = await User.findOne({ email });

		// if user found and activation token match then go for next step other wise return 400
		if (user && user.activationToken === activationToken) {
			if (user.isActive) {
				return res.status(400).json({
					msg: 'Activation Failed',
					error: 'Already Active User',
				});
			} else {
				// user is now active
				user.isActive = true;
				user.activationToken = '';
				await user.save();

				// send a welcome email
				const mailOptions = {
					from: process.env.GMAIL_USER,
					to: user.email,
					subject: 'Welcome to XYZ',
					html: getWelcomeMailTemplate(user),
				};

				transporter.sendMail(mailOptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});

				// Send Welcome SMS
				if (user.phone) {
					sendSMS(user.phone, 'Welcome to XYZ')
						.then((message) => console.log(message))
						.catch((error) => console.log(`Twilio Error`, error));
				}

				res.status(200).json({
					msg: 'Activation Success',
				});
			}
		} else {
			return res.status(400).json({
				msg: 'Activation Failed',
				error: 'Invalid Token',
			});
		}
	} catch (e) {
		console.log(e);
		res.status(400).json({
			msg: 'Activation Failed',
			error: 'Invalid Token',
		});
	}
});

/**
 * @ROUTE   GET (API/Users/password/reset/request)
 * @desc    Password Reset Request
 * @access  Public
 *
 */
router.post('/password/reset/request', async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				msg: 'Password Reset Request Failed',
				error: 'User Not Found',
			});
		} else {
			// Set password reset token
			const passwordResetToken = jwt.sign(
				{ email },
				config.get('jwtSecret')
			);
			user.passwordResetToken = passwordResetToken;
			await user.save();

			// Send password reset token to email
			const mailOptions = {
				from: process.env.GMAIL_USER,
				to: user.email,
				subject: 'XYZ - Your Password Reset Request',
				html: getPasswordResetTemplate(passwordResetToken),
			};

			// Send Activation Email
			transporter.sendMail(mailOptions, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
		}

		res.status(200).json({
			msg: 'Success, Please Check Your Email',
		});
	} catch (e) {
		console.log(e);
		res.status(500).json({
			error: 'Internal Server Error',
		});
	}
});

/**
 * @ROUTE   GET (API/Users/password/reset/verify/:passwordResetToken)
 * @desc    Password Reset Request
 * @access  Public
 *
 */
router.post(
	'/password/reset/verify/:passwordResetToken',
	[
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({
			min: 6,
		}),
	],
	async (req, res) => {
		const errors = validationResult(req);
		// If there is a Bad Request - return an object containing an errors: array {msg, param, location}
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		const { passwordResetToken } = req.params;
		const { password } = req.body;
		try {
			const { email } = jwt.verify(
				passwordResetToken,
				config.get('jwtSecret')
			);

			const user = await User.findOne({ email });
			if (!user) {
				return res.status(404).json({
					msg: 'Password Reset Failed',
					error: 'Invalid Token',
				});
			} else {
				// Encrypt password (using bcrypt)
				// First create a salt

				// Get a promise from bcrypt.gensalt passing in the number of rounds to salt (10 is current standard)
				const salt = await bcrypt.genSalt(10);

				// Hash password now using the password and the salt to the user.password
				user.password = await bcrypt.hash(password, salt);
				user.passwordResetToken = false;

				await user.save();

				// Send password reset success message to email
				const mailOptions = {
					from: process.env.GMAIL_USER,
					to: user.email,
					subject: 'XYZ - Your Password Reset Successful',
					html: getPasswordResetSuccessTemplate(user),
				};

				// Send Activation Email
				transporter.sendMail(mailOptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});

				res.status(200).json({
					msg: 'You Password has Been Updated',
				});
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({
				error: 'Internal Server Error',
			});
		}
	}
);

module.exports = router;
