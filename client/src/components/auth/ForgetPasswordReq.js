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
