import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Spinner from '../layout/Spinner';

const ActivateAccount = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [msg, setMsg] = useState('');
	const { activateToken } = useParams();

	useEffect(() => {
		const url = `/api/users/activate/${activateToken}`;
		axios
			.get(url)
			.then(({ data }) => {
				setError('');
				setMsg(data.msg);
				setIsLoading(false);
			})
			.catch(({ data }) => {
				setError(data.error);
				setMsg(data.msg);
				setIsLoading(false);
			});
	}, []);

	return (
		<>
			<div className='mid-container'>
				{isLoading && <Spinner />}
				{msg && <h1>{msg}</h1>}
				{error && <h2>{error}</h2>}
			</div>
		</>
	);
};

export default ActivateAccount;
