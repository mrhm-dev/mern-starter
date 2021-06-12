import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import { login } from '../../actions/auth';
import { GoogleLogin } from 'react-google-login';

import { login, authGoogle } from '../../actions/auth';
import { google } from '../../config';

export const Login = ({ login, isAuthenticated, authGoogle }) => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const { email, password } = formData;

	//   Use onChange for all field target names
	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		login(email, password);
	};

	const onSuccess = async (googleData) => {
		authGoogle(googleData.tokenId);
	};

	const onFailure = (res) => {
		console.log(res);
	};

	//   Redirect if logged in
	if (isAuthenticated) {
		return <Redirect to='/dashboard' />;
	}

	return (
		<Fragment>
			<div className='mid-container'>
				<h1 className='large text-primary'>Sign In</h1>
				<p className='lead'>
					<i className='fas fa-user'></i> Sign Into Your Account
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
					<div className='form-group'>
						<input
							type='password'
							placeholder='Password'
							name='password'
							value={password}
							onChange={(e) => onChange(e)}
							// minLength='6'
						/>
					</div>
					<input
						type='submit'
						className='btn btn-primary'
						value='Login'
					/>
				</form>
				<p className='my-1'>
					Don't have an account? <Link to='/register'>Sign Up</Link>
				</p>
				<p>
					Forget Password?{' '}
					<Link to='/password/reset/request'>Click Here</Link>
				</p>
				<GoogleLogin
					clientId={google.GOOGLE_CLIEN_ID}
					buttonText='Login with Google'
					onSuccess={onSuccess}
					onFailure={onFailure}
					cookiePolicy={'single_host_origin'}
					style={{ marginTop: '10px' }}
				/>
			</div>
		</Fragment>
	);
};

Login.propTypes = {
	login: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
	authGoogle: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { login, authGoogle })(Login);
