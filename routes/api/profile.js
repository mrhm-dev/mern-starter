const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

/**
 * check the profile is complete or not. here we skip the social links
 * @param {object} profile
 * @returns {boolean}
 */
function isProfileComplete(profile) {
	let isComplete = true;
	if (!profile.company) isComplete = false;
	if (!profile.website) isComplete = false;
	if (!profile.location) isComplete = false;
	if (!profile.status) isComplete = false;
	if (!profile.bio) isComplete = false;
	if (!profile.githubusername) isComplete = false;
	if (profile.skills && profile.skills.length === 0) isComplete = false;
	if (profile.experience && profile.experience.length === 0)
		isComplete = false;
	if (profile.education && profile.education.length === 0) isComplete = false;
	return isComplete;
}

/**
 * @ROUTE   GET (API/Profile/Me)
 * @desc    Get current users profile
 * @access  Private
 *
 */
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(404).json({
				msg: 'There is no profile for this user',
			});
		}

		res.json({ ...profile._doc, isComplete: isProfileComplete(profile) });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

/**
 * @ROUTE   POST (API/Profile)
 * @desc    Create or Update user profile
 * @access  Private
 *
 */
router.post(
	'/',
	auth,
	// Check for body errors
	check('status', 'Status is required').not().isEmpty(),
	check('skills', 'Skills is requried').not().isEmpty(),
	async (req, res) => {
		// handle request body errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		// Build the Profile Object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills
				.split(',')
				.map((skill) => skill.trim());
		}

		// ['javascript', 'react', 'java', 'vue', 'angular', 'nodejs']

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			// Search for a user profile by id
			let profile = await Profile.findOne({ user: req.user.id });

			// If there is a profile...
			if (profile) {
				//  Update it
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.status(201).json(profile);
			}

			//  If there is NOT a profile...
			//  Create one
			profile = new Profile(profileFields);

			// Save the profile to database
			await profile.save();

			// Return profile json
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error!');
		}
	}
);

// /api/profiles

/**
 * @ROUTE   GET (API/Profile)
 * @desc    Get all profiles
 * @access  Public
 *
 */
router.get('/', async (req, res) => {
	try {
		let profiles = await Profile.find().populate('user', [
			'name',
			'avatar',
		]);
		profiles = profiles.map((profile) => ({
			...profile._doc,
			isComplete: isProfileComplete(profile),
		}));
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error!');
	}
});

/**
 * @ROUTE   GET (API/profile/user/:user_id)
 * @desc    Get profile by user ID
 * @access  Public
 *
 */
router.get('/user/:user_id', async (req, res) => {
	try {
		// Search for a user profile by user_id
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);

		// If user profile doesn't exist send 400 error...
		if (!profile) return res.status(400).json({ msg: 'Profile not found' });

		// Else return the profile
		res.json({ ...profile._doc, isComplete: isProfileComplete(profile) });
	} catch (err) {
		// Else if there is no valid object user id or otherwise...
		console.error(err.message);
		if (err.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server error!');
	}
});

/**
 * @ROUTE   DELETE (API/profile)
 * @desc    Delete profile, user, and posts
 * @access  Private
 *
 */
// Add Auth middleware as this is a private route
router.delete('/', auth, async (req, res) => {
	try {
		// Remove Users posts
		await Post.deleteMany({ user: req.user.id });
		// Remove user Profile
		await Profile.findOneAndRemove({ user: req.user.id }); // We can access req.user.id since this is a protected route
		// Remove User
		await User.findOneAndRemove({ _id: req.user.id });

		res.status(204).send();
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error!');
	}
});

/**
 * @ROUTE   PUT (API/profile/experience)
 * @desc    Add profile experience
 * @access  Private
 *
 */
router.put(
	'/experience',
	auth,
	[
		check('title', 'Title is required').not().isEmpty(),
		check('company', 'Company is required').not().isEmpty(),
		check('from', 'From date is required').not().isEmpty(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Capture the data submitted in req.body in a new const variable
		const { title, company, location, from, to, current, description } =
			req.body;

		// Create a new experience object with the submitted data from req.body
		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			// Find the profile to add an experience to with the user.id from the JWT
			const profile = await Profile.findOne({ user: req.user.id });

			// Unshift or append to the front of the experience array the new experience.
			profile.experience.unshift(newExp);

			// Save the profile
			await profile.save();

			// Return the profile json
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error!');
		}
	}
);

/**
 * @ROUTE   DELETE (API/profile/experience/:exp_id)
 * @desc    Deleting experience from profile
 * @access  Private
 */
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		// Get profile of logged in user
		const profile = await Profile.findOne({ user: req.user.id });

		// Get the remove index
		const removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);

		// Splice the experience out at the correct index
		profile.experience.splice(removeIndex, 1);

		// Save the user
		await profile.save();

		// Return the user
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error!');
	}
});

/**
 * @ROUTE   PUT (API/profile/education)
 * @desc    Add profile education
 * @access  Private
 *
 */
router.put(
	'/education',
	auth,
	[
		check('school', 'School is required').not().isEmpty(),
		check('degree', 'Degree is required').not().isEmpty(),
		check('fieldofstudy', 'Field of study is required').not().isEmpty(),
		check('from', 'From date is required').not().isEmpty(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Capture the data submitted in req.body in a new const variable
		const { school, degree, fieldofstudy, from, to, current, description } =
			req.body;

		// Create a new experience object with the submitted data from req.body
		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			// Find the profile to add an experience to with the user.id from the JWT
			const profile = await Profile.findOne({ user: req.user.id });

			// Unshift or append to the front of the experience array the new experience.
			profile.education.unshift(newEdu);

			// Save the profile
			await profile.save();

			// Return the profile json
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error!');
		}
	}
);

/**
 * @ROUTE   DELETE (API/profile/education/:edu_id)
 * @desc    Deleting education from profile
 * @access  Private
 */
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		// Get profile of logged in user
		const profile = await Profile.findOne({ user: req.user.id });

		// Get the remove index
		const removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);

		// Splice the experience out at the correct index
		profile.education.splice(removeIndex, 1);

		// Save the user
		await profile.save();

		// Return the user
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error!');
	}
});

/**
 * @ROUTE   GET (API/profile/github/:username)
 * @desc    Get user repos from GitHub
 * @access  Public
 */
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: encodeURI(
				`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
			),
			method: 'GET',
			headers: {
				'user-agent': 'node.js',
				Authorization: `token ${config.get('githubToken')}`,
			},
		};

		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No Github profile found' });
			}

			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
