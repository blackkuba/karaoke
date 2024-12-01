const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
require('dotenv').config(); 
const haslo = process.env.haslo;
const mongoose = require('mongoose');
const port=6969;
const path = require('path');

mongoose.connect(haslo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB!")).catch((err) => console.error('MongoDB connection error: ', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required:true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'rejestracja.html'));
});

app.get('/rejestracja.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'rejestracja.html'));
});

app.get('/main.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'playlisty.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// Handle server errors
app.on('error', (error) => {
    console.error('Server error: ', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    app.close(() => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    app.close(() => {
        process.exit(0);
    });
});

// Handle error 404
app.use((req, res, next) => {
    res.status(404).send('Route to the page was not found.');
});

// Handle error 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (!res.headersSent) {
        res.status(500).send('Something went wrong!');
    }
});

// POST route for handling form submission
app.post('/register', async (req, res) => {
    const { mail, haslo} = req.body;

    // Validate the input
    if (!mail || !haslo) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ mail });
        if (existingUser) {
            return res.status(400).send('User already exists.');
        }

        // Hash the password (use a valid salt round, e.g., 10)
        const hashedPassword = await bcrypt.hash(haslo, 10);

        // Save the user to the database
        const newUser = new User({ mail, haslo: hashedPassword });
        await newUser.save();

        // Send a success response
        res.status(201).send('User registered successfully!');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Internal server error');
    }
});