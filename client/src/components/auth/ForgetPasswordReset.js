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
