const mongoose = require('mongoose');

// Define the Item schema
const itemSchema = new mongoose.Schema({
    name: String,
    phone: String,
    item: String,
    status: { type: String, default: 'available' }, // 'available', 'pending', 'sold'
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Create the Item model
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
