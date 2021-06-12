const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// Bring in all models (for name / avatar / post)
const Post = require('../../models/Post');
const User = require('../../models/User');

/**
 * @ROUTE   POST (api/posts)
 * @desc    Create a post
 * @access  Private
 */
router.post(
	'/',
	auth,
	[check('text', 'Text is required').not().isEmpty()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			// save the new post in a variable ready to send as a response
			const post = await newPost.save();

			// Send that new post variable in a response
			res.status(201).json(post);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

/**
 * @ROUTE   GET (api/posts)
 * @desc    Get all posts
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
	try {
		// Find posts and sort by most recent (-1)
		const posts = await Post.find().sort({ date: -1 });
		res.status(200).json(posts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

/**
 * @ROUTE   GET (api/posts/:id)
 * @desc    Get post by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
	try {
		// Find post by id from url
		const post = await Post.findById(req.params.id);

		// Check to see if there is a post with that ID
		// if not...
		if (!post) {
			return res.status(404).json({ msg: 'Post not found!' });
		}
		res.status(200).json(post);
	} catch (err) {
		console.error(err.message);
		// If the object id in the url is not a formatted id - there will be no post found...
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found!' });
		}
		res.status(500).send('Server error');
	}
});

/**
 * @ROUTE   DELETE (api/posts/:id)
 * @desc    Delete a post by ID
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
	try {
		// Find post
		const post = await Post.findById(req.params.id);

		// If post doesn't exist
		if (!post) {
			return res.status(404).json({ msg: 'Post not found!' });
		}

		// Ensure the user deleting the post is the user who created the post by matching the posting user to the req user
		if (post.user.toString() !== req.user.id) {
			// Return 'not authorized' status with message
			return res.status(401).json({ msg: 'User not authorized' });
		}

		await post.remove();

		res.json({ msg: 'Post successfully removed!' });
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found!' });
		}
		res.status(500).send('Server error');
	}
});

/**
 * @ROUTE   PUT (api/posts/like/:id)
 * @desc    Like a post by (post) id
 * @access  Private
 */
router.put('/like/:id', auth, async (req, res) => {
	try {
		// Find post by id included in URL
		const post = await Post.findById(req.params.id);

		// Check if the post has already been liked by this user
		// Filter (high order array method) through the 'likes' array to compare the current user by id to see if this user has already liked
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id)
				.length > 0
		) {
			// Return bad request with message if the post is already liked
			return res.status(400).json({ msg: 'Post already liked' });
		}

		// If the user hasn't already liked the post...
		// Add the user_id to the beginning (unshift) of the like array
		post.likes.unshift({ user: req.user.id });

		// Save the entire post object
		await post.save();

		// Send the post.likes as a response (for react / redux)
		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @ROUTE   PUT (api/posts/like/:id)
 * @desc    Like a post by (post) id
 * @access  Private
 */
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		// Find post by id included in URL
		const post = await Post.findById(req.params.id);

		// Check if the post has already been liked by this user
		// Check to see if the user (id) has already liked the post
		if (
			post.likes.filter((like) => like.user.toString() === req.user.id)
				.length === 0
		) {
			// Return bad request with message if the post is already liked
			return res.status(400).json({ msg: 'Post has not been liked yet' });
		}

		// Remove the like by user id
		// Map through the post likes to get the index of the like based on the req.user.id
		const removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(req.user.id);

		// Splice it out of the array
		post.likes.splice(removeIndex, 1);

		// Save the entire post object
		await post.save();

		// Send the post.likes as a response (for react / redux)
		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @ROUTE   POST (api/posts/comment/:id)
 * @desc    Comment on a post
 * @access  Private
 */
router.post(
	'/comment/:id',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);

		// Check for errors
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			// Get the post by id from the url
			const post = await Post.findById(req.params.id);

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);

			await post.save();

			// Send that new comment variable in a response
			res.json(post.comments);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

/**
 * @ROUTE   DELETE (api/posts/comment/:id/:comment_id)
 * @desc    Delete comment by post and comment id
 * @access  Private
 */
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		// Get the post by its ID from the url
		const post = await Post.findById(req.params.id);

		// Get the comment within the post by ID
		// Will either return the comment or false
		const comment = post.comments.find(
			(comment) => comment.id === req.params.comment_id
		);

		// Make sure the comment exists
		if (!comment) {
			// Return res.status 404 not found
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		// Ensure the user trying to delete the comment is the user that created the comment
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		// Locate index
		const removeIndex = post.comments
			.map((comment) => comment.user.toString())
			.indexOf(req.user.id);

		post.comments.splice(removeIndex, 1);

		await post.save();

		res.json(post.comments);
	} catch (error) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
