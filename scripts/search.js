const mongoose = require('mongoose')

const Thing = require('../models/Thing')

mongoose.connect('mongodb://localhost:27017/board_games', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

;(async() => {
    const find = await Thing.find(
        { $text: { $search: 'Dead of Winter' } },
        { score: { "$meta": "textScore" }})
    .sort({ score: { "$meta": "textScore" }})
    .limit(10).exec()

    Array.from(find).forEach(thing => {
        console.log(thing.name.map(i => i.value))
        // console.log(thing.description.indexOf('Dead of Winter'))
    });
})()
