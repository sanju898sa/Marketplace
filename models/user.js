const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create the user model
const User = mongoose.model('User', userSchema);

module.exports = User;
