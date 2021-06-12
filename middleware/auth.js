const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
	// Get token from header
	const token = req.header('x-auth-token');

	// If there is no token..
	if (!token) {
		// return status not authorized
		return res
			.status(401)
			.json({ msg: 'No JSON Web Token found, authorization denied.' });
	}

	// Verify token
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));

		// Set req.user from payload
		req.user = decoded.user;
		// to continue through middleware
		next();
	} catch (err) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
