const mongoose = require('../../database');
const bcrypt = require('bcryptjs');
mongoose.set('useFindAndModify', false);

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        require: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    completed: {
        type: Boolean,
        require: true,
        default: false,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tasks',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});



const Tasks = mongoose.model('Tasks', TaskSchema);

module.exports = Tasks;