// server.js

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const path = require('path'); // Path module for handling file paths
const fs = require('fs'); // File system module for reading and writing files
const bodyParser = require('body-parser'); // Body-parser to handle request bodies

const app = express(); // Create an Express application

const PORT = 3000; // Define the port the server will listen on. You can change this.
const USERS_FILE = path.join(__dirname, 'users.json'); // Path to our users.json file

// --- Middleware ---

// Serve static files from the 'public' directory
// This makes your HTML, CSS, JS, and image files accessible to clients
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser middleware to parse URL-encoded and JSON request bodies
// This is necessary to get data from POST requests
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json


// --- Helper Functions ---

// Function to read user data from users.json file
function readUsersFromFile() {
    try {
        const rawData = fs.readFileSync(USERS_FILE); // Read data from file
        return JSON.parse(rawData); // Parse JSON string to JavaScript object (array)
    } catch (error) {
        // If the file doesn't exist or there's a reading error, return an empty array
        if (error.code === 'ENOENT') { // Error code 'ENOENT' means file not found
            return [];
        }
        console.error("Error reading users.json:", error);
        return []; // Return empty array in case of other errors as well
    }
}

// Function to write user data to users.json file
function writeUsersToFile(users) {
    try {
        const jsonData = JSON.stringify(users, null, 2); // Convert JavaScript object to JSON string (pretty-printed with 2 spaces)
        fs.writeFileSync(USERS_FILE, jsonData); // Write JSON string to file
    } catch (error) {
        console.error("Error writing to users.json:", error);
    }
}


// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with a 400 error if email or password is missing
    }

    const users = readUsersFromFile(); // Read existing users from file

    // Check if user with this email already exists (for simplicity, we are not handling duplicate emails in this basic example)
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).send('Email already registered.'); // 409 Conflict status if email is already registered
    }

    const newUser = {
        email: email,
        password: password, // **IMPORTANT: In a real application, DO NOT store passwords in plain text. Use hashing!**
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    users.push(newUser); // Add the new user to the array
    writeUsersToFile(users); // Write the updated users array back to the file

    console.log(`New user signed up: ${email}`); // Log signup event on the server-side
    res.send('Signup successful!'); // Send a success message back to the client (browser)
});


// --- Login Endpoint ---
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with 400 error if missing credentials
    }

    const users = readUsersFromFile(); // Read users from file

    // Find a user in the users array that matches the provided email and password
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        console.log(`User logged in: ${email}`); // Log login event on the server
        res.send('Login successful!'); // Send success message
    } else {
        console.log(`Login failed for email: ${email}`); // Log failed login attempt
        res.status(401).send('Invalid credentials.'); // 401 Unauthorized status for invalid login
    }
});


// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`); // Log message when server starts
});
