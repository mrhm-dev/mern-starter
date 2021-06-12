require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
// Core node.js module to manipulate file paths
const path = require('path');

const app = express();

// Connect DB
connectDB();

// Initialize middleware
// allow public directory to access static files
app.use(express.static('public'));
// allow access to request.body using multipart form
app.use(express.urlencoded({ extended: false }));
// allow access to request.body using body-parser inbuilt to express
app.use(express.json());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/uploads', require('./routes/api/uploads'));
app.use('/api/contacts', require('./routes/api/contacts'));

// Serve static assets in production on remote host
// Check for production:
if (process.env.NODE_ENV === 'production') {
	// Set static (public) folder using express -> index.html in client/build
	app.use(express.static('client/build'));

	// Serve that index.html file within our public folder
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Successfully started server on ${PORT}`));
