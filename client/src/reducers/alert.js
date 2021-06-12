import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

/**
 * Alert.js is a reducer that acts as a function to take in a state and an action
 * which is dispatched from an action file
 */

const initialState = [];

// Named anonymous function 'foo' to make 'unexpected default of anonymous function' complain cease - linting changed
export default function alert(state = initialState, action) {
	// Deconstruct action type and payload from action.type and action.payload
	const { type, payload } = action;

	switch (type) {
		case SET_ALERT:
			// State is immutable, therefore we use spread operator by adding in previous states
			return [...state, payload];

		case REMOVE_ALERT:
			return state.filter((alert) => alert.id !== payload);

		default:
			return state;
	}
}
