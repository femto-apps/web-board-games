const mongoose = require('mongoose')
const ProgressBar = require('progress')
const BGG = require('bgg')
const _ = require('lodash')

mongoose.connect('mongodb://localhost:27017/board_games', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const pause = time => new Promise(res => setTimeout(res, time))

const Thing = require('../models/Thing')

function fixKey(key) {
    // if (key.startsWith('$')) console.log('invalid key')
    return key[0] === '$' ? key.slice(1) : key
}

function normalise(object) {
    if (_.isPlainObject(object)) {
        // console.log('object', object)

        const safe = {}

        Object.keys(object).map(key => {
            safe[fixKey(key)] = normalise(object[key])
        })

        return safe
    } else if (_.isArray(object)) {
        // console.log('array', object)

        return object.map(item => {
            return normalise(item)
        })
    } else {
        // console.log('unknown', object)

        return object
    }
}

// gets all board games from BGG
function getGames(bgg, ids, count = 0) {
    const joined = ids.join(',')

    return bgg('thing', {
        type: ['boardgame', 'boardgameexpansion'].join(', '),
        videos: 0,
        historical: 0,
        marketplace: 0,
        comments: 0,
        ratingcomments: 0,
        page: 1,
        pagesize: 100,
        id: joined
    }).catch(async e => {
        if (count > 4) {
            console.log('error over 4 times', ids[0], count)
        }

        await pause(1000)
        // console.log('retrying', ids[0], ids[0] + ids.length)
        return getGames(bgg, ids, count + 1)
    })
}

function getRange(bgg, x, y) {
    const items = []

    for (let i = x; i < y; i++) {
        items.push(String(i))
    }

    return getGames(bgg, items)
}

async function saveKeys(data) {
    // console.time('parseItem')
    const things = data.items.item.map(item => {
        if (typeof item.thumbnail !== "string") item.thumbnail = ''
        if (typeof item.image !== "string") item.image = ''
        if (typeof item.description !== "string") item.description = ''

        return normalise(item)
    })
    // console.timeEnd('parseItem')

    // console.time('saveItem')
    try {
        const docs = await Thing.insertMany(things, {
            ordered: false,
            lean: true
        })
    } catch(e) {
        for (let error of e.writeErrors) {
            if (error.err.code !== 11000) {
                throw e
            }
        }
    }
    // console.timeEnd('saveItem')

    // console.time('saveItem')
    // await Promise.all(things.map(async thing => {
    //     try {
    //         await thing.save()
    //     } catch (e) {
    //         if (e.code !== 11000) {
    //             console.log(item)
    //             throw e
    //         } else {
    //             // already saved key.
    //         }
    //     }
    // }))
    // console.timeEnd('saveItem')
}

async function metaGetRange(bgg, min, max) {
    // console.log('grabbing range', min, max)

    const getDataStart = new Date()
    const data = await getRange(bgg, min, max)
    const getDataEnd = new Date()

    const saveDataStart = new Date()
    await saveKeys(data)
    const saveDataEnd = new Date()

    return { getData: getDataEnd - getDataStart, saveData: saveDataEnd - saveDataStart, items: data.items.item.length }
}

const bgg = BGG()

;(async () => {
    const start = 0
    const end = 305200
    const iterator = 500

    const bar = new ProgressBar('  downloading [:bar] :rate/gps :percent :etas :running (get[:get], save[:save], items[:items], time[:elapsed])', {
        complete: '=',
        incomplete: ' ',
        width: 40,
        total: end - start
    })

    for (let i = start; i < end; i += iterator) {

        const startTime = new Date()
        const { getData, saveData, items } = await metaGetRange(bgg, i, i + iterator / 2)
        const { getData2, saveData2, items2 } = await metaGetRange(bgg, i + iterator / 2, i + iterator)
        const runTime = new Date() - startTime

        bar.tick(iterator, { running: i + iterator, get: getData, save: saveData, items })

        if (runTime < 550) {
            await pause(550 - runTime)
        }
    }

    mongoose.disconnect()
})()