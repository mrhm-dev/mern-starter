const getWelcomeMailTemplate = (user) => {
	return `
        <p>Hello ${user.name}, Welcome to The Network</p>
    `;
};

const getActivationTemplate = (activationToken) => {
	const link = `${process.env.FRONTEND_URL}/users/activate/${activationToken}`;
	return `
        To activate your account please follow the link -
        Link: <a href=${link}>${link}</a>
    `;
};

const getPasswordResetTemplate = (passwordResetToken) => {
	const link = `${process.env.FRONTEND_URL}/password/reset/verify/${passwordResetToken}`;
	return `
        To reset your password please follow the link -
        Link: <a href=${link}>${link}</a>
    `;
};

const getPasswordResetSuccessTemplate = (user) => {
	return `
        <p>Hello ${user.name}, Your password reset successful</p>
    `;
};

const getContactMessageTemplate = (from, msg) => {
	return `
        <p><strong> You have received an email from - ${from} </strong></p>
        <br />
        <p><strong> Message Body </strong></p>
        <p>${msg}</p>
    `;
};

module.exports = {
	getWelcomeMailTemplate,
	getActivationTemplate,
	getPasswordResetTemplate,
	getPasswordResetSuccessTemplate,
	getContactMessageTemplate,
};
