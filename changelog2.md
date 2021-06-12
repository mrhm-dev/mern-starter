# Change Log 2

## Add Twilio Welcome Message

**Problem:** The only thing required now is a Twilio welcome sms which requires a twilio account (if you could just make a fresh one to use while implementing to pass the details over after). This account will be used to implement a very simple text upon registration 'welcome' based on the inputted phone number in the registration form. I believe most of the code they also provide in the getting started docs, requiring some tweaks.

**Solution:** To implement welcome message using twilio we need to configure our user model to accept phone number. We also need additional phone number field to our frontend application. We will send welcome sms when users get verified by email verification. We need twilio client to do that.



### Code Changes Backend

```js
// models/User.js

const UserSchema = new mongoose.Schema({
	// ...rest of the codes
	phone: {
		type: String,
	},
	password: {
		type: String,
	},
	// ...rest of the codes
});
```

```.env
// .env
...rest of the codes

TWILIO_ACCOUNT_SID=AC8215ec50ae99ef4e9d92519bfc96b6b7
TWILIO_AUTH_TOKEN=e42c891abe2c993bf31bb8860bd84168
TWILIO_PHONE_NUMBER='+12138103935'
```

```js
// sms/index.js

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
```

```js
// routes/api/users.js

const sendSMS = require('../../sms');

router.post('/', 
	[
    	..., 
    	check('phone', 'Please provide a valid phone number').isMobilePhone(),
    ],
    async (req, res) => {
        // ... rest of the code will remain same, just update few of the lines
        
        // Destructure req.body (name, email, password)
		const { name, email, phone, password } = req.body;
        
        // Create an instance of a user (still need to call save() after encrypting pass)
			user = new User({
				name,
				email,
				phone,
				avatar,
				password,
			});
    }
)


router.get('/activate/:activationToken', async (req, res) => {
    // if user found and activation token match then go for next step other wise return 400
		if (user && user.activationToken === activationToken) {
			if (user.isActive) {
				// some code
			} else {
				// ...rest of the codes

				// Send Welcome SMS
				if (user.phone) {
					sendSMS(user.phone, 'Welcome to XYZ')
						.then((message) => console.log(message))
						.catch((error) => console.log(`Twilio Error`, error));
				}

				res.status(200).json({
					msg: 'Activation Success',
				});
			}
		}
})
```



### Frontend Changes

```js
// client/src/components/auth/Register

const Register = ({}) => {
    // all the remain code will be same, just update few lines of code
    
    // update state to accept phone
    const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		password2: '',
	});
    
    // destructure phone from formData
    const { name, email, phone, password, password2 } = formData;
	
    // update onSubmit function else block to pass phone data
    register({ name, email, password, phone });
    
    // On JSX add a new field for phone
    return (
    	/* Rest of the code will remain same */
        <form className='form' onSubmit={(e) => onSubmit(e)}>	
                <div className='form-group'>
                    <input
                        type='text'
                        placeholder='Phone Number'
                        value={phone}
                        onChange={(e) => onChange(e)}
                        name='phone'
                        />
                    <small className='form-text'>
                        Only US Phone Number with Exact Country Code
                    </small>
       	 		</div>
        </form>
    )
}
```

**Note:** Update `register` action from your `actions/auth.js` file to destructure phone from parameters and also include phone to body. 



## Contact Form

**Problem:** Then the only other thing is the very simple contact page which sends a message with subject to the site admin; I can specify this email in the code later as well.

**Solution:** This is totally a new features, so we have to create some file and write some fresh code. But we also need to modify some of our existing codes for example - 

-   In `server.js` file we have add a new route for contact
-   In client `app.js` file we also have to add client side routing for contact
-   and also update `Navbar` component to add contact link to the navbar

Finally I have created a component called in frontend component directory called `contact/index.js` that is contain our React component to show the contact form. 

I also have created a new model called Contact in models directory that will share our contact structure and store messages to database.

Lastly I have created a new route inside `routes/api` called `contacts.js` where I have created to route. One route will accept messages from client and other will list all the messages.



I have also update the `.env` file as follows - 

```.env
TWILIO_ACCOUNT_SID=AC8215ec50ae99ef4e9d92519bfc96b6b7
TWILIO_AUTH_TOKEN=e42c891abe2c993bf31bb8860bd84168
TWILIO_PHONE_NUMBER='+12138103935'
ADMIN_EMAIL=hmnayem@stacklearner.com
```



