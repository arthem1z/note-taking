const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    Text:{
        type: String
    },
    DateCreated:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', NoteSchema);