const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Ensure this is the correct path
const Item = require('./models/item'); // Ensure this is the correct path

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://bhuvan898san:bababoi@cluster0.sywjpwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Registration Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        res.status(500).send('Failed to register');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.send('Login successful');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Failed to login');
    }
});

// Submit Item Route
app.post('/submit', async (req, res) => {
    const { name, phone, item } = req.body;
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const newItem = new Item({
            name,
            phone,
            item,
            sellerId: req.session.userId,
            status: 'available'
        });
        await newItem.save();
        res.status(201).send('Item submitted');
    } catch (err) {
        res.status(500).send('Failed to submit item');
    }
});

// Fetch Items Route
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).send('Error fetching items');
    }
});

// Initiate Purchase Route
app.post('/purchase', async (req, res) => {
    const { itemId, userId } = req.body;
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const item = await Item.findById(itemId);
        if (item && item.status === 'available') {
            item.status = 'pending';
            item.buyerId = userId;
            await item.save();
            res.send('Purchase initiated');
        } else {
            res.status(400).send('Item is not available');
        }
    } catch (err) {
        res.status(500).send('Failed to initiate purchase');
    }
});

// Finalize Deal Route
app.post('/finalize-deal', async (req, res) => {
    const { itemId, decision } = req.body;
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const item = await Item.findById(itemId);
        if (item && item.status === 'pending') {
            if (decision === 'yes') {
                await Item.findByIdAndDelete(itemId);
                res.send('Deal finalized');
            } else {
                item.status = 'available';
                item.buyerId = null;
                await item.save();
                res.send('Deal canceled');
            }
        } else {
            res.status(400).send('Item is not in pending status');
        }
    } catch (err) {
        res.status(500).send('Failed to finalize deal');
    }
});

// Serve Account Page
app.get('/account', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
