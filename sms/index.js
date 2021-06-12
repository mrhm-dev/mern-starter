const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

/**
 * This function will send sms from twilio number to given number
 * @param {string} to where we want to send message
 * @param {string} body what we want to send
 * @returns
 */
module.exports = (to, body) => {
	return client.messages.create({
		body,
		from: process.env.TWILIO_PHONE_NUMBER,
		to,
	});
};
