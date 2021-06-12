import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import ActivateAccount from './components/auth/Activate';
import ForgetPasswordRequest from './components/auth/ForgetPasswordReq';
import ForgetPasswordReset from './components/auth/ForgetPasswordReset';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import AddExperience from './components/profile-forms/AddExperience';
import AddEducation from './components/profile-forms/AddEducation';
import Profiles from './components/profiles/Profiles';
import Profile from './components/profile/Profile';
import Posts from './components/posts/Posts';
import Post from './components/post/Post';
import Contact from './components/contact';
import PrivateRoute from './components/routing/PrivateRoute';
// Combine Redux with React
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

import './App.css';

if (localStorage.token) {
	setAuthToken(localStorage.token);
}

function App() {
	// Second param of empty brackets acts as a component did mount and prevents from constantly running
	useEffect(() => {
		store.dispatch(loadUser());
	}, []);

	return (
		<Provider store={store}>
			<Router>
				<Fragment>
					<Navbar />
					<Route exact path='/' component={Landing} />
					<section className='container'>
						<Alert />
						<Switch>
							<Route
								exact
								path='/register'
								component={Register}
							/>
							<Route exact path='/login' component={Login} />
							<Route
								exact
								path='/users/activate/:activateToken'
								component={ActivateAccount}
							/>
							<Route
								exact
								path='/password/reset/request'
								component={ForgetPasswordRequest}
							/>
							<Route
								exact
								path='/password/reset/verify/:passwordResetToken'
								component={ForgetPasswordReset}
							/>
							<Route
								exact
								path='/profiles'
								component={Profiles}
							/>
							<Route
								exact
								path='/profile/:id'
								component={Profile}
							/>
							<Route exact path='/contact' component={Contact} />
							<PrivateRoute
								exact
								path='/dashboard'
								component={Dashboard}
							/>
							<PrivateRoute
								exact
								path='/create-profile'
								component={CreateProfile}
							/>
							<PrivateRoute
								exact
								path='/edit-profile'
								component={EditProfile}
							/>
							<PrivateRoute
								exact
								path='/add-experience'
								component={AddExperience}
							/>
							<PrivateRoute
								exact
								path='/add-education'
								component={AddEducation}
							/>
							<PrivateRoute
								exact
								path='/posts'
								component={Posts}
							/>
							<PrivateRoute
								exact
								path='/posts/:id'
								component={Post}
							/>
						</Switch>
					</section>
				</Fragment>
			</Router>
		</Provider>
	);
}

export default App;
