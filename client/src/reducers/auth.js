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
	ACCOUNT_DELETED,
	UPLOAD_PROFILE_PICTURE,
} from '../actions/types';

const initialState = {
	// Look for an item in localstorage called 'token'
	token: localStorage.getItem('token'),
	isAuthenticated: null,
	// Check that loading is complete (backend request made and response given)
	loading: true,
	// User data including name, email, avatar, etc. will be stored here
	user: null,
};

export default function auth(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case USER_LOADED:
			return {
				...state,
				isAuthenticated: true,
				loading: false,
				// Set user to payload which includes the user
				user: payload,
			};
		case REGISTER_SUCCESS:
		case LOGIN_SUCCESS:
		case GOOGLE_AUTH_SUCCESS:
			// If token is there - set the token to the payload
			localStorage.setItem('token', payload.token);
			return {
				...state,
				...payload,
				// Registration SUCCESS - Authenticated
				isAuthenticated: true,
				loading: false,
			};
		case REGISTER_FAIL:
		case AUTH_ERROR:
		case LOGIN_FAIL:
		case GOOGLE_AUTH_FAIL:
		case LOGOUT:
		case ACCOUNT_DELETED:
			// Remove token entirely in the event of a failed login for whatever reason
			// Clears auth state and token from local storage
			localStorage.removeItem('token');
			return {
				...state,
				token: null,
				// Registration FAILED - NOT authenticated
				isAuthenticated: false,
				loading: false,
			};
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
