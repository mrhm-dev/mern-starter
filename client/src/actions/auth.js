import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import { setAlert } from './alert';
import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	USER_LOADED,
	AUTH_ERROR,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
	GOOGLE_AUTH_SUCCESS,
	GOOGLE_AUTH_FAIL,
	CLEAR_PROFILE,
} from './types';

// Load User
export const loadUser = () => async (dispatch) => {
	// Set the header with the token if there is one
	if (localStorage.getItem('token')) {
		setAuthToken(localStorage.getItem('token'));
	}

	try {
		const res = await axios.get('/api/auth');

		dispatch({
			type: USER_LOADED,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: AUTH_ERROR,
		});
	}
};

// Register User
export const register =
	({ name, email, password, phone }) =>
	async (dispatch) => {
		const config = {
			headers: {
				'Content-Type': 'application/json',
			},
		};

		// Prepare data to send
		const body = JSON.stringify({ name, email, password, phone });

		try {
			const res = await axios.post('/api/users', body, config);

			dispatch({
				// Dispatch registration success from auth.js (reducers) switch
				type: REGISTER_SUCCESS,
				payload: res.data,
			});

			dispatch(loadUser());
		} catch (err) {
			const errors = err.response.data.errors;

			if (errors) {
				errors.forEach((error) =>
					dispatch(setAlert(error.msg, 'danger'))
				);
			}

			dispatch({
				// Dispatch registration fail from auth.js (reducers)
				type: REGISTER_FAIL,
			});
		}
	};

// Authenticate with Google
export const authGoogle = (token) => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json',
		},
	};

	// Prepare data to send
	const body = JSON.stringify({ token });

	try {
		const res = await axios.post('/api/auth/google', body, config);
		dispatch({
			// Dispatch registration success from auth.js (reducers) switch
			type: GOOGLE_AUTH_SUCCESS,
			payload: res.data,
		});

		dispatch(loadUser());
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			// Dispatch registration fail from auth.js (reducers)
			type: GOOGLE_AUTH_FAIL,
		});
	}
};

// Login User
export const login = (email, password) => async (dispatch) => {
	// We're sending data so we want a config
	const config = {
		headers: {
			'Content-Type': 'application/json',
		},
	};

	// Prepare data to send
	const body = JSON.stringify({ email, password });

	try {
		const res = await axios.post('/api/auth', body, config);

		dispatch({
			// Dispatch registration success from auth.js (reducers) switch
			type: LOGIN_SUCCESS,
			//   Send the data as a payload
			payload: res.data,
		});

		dispatch(loadUser());
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}

		dispatch({
			// Dispatch registration fail from auth.js (reducers)
			type: LOGIN_FAIL,
		});
	}
};

// Logout & Clear Profile
export const logout = () => (dispatch) => {
	dispatch({ type: CLEAR_PROFILE });
	dispatch({ type: LOGOUT });
};
