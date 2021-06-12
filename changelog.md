# Change Log

## 1. Ability To Upload Profile Picture

I have used the same avatar property as before to store newly upload profile picture. So if you don't upload any profile picture you will have an avatar from Gravater and you will also able to upload profile picture manually.

### Code Changes Backend

```json
// backend package.json
"dependencies": {
    "multer": "^1.4.2" // added multer 
}
```

```js
// server.js

// created a new directory in the root name public
// inside that directory also created a folder called uploads that will contain all the uploaded files

// make public directory static to serve static files publicly
app.use(express.static('public'));
// accept multipart form within request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
```

After that create a middleware that will extract uploaded file from request and make it accessible via `req.file`

```js
// middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// setup storage and rename file to store uploaded files
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/uploads');
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
	},
});

// configure multer to accept our accepted files
const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024 * 1024 * 5, // it can accept upto 5MB image
	},
	fileFilter: (req, file, cb) => {
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
```

Now create a route that can accept request from client.

```js
// routes/api/upload.js

const fs = require('fs');
const router = require('express').Router();

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const upload = require('../../middleware/uploadMiddleware');

/**
 * @ROUTE   POST (API/Uploads)
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
			res.status(200).json({
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
```

These changes will accept file upload from our backend. Now need some changes to our frontend as well. 



### Frontend Changes

```js
// src/actions/types.js

export const UPLOAD_PROFILE_PICTURE = 'UPLOAD_PROFILE_PICTURE';
```



Now create a action creator that will receive form data and a callback from react component and send a post request to our api endpoint to upload profile picture. After successfully uploaded profile picture it will call the callback to clear state.

```js
// src/actions/profile.js

export const uploadProfilePicture = (data, cb) => async (dispatch) => {
	console.log('Before Posting..');
	try {
		const res = await axios.post('/api/uploads/avatar', data);
		console.log('Upload complete');
		dispatch({
			type: UPLOAD_PROFILE_PICTURE,
			payload: res.data.avatar,
		});
		dispatch(setAlert(res.data.msg, 'success'));
		cb();
	} catch (err) {
		console.log(err);
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: 'Upload Failed',
				status: 400,
			},
		});
		dispatch(setAlert(err.data.msg, 'danger'));
		cb();
	}
};
```

To update redux store we need to call our reducer. As avatar information is stored inside auth, let's update the auth reducer as follows - 

```js
// src/reducers/auth

import { UPLOAD_PROFILE_PICTURE } from '../actions/types';

export default function foo(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		/// ... rest of the codes
		case UPLOAD_PROFILE_PICTURE:
			return {
				...state,
				isAuthenticated: true,
				loading: false,
				// Set user to payload which includes the user
				user: {
					...state.user,
					avatar: payload,
				},
			};
		default:
			return state;
	}
}
```

We need a react component to make things visible. I have created a file inside `src/components/dashboard` called `ProfilePicture.js` and then compose it from `Dashboard.js`

```jsx
// src/components/dashboard/ProfilePicture.js

import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { connect } from 'react-redux';
import { uploadProfilePicture } from '../../actions/profile';

const ProfilePicture = ({ user, uploadProfilePicture }) => {
	const [file, setFile] = useState(null);
	const [previewURL, setPreviewURL] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Uploading');
		if (file) {
			const data = new FormData();
			data.append('avatar', file);
			uploadProfilePicture(data, () => {
				setFile(null);
				setPreviewURL('');
			});
		}
	};

	return (
		<div style={{ margin: '2rem 0' }}>
			<div
				style={{
					width: '200px',
					height: '200px',
					border: '5px solid #424242',
					borderRadius: '50%',
					overflow: 'hidden',
				}}
			>
				{user && (
					<img
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
						src={previewURL ? previewURL : user.avatar}
						alt={`${user.name} avatar`}
					/>
				)}
				<br />
			</div>
			<Form
				style={{ marginTop: '1rem', marginLeft: '2rem' }}
				onSubmit={handleSubmit}
			>
				<FormGroup>
					<Input
						type='file'
						name='file'
						id='exampleFile'
						onChange={(e) => {
							if (e.target.files[0]) {
								setFile(e.target.files[0]);
								setPreviewURL(
									URL.createObjectURL(e.target.files[0])
								);
							}
						}}
					/>
				</FormGroup>
				{file && <Button type='submit'>Upload</Button>}
			</Form>
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.auth.user,
});

export default connect(mapStateToProps, { uploadProfilePicture })(
	ProfilePicture
);
```

Then I call that component from `Dashboard.js`

```jsx
// src/components/dashboard/Dashboard.js

// Line number 34
{/* rest of the codes */}
<Fragment>
    {/* rest of the codes */}
	<ProfilePicture user={user} />
    {/* rest of the codes */}
</Fragment>
```



## 2. Toggle Dropdown Menu with Avatar

I have used Reactstrap library to do that job easily. Reactstrap is a React wrapper for bootstrap. I have changed the `src/components/layout/Navbar.js` completely to serve our purpose. This is the only file we need to change. But add few lines to configure bootstrap and reactstrap - 

```json
// cliend package.json
"dependencies": {
    "bootstrap": "^4.6.0",
    "reactstrap": "^8.9.0"
}
```

```js
// src/index.js

import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

// ...rest of the codes
```

```jsx
// src/components/layout/Navbar.js

import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	NavLink,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';

import { logout } from '../../actions/auth';

const Avatar = ({ user }) => {
	console.log('Avatar', user);
	return (
		<div
			style={{
				width: '40px',
				height: '40px',
				borderRadius: '50%',
				overflow: 'hidden',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<img
				src={user.avatar}
				alt={user.name}
				style={{ width: '100%', height: '100%' }}
			/>
		</div>
	);
};

const TopNavbar = ({ auth: { isAuthenticated, loading, user }, logout }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => setIsOpen(!isOpen);

	const AuthLinks = (
		<Nav
			className='ml-auto'
			navbar
			style={{ display: 'flex', alignItems: 'center' }}
		>
			<NavItem>
				<Link to='/profiles'>
					<NavLink>Users</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/posts'>
					<NavLink>Posts</NavLink>
				</Link>
			</NavItem>
			<UncontrolledDropdown nav inNavbar>
				<DropdownToggle nav>
					<div>{user ? <Avatar user={user} /> : 'Menu'}</div>
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem>
						<Link to='/dashboard' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Dashboard</span>
						</Link>
					</DropdownItem>
					<DropdownItem>
						<Link to='/edit-profile' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Edit Profile</span>
						</Link>
					</DropdownItem>
					<DropdownItem>
						<Link to='/add-experience' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Add Experience</span>
						</Link>
					</DropdownItem>
					<DropdownItem>
						<Link to='/add-education' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Add Education</span>
						</Link>
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem>
						<a
							onClick={logout}
							href='#!'
							style={{ color: 'black' }}
						>
							<i className='fas fa-sign-out-alt'></i>{' '}
							<span className='hide-sm'>Logout</span>
						</a>
					</DropdownItem>
				</DropdownMenu>
			</UncontrolledDropdown>
		</Nav>
	);

	const guestLinks = (
		<Nav className='ml-auto' navbar>
			<NavItem>
				<Link to='/profiles'>
					<NavLink>Users</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/register'>
					<NavLink>Register</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/login'>
					<NavLink>Login</NavLink>
				</Link>
			</NavItem>
		</Nav>
	);

	return (
		<div>
			<Navbar color='dark' dark expand='md'>
				<Link to='/'>
					<NavbarBrand>
						<i className='fas fa-terminal'></i> MERN Auth
					</NavbarBrand>
				</Link>
				<NavbarToggler onClick={toggle} />
				<Collapse isOpen={isOpen} navbar></Collapse>
				{!loading && isAuthenticated ? AuthLinks : guestLinks}
			</Navbar>
		</div>
	);
};

TopNavbar.propTypes = {
	logout: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { logout })(TopNavbar);

```



## 3. Display An Emblem If Profile is 100% Complete

To implement this feature we need to update both frontend and backend. 

### Backend Changes

```js
// routes/api/profile.js


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
 */
router.get('/me', auth, async (req, res) => {
	try {
        // ...rest of the codes
		res.json({ ...profile._doc, isComplete: isProfileComplete(profile) });
	} catch (err) {
		// ...rest of the codes
	}
});

/**
 * @ROUTE   GET (API/Profile)
 * @desc    Get all profiles
 * @access  Public
 */
router.get('/', async (req, res) => {
	try {
		// ...rest of the codes
		profiles = profiles.map((profile) => ({
			...profile._doc,
			isComplete: isProfileComplete(profile),
		}));
		res.json(profiles);
	} catch (err) {
    	// ...rest of the codes
	}
});
```

### Frontend Changes

```jsx
// src/components/dashboard/Dashboard.js

// after composing ProfilePicture I just update the code as follows

{/* ...rest of the codes */}
<ProfilePicture user={user} />
<p className='lead'>
    <i className='fas fa-user'></i> Welcome {user && user.name}
    {profile && profile.isComplete && (
        <img
            style={{
                width: '25px',
                    height: 'auto',
                        marginLeft: '1rem',
            }}
            src={emblem}
            alt='complete profile'
            />
    )}
</p>
{/* ...rest of the codes */}
```



## 4. New User Email Verification

We need to create both frontend and backend routes to implement this feature correctly. We also need to setup a mail transporter that we can use for other features too. We will use nodemailer as an email transporter and gmail as SMTP server.

First configure our transporter - 

```json
// backend package.json

"dotenv": "^8.2.0"
"nodemailer": "^6.5.0"
```

```.env
// .env
GMAIL_USER=Your_Gmail_User_Name
GMAIL_PASSWORD=Your_Gmail_User_Password
FRONTEND_URL=http://localhost:3000
```

```js
// server.js

// first line of your server.js should be like this. 
// configure the environment variables
require('dotenv').config();
```

Before moving on next section we need to update our User model as follows - 

```js
// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	// ...rest of the codes
	// newly added properties
	isActive: {
		type: Boolean,
		default: false,
	},
	activationToken: String,
});

module.exports = User = mongoose.model('user', UserSchema);

```



Let's create a directory called `email` and inside that directory create a file called `transporter.js` that will look as the following and we can reuse the transporter whenever we need to send email.

```js
// email/transporter.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASSWORD,
	},
});

module.exports = transporter;
```

Create  another file called `templates.js` where we will write some functions that will generate different templates for us. For now we are creating two different templates as follows - 

```js
// email/templates.js

const getWelcomeMailTemplate = (user) => {
	return `
        <p>Hello ${user.name}, Welcome to The Network</p>
    `;
};

const getActivationTemplate = (activationToken) => {
	const link = `${process.env.FRONTEND_URL}/users/activate/${activationToken}`;
	return `
        To activate your account please follow the link -
        Link: <a href=${link}>${link}</a>
    `;
};

module.exports = {
	getWelcomeMailTemplate,
	getActivationTemplate,
};
```

Now we are able to send email. When someone create a new account we should send then an activation email. To do that we need to update our registration route.

```js
// routes/api/users.js

// ...rest of the codes
// Bring in nodemailer transporter
const transporter = require('../../email/transporter');
const {
	getActivationTemplate,
	getWelcomeMailTemplate,
} = require('../../email/templates');

/**
 * @ROUTE   POST (API/Users)
 * @desc    Register user
 * @access  Public
 *
 */
router.post(
	'/',
	[
		// validation check
	],
	async (req, res) => {
		// ...rest of the codes
		try {
			// ...rest of the codes

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
			// ...rest of the codes
		}
	}
);
```

To activate from given toke we need a frontend route and a backend route. Let's first create the backend route inside the `routes/api/users.js` file.

```js
// routes/api/users.js

/**
 * @ROUTE   GET (API/Users)
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

				// Send Activation Email
				transporter.sendMail(mailOptions, (err, info) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});

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
```

As our verification token or link must need a frontend to work we have to create a route and component to our frontend. I have created a component called Activate inside `src/components/auth`. Whenever someone try to click on the link from email they will land on this component. 

```jsx
// src/components/auth/Activate.js

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Spinner from '../layout/Spinner';

const ActivateAccount = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [msg, setMsg] = useState('');
	const { activateToken } = useParams();

	useEffect(() => {
		const url = `/api/users/activate/${activateToken}`;
		axios
			.get(url)
			.then(({ data }) => {
				setError('');
				setMsg(data.msg);
				setIsLoading(false);
			})
			.catch(({ data }) => {
				setError(data.error);
				setMsg(data.msg);
				setIsLoading(false);
			});
	}, []);

	return (
		<>
			<div className='mid-container'>
				{isLoading && <Spinner />}
				{msg && <h1>{msg}</h1>}
				{error && <h2>{error}</h2>}
			</div>
		</>
	);
};

export default ActivateAccount;
```

```jsx
// src/App.js

import ActivateAccount from './components/auth/Activate';

// Inside <Route> add another route as follows
<Switch>
	<Route
        exact
        path='/users/activate/:activateToken'
        component={ActivateAccount}
    />
</Switch>
```

Whenever users activate their account the system will send them a welcome email.



## 5. Reset Password

To reset password we need two different routes for frontend and two different routes for backend. The first route will accept password reset request and send a reset token to the given user email. The second route will accept new password and reset it totally. 

### Backend Changes 

First update the User model as follows to accept password reset request.

```js
// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	// ...rest of the codes
	passwordResetToken: String
});

module.exports = User = mongoose.model('user', UserSchema);
```

At first create a route that can accept password reset request and send an email with password reset token.

```js
// routes/api/users.js

/**
 * @ROUTE   GET (API/Users)
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
```

Then create another route than can verify the token and reset the password.

```js
// routes/api/users.js

/**
 * @ROUTE   GET (API/Users)
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
```

For backend that's enough. Now move on frontend and create two different components that will have different route.

### Frontend Changes

We need a form that has an email field to send a password reset request. Let's create that form first -

```jsx
// src/components/auth/ForgetPasswordReq.js

import React, { Fragment, useState } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';

export const ForgetPasswordRequest = ({ isAuthenticated, setAlert }) => {
	const [email, setEmail] = useState('');
	const [msg, setMsg] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	//   Use onChange for all field target names
	const onChange = (e) => setEmail(e.target.value);

	const onSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		axios
			.post('/api/users/password/reset/request', { email })
			.then(({ data }) => {
				setMsg(data.msg);
				setAlert(data.msg, 'success');
				setIsLoading(false);
				setError('');
			})
			.catch(({ data }) => {
				setMsg('');
				setAlert(data.error, 'danger');
				setIsLoading(false);
				setError(data.error);
			});
	};

	//   Redirect if logged in
	if (isAuthenticated) {
		return <Redirect to='/dashboard' />;
	}

	return (
		<Fragment>
			<div className='mid-container'>
				<h1 className='large text-primary'>Password Reset</h1>
				<p className='lead'>
					<i className='fas fa-user'></i> Enter Your Registered Email
				</p>
				<form className='form' onSubmit={(e) => onSubmit(e)}>
					<div className='form-group'>
						<input
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => onChange(e)}
							name='email'
						/>
					</div>
					<input
						type='submit'
						className='btn btn-primary'
						value='Reset Password'
						disabled={isLoading}
					/>
					{isLoading && <Spinner />}
				</form>
				{msg && <p>{msg}</p>}
				{error && <p>{error}</p>}
			</div>
		</Fragment>
	);
};

ForgetPasswordRequest.propTypes = {
	isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { setAlert })(ForgetPasswordRequest);
```

Then create another component that will have a form of two password field to setup a new password - 

```jsx
// src/components/auth/ForgetPasswordReset.js

import React, { Fragment, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';

export const ForgetPasswordReset = ({ isAuthenticated, setAlert }) => {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [msg, setMsg] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { passwordResetToken } = useParams();

	const onSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		if (password && password === confirmPassword) {
			axios
				.post(
					`/api/users/password/reset/verify/${passwordResetToken}`,
					{ password }
				)
				.then(({ data }) => {
					setMsg(data.msg);
					setAlert(data.msg, 'success');
					setIsLoading(false);
					setError('');
				})
				.catch(({ data }) => {
					setMsg('');
					setAlert(data.error, 'danger');
					setIsLoading(false);
					setError(data.error);
				});
		}
	};

	//   Redirect if logged in
	if (isAuthenticated) {
		return <Redirect to='/dashboard' />;
	}

	return (
		<Fragment>
			<div className='mid-container'>
				<h1 className='large text-primary'>Password Reset</h1>
				<p className='lead'>
					<i className='fas fa-user'></i> Enter Your Registered Email
				</p>
				<form className='form' onSubmit={(e) => onSubmit(e)}>
					<div className='form-group'>
						<input
							type='password'
							placeholder='Password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							name='password'
						/>
					</div>
					<div className='form-group'>
						<input
							type='password'
							placeholder='Confirm Password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							name='password'
						/>
					</div>
					<input
						type='submit'
						className='btn btn-primary'
						value='Submit'
						disabled={isLoading}
					/>
					{isLoading && <Spinner />}
				</form>
				{msg && <p>{msg}</p>}
				{error && <p>{error}</p>}
			</div>
		</Fragment>
	);
};

ForgetPasswordReset.propTypes = {
	isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { setAlert })(ForgetPasswordReset);
```

Finally update the `src/app.js` file as follows to create two additional routes -

```jsx
// src/App.js

import ForgetPasswordRequest from './components/auth/ForgetPasswordReq';
import ForgetPasswordReset from './components/auth/ForgetPasswordReset';

// Inside <Route> add another route as follows
<Switch>
	<Route
        exact
        path='/password/reset/request'
        component={ForgetPasswordRequest}
        />
    <Route
        exact
        path='/password/reset/verify/:passwordResetToken'
        component={ForgetPasswordReset}
        />
</Switch>
```

That's It



