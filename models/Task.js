const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Task', taskSchema);
