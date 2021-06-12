import React, { Fragment, useState } from 'react';
import isEmail from 'validator/lib/isEmail';
import axios from 'axios';
import 'antd/dist/antd.css';

const Contact = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});

	const [error, setError] = useState({});
	const [successMessage, setSuccessMessage] = useState('');

	const { name, email, subject, message } = formData;

	//   Use onChange for all field target names
	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		e.preventDefault();
		const { hasError, error } = isValid();
		if (hasError) {
			setError(error);
		} else {
			axios
				.post('/api/contacts', formData)
				.then(({ data }) => {
					setFormData({
						name: '',
						email: '',
						subject: '',
						message: '',
					});
					setSuccessMessage(data.message);
					setError({});
				})
				.catch((e) => {
					console.log(e.response.data);
					// errors array getting from server
					const { errors } = e.response.data;
					// local error object that is initially empty
					const error = {};
					errors.forEach((item) => (error[item.param] = item.msg));
					setSuccessMessage('');
					setError(error);
				});
		}
	};

	// check validity
	const isValid = () => {
		const error = {};

		if (!name) {
			error.name = 'Invalid Name';
		}

		if (!email || !isEmail(email)) {
			error.email = 'Invalid Email';
		}

		if (!subject) {
			error.subject = 'Invalid Subject';
		}

		if (!message) {
			error.message = 'Invalid Messages';
		}

		return {
			hasError: Object.keys(error).length > 0,
			error,
		};
	};

	const errorKeys = Object.keys(error);
	return (
		<Fragment>
			<div className='mid-container'>
				<h1 className='large text-primary'>Contact Us</h1>
				<p className='lead'>
					<i class='fas fa-envelope'></i> Send Your Message
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
					</div>
					<div className='form-group'>
						<input
							type='text'
							placeholder='Subject'
							value={subject}
							onChange={(e) => onChange(e)}
							name='subject'
						/>
					</div>
					<div className='form-group'>
						<textarea
							placeholder='Type Your Message'
							name='message'
							value={message}
							onChange={(e) => onChange(e)}
							// minLength='6'
						/>
					</div>
					<input
						type='submit'
						className='btn btn-primary'
						value='Send Message'
					/>
				</form>
				{errorKeys.length > 0 && (
					<div style={{ marginTop: '2rem', color: 'red' }}>
						<p>Errors</p>
						<ul>
							{errorKeys.map((key) => (
								<li key={key}>{error[key]}</li>
							))}
						</ul>
					</div>
				)}
				{successMessage && (
					<div style={{ marginTop: '2rem', color: 'green' }}>
						<p>Success</p>
						<p>{successMessage}</p>
					</div>
				)}
			</div>
		</Fragment>
	);
};

export default Contact;
