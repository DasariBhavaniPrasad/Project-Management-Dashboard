const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Project', projectSchema);
