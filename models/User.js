const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId },
    apiKey: { type: String },
    things: [Number],
    friends: [{ type: mongoose.Schema.Types.ObjectId }]
}, {
    timestamps: true,
    strict: false
})

module.exports = mongoose.model('User', UserSchema)
