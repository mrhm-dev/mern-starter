import {
	GET_PROFILE,
	GET_PROFILES,
	PROFILE_ERROR,
	CLEAR_PROFILE,
	UPDATE_PROFILE,
	GET_REPOS,
} from '../actions/types';

const initialState = {
	// Profile data for user and
	profile: null,
	// Getting user profiles to display
	profiles: [],
	// Fetching github repos
	repos: [],
	loading: true,
	// Store any errors in the request
	error: {},
};

export default function profile(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case GET_PROFILE:
		case UPDATE_PROFILE:
			return {
				...state,
				profile: payload,
				loading: false,
			};
		case GET_PROFILES:
			return {
				...state,
				profiles: payload,
				loading: false,
			};
		case PROFILE_ERROR:
			return {
				...state,
				error: payload,
				loading: false,
			};
		case CLEAR_PROFILE:
			return {
				...state,
				profile: null,
				repos: [],
				loading: false,
			};
		case GET_REPOS:
			return {
				...state,
				repos: payload,
				loading: false,
			};
		default:
			return state;
	}
}
