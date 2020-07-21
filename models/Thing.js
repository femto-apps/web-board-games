const mongoose = require('mongoose')

const ThingSchema = new mongoose.Schema({
    type: String,
    id: { type: Number, unique: true },
    thumbnail: String,
    image: String,
    name: [{ type: { type: String }, sortIndex: Number, value: String }],
    description: String,
    yearpublished: { value: Number },
    minplayers: { value: Number },
    maxplayers: { value: Number },
    playingtime: { value: Number },
    minplayingtime: { value: Number },
    maxplayingtime: { value: Number },
    minage: { value: Number },
    link: [{ type: { type: String }, id: Number, value: String }]
}, {
    strict: false
})

ThingSchema.index({
    'name.value': 'text',
    'description': 'text'
}, {
    weights: {
        'name.value': 1000,
        'description': 10
    }
})

const Thing = mongoose.model('Thing', ThingSchema)

module.exports = Thing