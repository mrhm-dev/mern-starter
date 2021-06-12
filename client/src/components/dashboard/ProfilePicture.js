import React, { useState } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { connect } from 'react-redux';
import { uploadProfilePicture } from '../../actions/profile';

const ProfilePicture = ({ user, uploadProfilePicture }) => {
	const [file, setFile] = useState(null);
	const [previewURL, setPreviewURL] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Uploading');
		if (file) {
			const data = new FormData();
			data.append('avatar', file);
			uploadProfilePicture(data, () => {
				setFile(null);
				setPreviewURL('');
			});
		}
	};

	return (
		<div style={{ margin: '2rem 0' }}>
			<div
				style={{
					width: '200px',
					height: '200px',
					border: '5px solid #424242',
					borderRadius: '50%',
					overflow: 'hidden',
				}}
			>
				{user && (
					<img
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
						src={previewURL ? previewURL : user.avatar}
						alt={`${user.name} avatar`}
					/>
				)}
				<br />
			</div>
			<Form
				style={{ marginTop: '1rem', marginLeft: '2rem' }}
				onSubmit={handleSubmit}
			>
				<FormGroup>
					<Input
						type='file'
						name='file'
						id='exampleFile'
						onChange={(e) => {
							if (e.target.files[0]) {
								setFile(e.target.files[0]);
								setPreviewURL(
									URL.createObjectURL(e.target.files[0])
								);
							}
						}}
					/>
				</FormGroup>
				{file && <Button type='submit'>Upload</Button>}
			</Form>
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.auth.user,
});

export default connect(mapStateToProps, { uploadProfilePicture })(
	ProfilePicture
);
