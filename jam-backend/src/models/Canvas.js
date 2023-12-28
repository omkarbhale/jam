const mongoose = require('mongoose');

const CanvasSchema = mongoose.Schema({
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    img: {
        type: String,
        required: false,
    },
    strokes: {
        type: Array,
        required: true,
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Canvas', CanvasSchema);
