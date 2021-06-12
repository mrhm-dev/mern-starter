import React, { Fragment, useState } from 'react';
import Recaptcha from 'react-recaptcha';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import { setAlert } from '../../actions/alert';
import { register, authGoogle } from '../../actions/auth';
import PropTypes from 'prop-types';
import { google } from '../../config';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import App from './TOS';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.css';

const Register = ({ setAlert, register, isAuthenticated, authGoogle }) => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		password2: '',
	});

	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleOk = () => {
		setIsChecked(true);
		setIsModalVisible(false);
	};

	const handleCancel = () => {
		setIsChecked(false);
		setIsModalVisible(false);
	};
	const { name, email, phone, password, password2 } = formData;

	//   Use onChange for all field target names

	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });
	const verifyCallback = (response) => {
		if (response) {
			setIsVerified(true);
		}
	};
	const onSubmit = async (e) => {
		e.preventDefault();
		if (password !== password2) {
			if (!isVerified) {
				setAlert('please Verify');
			}
			//   props.setAlert('Passwords do not match!', 'danger');
			setAlert('Passwords do not match!', 'danger');
		} else {
			register({ name, email, password, phone });
			setAlert(
				'Registration Successful, Please Check Your Email To Activate Your Account'
			);
		}
	};
	const callback = () => {
		console.log('recaptacha loaded');
	};
	const onSuccess = async (googleData) => {
		authGoogle(googleData.tokenId);
	};

	const onFailure = (res) => {
		console.log(res);
	};

	if (isAuthenticated) {
		return <Redirect to='/dashboard' />;
	}

	return (
		<Fragment>
			<div className='mid-container'>
				<h1 className='large text-primary'>Sign Up</h1>
				<p className='lead'>
					<i className='fas fa-user'></i> Create Your Account
				</p>
				<form className='form' onSubmit={(e) => onSubmit(e)}>
					<div className='form-group'>
						<input
							type='text'
							placeholder='Name'
							name='name'
							value={name}
							onChange={(e) => onChange(e)}
							// required
						/>
					</div>
					<div className='form-group'>
						<input
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => onChange(e)}
							name='email'
						/>
						<small className='form-text'>
							This website uses Gravatar so if you want a profile
							image, use a Gravatar email
						</small>
					</div>
					<div className='form-group'>
						<input
							type='text'
							placeholder='Phone Number'
							value={phone}
							onChange={(e) => onChange(e)}
							name='phone'
						/>
						<small className='form-text'>
							This website uses Gravatar so if you want a profile
							image, use a Gravatar email
						</small>
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
					<div className='form-group'>
						<input
							type='password'
							placeholder='Confirm Password'
							name='password2'
							value={password2}
							onChange={(e) => onChange(e)}
							// minLength='6'
						/>
					</div>

					<div className='form-group'>
						<Checkbox onClick={showModal} checked={isChecked}>
							I Accept the Privacy Policy and TOS
						</Checkbox>
					</div>
					<div className='form-group'>
						<Recaptcha
							sitekey='6LeIOJoaAAAAAAWJ1X8VCs-2Y74DVn6f1c1yrBcX'
							render='explicit'
							onloadCallback={() => callback()}
							verifyCallback={() => verifyCallback()}
						/>
					</div>

					<input
						type='submit'
						className='btn btn-primary'
						value='Register'
					/>
				</form>
				<p className='my-1'>
					Already have an account? <Link to='/login'>Sign In</Link>
				</p>
				<div>
					<GoogleLogin
						clientId={google.GOOGLE_CLIEN_ID}
						buttonText='Login with Google'
						onSuccess={onSuccess}
						onFailure={onFailure}
						cookiePolicy={'single_host_origin'}
						style={{ marginTop: '10px' }}
					/>
				</div>
			</div>
			<Modal
				title='Terms & Condition'
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
			>
				<p>Some contents...</p>
				<p>Some contents...</p>
				<p>Some contents...</p>
			</Modal>
		</Fragment>
	);
};

Register.propTypes = {
	setAlert: PropTypes.func.isRequired,
	register: PropTypes.func.isRequired,
	authGoogle: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { setAlert, register, authGoogle })(
	Register
);
