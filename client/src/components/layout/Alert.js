import React from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'reactstrap';

const MyAlert = () => {
	const alerts = useSelector((state) => state.alert);

	if (alerts === null || alerts.length === 0) {
		return null;
	}

	return (
		<>
			{alerts.map((alert) => (
				<Alert key={alert.id} color={alert.type}>
					{alert.msg}
				</Alert>
			))}
		</>
	);
};

export default MyAlert;
