import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardActions = () => {
  return (
    <div className='dash-buttons'>
      <Link
        to='/edit-profile'
        href='edit-profile.html'
        className='btn btn-light custom-light-btn'
      >
        <i className='fas fa-user-circle text-primary'></i> Edit Profile
      </Link>
      <Link
        to='/add-experience'
        href='add-experience.html'
        className='btn btn-light custom-light-btn'
      >
        <i className='fab fa-black-tie text-primary'></i> Add Experience
      </Link>
      <Link
        to='/add-education'
        href='add-education.html'
        className='btn btn-light custom-light-btn'
      >
        <i className='fas fa-graduation-cap text-primary'></i> Add Education
      </Link>
    </div>
  );
};

export default DashboardActions;
