import axios from 'axios';
import { setAlert } from './alert';

import {
	GET_PROFILE,
	GET_PROFILES,
	PROFILE_ERROR,
	UPDATE_PROFILE,
	CLEAR_PROFILE,
	ACCOUNT_DELETED,
	GET_REPOS,
	UPLOAD_PROFILE_PICTURE,
} from './types';

// Upload Profile Picture
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

// Get current users profile
export const getCurrentProfile = () => async (dispatch) => {
	try {
		const res = await axios.get('/api/profile/me');

		dispatch({
			type: GET_PROFILE,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Get all profiles
export const getProfiles = () => async (dispatch) => {
	dispatch({ type: CLEAR_PROFILE });

	try {
		const res = await axios.get('/api/profile');

		dispatch({
			type: GET_PROFILES,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Get profile by ID
export const getProfileById = (userId) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/profile/user/${userId}`);

		dispatch({
			type: GET_PROFILE,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Get GitHub repos
export const getGithubRepos = (username) => async (dispatch) => {
	try {
		const res = await axios.get(`/api/profile/github/${username}`);

		dispatch({
			type: GET_REPOS,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Create or update user profile
export const createProfile = (formData, history, edit = false) => async (
	dispatch
) => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json',
			},
		};

		// making post request to api/profile
		const res = await axios.post('/api/profile', formData, config);

		dispatch({
			type: GET_PROFILE,
			// Payload is actual profile send over
			payload: res.data,
		});

		dispatch(
			setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success')
		);

		// If editing - stay on page | if creating - redirect
		if (!edit) {
			history.push('/dashboard');
		}
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Add Experience
export const addExperience = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json',
			},
		};

		// making PUT request to api/profile
		const res = await axios.put(
			'/api/profile/experience',
			formData,
			config
		);

		dispatch({
			type: UPDATE_PROFILE,
			// Payload is actual profile send over
			payload: res.data,
		});

		dispatch(setAlert('Experience Added', 'success'));

		history.push('/dashboard');
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Add Education
export const addEducation = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				'Content-Type': 'application/json',
			},
		};

		// making PUT request to api/profile
		const res = await axios.put('/api/profile/education', formData, config);

		dispatch({
			type: UPDATE_PROFILE,
			// Payload is actual profile send over
			payload: res.data,
		});

		dispatch(setAlert('Education Added', 'success'));

		// Redirect
		history.push('/dashboard');
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Delete Experience - req to profile/experience with ID
export const deleteExperience = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/profile/experience/${id}`);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert('Experience successfully deleted!', 'success'));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Delete Education - req to profile/experience with ID
export const deleteEducation = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/profile/education/${id}`);

		dispatch({
			type: UPDATE_PROFILE,
			payload: res.data,
		});

		dispatch(setAlert('Education successfully deleted!', 'success'));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.data.msg,
				status: err.response.status,
			},
		});
	}
};

// Delete account and profile
export const deleteAccount = () => async (dispatch) => {
	if (
		window.confirm(
			`Are you sure you want to delete your account? There's no going back!`
		)
	) {
		try {
			await axios.delete('/api/profile');

			dispatch({ type: CLEAR_PROFILE });
			dispatch({ type: ACCOUNT_DELETED });

			dispatch(setAlert('Your account has been permanently deleted!'));
		} catch (err) {
			dispatch({
				type: PROFILE_ERROR,
				payload: {
					msg: err.response.data.msg,
					status: err.response.status,
				},
			});
		}
	}
};
