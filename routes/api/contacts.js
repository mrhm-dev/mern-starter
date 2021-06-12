const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const Contact = require('../../models/Contact');
const transporter = require('../../email/transporter');
const { getContactMessageTemplate } = require('../../email/templates');

/**
 * @ROUTE   POST (API/contacts)
 * @desc    Create contact messages
 * @access  Public
 */
router.post(
	'/',
	[
		// Validate that name is not empty using express validator
		check('name', 'Name is required').not().isEmpty(),
		// Validate that email is in correct email format using express validator
		check('email', 'Please include a valid email').isEmail(),
		check(
			'subject',
			'Please enter a subject between 10 and 50 characters'
		).isLength({
			min: 10,
			max: 50,
		}),
		check(
			'message',
			'Please enter a message with 20 or more characters'
		).isLength({
			min: 20,
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

		const { name, email, subject, message } = req.body;

		try {
			const contact = new Contact({
				name,
				email,
				subject,
				message,
			});

			// save contact to database
			await contact.save();

			// Send an email to admin
			const mailOptions = {
				from: process.env.GMAIL_USER,
				to: process.env.ADMIN_EMAIL,
				subject: `Email Received: ${subject}`,
				html: getContactMessageTemplate(email, message),
			};
			transporter.sendMail(mailOptions, (err, info) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});

			// return response
			return res.status(201).json({
				message:
					'Your message has been received, We will contact you soon.',
			});
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error!');
		}
	}
);

/**
 * @ROUTE   GET (API/contacts)
 * @desc    Get all available contact messages
 * @access  Public
 */
router.get('/', async (req, res) => {
	try {
		const contacts = await Contact.find();
		return res.status(200).json(contacts);
	} catch (e) {
		console.error(err.message);
		res.status(500).send('Server error!');
	}
});

module.exports = router;
