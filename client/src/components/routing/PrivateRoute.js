/**
 * Create private routes
 * using a render prop to check for authentication
 */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ component: Component, ...rest }) => {
	const { isAuthenticated, loading } = useSelector((state) => state.auth);

	if (!isAuthenticated && !loading) {
		return <Redirect to='/login' />;
	}

	return <Route {...rest} component={Component} />;
};

export default PrivateRoute;
