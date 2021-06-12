import { v4 as uuidv4 } from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

export const setAlert =
	(msg, alertType, timeout = 5000) =>
	(dispatch) => {
		// Generates a random uuid
		const id = uuidv4();

		dispatch({
			// Resolves type in switch statement within alert.js (reducer)
			type: SET_ALERT,
			// Send payload
			payload: { msg, alertType, id },
		});

		//   Remove the alert after 5 seconds using the alert id
		setTimeout(
			() => dispatch({ type: REMOVE_ALERT, payload: id }),
			timeout
		);
	};
