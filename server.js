const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env

const app = express();
const port = 3000;

// Allow only your front-end origin
app.use(cors({ origin: 'http://127.0.0.1:5500' }));

// Serve static files (css, js, etc.) from the public folder
app.use(express.static('public'));

// Set up EJS as the view engine and define the views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load the modular content mapping from the environment variable
let contentMapping = {};
try {
    // Parse the CONTENT_MAPPING environment variable (defaulting to an empty object)
    contentMapping = JSON.parse(process.env.CONTENT_MAPPING || '{}');
} catch (error) {
    console.error("Error parsing CONTENT_MAPPING:", error);
    process.exit(1); // Exit if the environment variable is not valid JSON
}

// Root route: Render the EJS template with dynamic content and buttons
app.get('/', (req, res) => {
    // Extract all categories from contentMapping
    const categories = Object.keys(contentMapping);

    // Use query parameter "id" to determine the category; default to the first category if available, otherwise "none"
    const category = req.query.id || (categories.length ? categories[0] : 'none');
    let dynamicContent = "";

    if (contentMapping[category] && Array.isArray(contentMapping[category]) && contentMapping[category].length > 0) {
        const randomIndex = Math.floor(Math.random() * contentMapping[category].length);
        dynamicContent = contentMapping[category][randomIndex];
    } else {
        dynamicContent = "No Content Found";
    }

    // Render the index.ejs template and pass the dynamic content and categories array to it
    res.render('index', { dynamicContent, categories });
});

// API endpoint to return a random content item based on the id query parameter
app.get('/API/content', (req, res) => {
    const id = req.query.id;
    if (id && contentMapping[id] && Array.isArray(contentMapping[id]) && contentMapping[id].length > 0) {
        const randomIndex = Math.floor(Math.random() * contentMapping[id].length);

        // Check if an image exists for the content in the public/img folder
        const imgType = ['jpg', 'jpeg', 'png', 'svg', 'webp'];

        for (const type of imgType) {
            if (fs.existsSync(`public/img/${contentMapping[id][randomIndex]}.${type}`)) {
                const imageFileName = `${contentMapping[id][randomIndex]}.${type}`;
                return res.json({ content: contentMapping[id][randomIndex], image: imageFileName });
            }
        }

        return res.json({ content: contentMapping[id][randomIndex] });
    } else {
        res.status(404).json({ error: 'Content not found' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
});
