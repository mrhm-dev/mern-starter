import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import DashboardActions from './DashboardActions';
import Experience from './Experience';
import Education from './Education';
import ProfilePicture from './ProfilePicture';
import { deleteAccount, getCurrentProfile } from '../../actions/profile';
import emblem from './emblem.png';

/**
 * Fetch all of our data using an action
 * bring it in from redux state
 * pass it down to other components (i.e. experience and education components)
 */

const Dashboard = ({
	getCurrentProfile,
	deleteAccount,
	auth: { user },
	profile: { profile, loading },
}) => {
	useEffect(() => {
		getCurrentProfile();
	}, [getCurrentProfile]);

	return loading && profile === null ? (
		<Spinner />
	) : (
		<Fragment>
			<h1 className='large text-primary'>Dashboard</h1>
			<ProfilePicture user={user} />
			<p className='lead'>
				<i className='fas fa-user'></i> Welcome {user && user.name}
				{profile && profile.isComplete && (
					<img
						style={{
							width: '25px',
							height: 'auto',
							marginLeft: '1rem',
						}}
						src={emblem}
						alt='complete profile'
					/>
				)}
			</p>
			{profile !== null ? (
				<Fragment>
					<DashboardActions />
					<Experience experience={profile.experience} />
					<Education education={profile.education} />

					<div className='my-2'>
						<button
							className='btn btn-danger'
							onClick={() => deleteAccount()}
						>
							<i className='fas fa-user-minus'></i> Delete My
							Account
						</button>
					</div>
				</Fragment>
			) : (
				<Fragment>
					<p>
						You haven't created a profile yet. Let's add some info!
					</p>
					<Link to='/create-profile' className='btn btn-primary my-1'>
						Create Profile
					</Link>
				</Fragment>
			)}
		</Fragment>
	);
};

Dashboard.propTypes = {
	getCurrentProfile: PropTypes.func.isRequired,
	deleteAccount: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	profile: state.profile,
});

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(
	Dashboard
);
