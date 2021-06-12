import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	NavLink,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from 'reactstrap';

import { logout } from '../../actions/auth';

const Avatar = ({ user }) => {
	console.log('Avatar', user);
	return (
		<div
			style={{
				width: '40px',
				height: '40px',
				borderRadius: '50%',
				overflow: 'hidden',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<img
				src={user.avatar}
				alt={user.name}
				style={{ width: '100%', height: '100%' }}
			/>
		</div>
	);
};

const TopNavbar = ({ auth: { isAuthenticated, loading, user }, logout }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => setIsOpen(!isOpen);

	const AuthLinks = (
		<Nav
			className='ml-auto'
			navbar
			style={{ display: 'flex', alignItems: 'center' }}
		>
			<NavItem>
				<Link to='/profiles'>
					<NavLink>Users</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/posts'>
					<NavLink>Posts</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/contact'>
					<NavLink>Contact</NavLink>
				</Link>
			</NavItem>
			<UncontrolledDropdown nav inNavbar>
				<DropdownToggle nav>
					<div>{user ? <Avatar user={user} /> : 'Menu'}</div>
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem>
						<Link to='/dashboard' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Dashboard</span>
						</Link>
					</DropdownItem>
					<DropdownItem>
						<Link to='/edit-profile' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Edit Profile</span>
						</Link>
					</DropdownItem>
					<DropdownItem>
						<Link to='/add-experience' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Add Experience</span>
						</Link>
					</DropdownItem>
					<DropdownItem>
						<Link to='/add-education' style={{ color: 'black' }}>
							<i className='fas fa-user'></i>{' '}
							<span className='hide-sm'>Add Education</span>
						</Link>
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem>
						<a
							onClick={logout}
							href='#!'
							style={{ color: 'black' }}
						>
							<i className='fas fa-sign-out-alt'></i>{' '}
							<span className='hide-sm'>Logout</span>
						</a>
					</DropdownItem>
				</DropdownMenu>
			</UncontrolledDropdown>
		</Nav>
	);

	const guestLinks = (
		<Nav className='ml-auto' navbar>
			<NavItem>
				<Link to='/profiles'>
					<NavLink>Users</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/register'>
					<NavLink>Register</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/login'>
					<NavLink>Login</NavLink>
				</Link>
			</NavItem>
			<NavItem>
				<Link to='/contact'>
					<NavLink>Contact</NavLink>
				</Link>
			</NavItem>
		</Nav>
	);

	return (
		<div>
			<Navbar color='dark' dark expand='md'>
				<Link to='/'>
					<NavbarBrand>
						<i className='fas fa-terminal'></i> MERN Auth
					</NavbarBrand>
				</Link>
				<NavbarToggler onClick={toggle} />
				<Collapse isOpen={isOpen} navbar></Collapse>
				{!loading && isAuthenticated ? AuthLinks : guestLinks}
			</Navbar>
		</div>
	);
};

TopNavbar.propTypes = {
	logout: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { logout })(TopNavbar);
