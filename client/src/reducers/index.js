// Root reducer
import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import post from './post';

const rootReducer = combineReducers({
	alert,
	auth,
	profile,
	post,
});

export default rootReducer;

// we need two things to create a reducer function
// 1. Shape of the data - {}, [], string
// 2. Action types
