const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const RedisStore = require('connect-redis')(session)
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const config = require('@femto-apps/config')
const pLimit = require('p-limit')
const memoize = require('memoizee')
const redis = require('redis')
const Entities = require('html-entities').AllHtmlEntities
const _ = require('lodash')
const flash = require('connect-flash')
const flat = require('array-flat-polyfill')
const authenticationConsumer = require('@femto-apps/authentication-consumer')

const Thing = require('./modules/Thing')
const User = require('./modules/User')
const bgg = new (require('./modules/BGG'))()
bgg.gameMemo = memoize(bgg.game)

const entities = new Entities()

function parseGame(game) {
    return {
        id: game.items.item.id,
        name: Array.isArray(game.items.item.name) ? game.items.item.name.filter(name => name.type === 'primary')[0].value : game.items.item.name.value,
        thumbnail: game.items.item.thumbnail,
        description: game.items.item.description
    }
}

async function searchAndEnrich(query) {
    const result = await bgg.search(query, ['boardgame'])

    if (result.items.total === 0) {
        return { results: [] }
    }

    const limit = pLimit(5)

    let searchResults = []
    if (!Array.isArray(result.items.item)) {
        searchResults = [await bgg.gameMemo(result.items.item.id)]
    } else {
        searchResults = await Promise.all(result.items.item.slice(0, 5)
            .map(i => i.id)
            .map(id => limit(() => bgg.gameMemo(id))))
    }

    const basicInfo = searchResults.map(parseGame)

    return { results: basicInfo }
}

;(async () => {
    const app = express()
    const port = config.get('port')

    mongoose.connect(config.get('mongo.uri') + config.get('mongo.db'), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    mongoose.set('useCreateIndex', true)

    app.set('view engine', 'pug')

    app.use(express.static('public'))
    app.use(morgan('dev'))
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(cookieParser(config.get('cookie.secret')))
    app.use(session({
        store: new RedisStore({
            client: redis.createClient({
                host: config.get('redis.host'),
                port: config.get('redis.port')
            })
        }),
        secret: config.get('session.secret'),
        resave: false,
        saveUninitialized: false,
        name: config.get('cookie.name'),
        cookie: {
            maxAge: config.get('cookie.maxAge')
        }
    }))
    app.use(flash())

    app.use(authenticationConsumer({
        tokenService: { endpoint: config.get('tokenService.endpoint') },
        authenticationProvider: { endpoint: config.get('authenticationProvider.endpoint'), consumerId: config.get('authenticationProvider.consumerId') },
        authenticationConsumer: { endpoint: config.get('authenticationConsumer.endpoint') },
        redirect: config.get('redirect')
    }))

    app.use(async (req, res, next) => {
        req.ip = (req.headers['x-forwarded-for'] || '').split(',').pop() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress

        if (req.user) {
            req.user = await User.fromUserCached(req.user)
        }

        if (req.body && req.body.apiKey && !req.user) {
            req.user = await User.fromApiKey(req.body.apiKey)
        }

        next()
    })

    app.use((req, res, next) => {
        const links = []

        if (req.user) {
            links.push({ title: 'Logout', href: res.locals.auth.getLogout(`${req.protocol}://${req.get('host')}${req.originalUrl}`) })

            res.locals.user = req.user
        } else {
            links.push({ title: 'Login', href: res.locals.auth.getLogin(`${req.protocol}://${req.get('host')}${req.originalUrl}`) })
        }

        res.locals.nav = {
            title: config.get('title.suffix'),
            links
        }

        res.locals._ = _
        res.locals.entities = entities

        next()
    })

    app.get('/', (req, res) => {
        console.log(req.user)
        res.render('home', {
            page: { title: `Home :: ${config.get('title.suffix')}` },
            login: res.locals.auth.getLogin(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
        })
    })

    app.get('/user', (req, res) => {
        if (req.user) return res.json(req.user)

        return res.json({
            anonymous: true
        })
    })

    app.get('/manage', async (req, res) => {
        if (!req.user) {
            return res.redirect(res.locals.auth.getLogin(`${req.protocol}://${req.get('host')}${req.originalUrl}`))
        }

        const things = await Promise.all(
            req.user.user.boardgame.things.map(
                async thing => Thing.fromId(thing, { bgg })
            )
        )

        res.render('manage', {
            page: { title: `Manage :: ${config.get('title.suffix')}` },
            things: things.map(item => item.simple())
        })
    })

    app.get('/manage/search', async (req, res) => {
        const { results } = await searchAndEnrich(req.query.query)

        res.render('search', {
            page: { title: `Search :: ${config.get('title.suffix')}` },
            query: req.query.query,
            results
        })
    })

    app.post('/manage/add', async (req, res) => {
        const game = req.body.game

        req.user.user.boardgame.things.push(game)
        await req.user.user.boardgame.save()

        res.redirect('/manage')
    })

    app.post('/manage/remove', async (req, res) => {
        const game = req.body.game

        const index = req.user.user.boardgame.things.indexOf(game)
        req.user.user.boardgame.things.splice(index, 1)
        await req.user.user.boardgame.save()

        res.redirect('/manage')
    })

    app.get('/friends', async (req, res) => {
        const friends = await Promise.all(req.user.user.boardgame.friends.map(id => User.fromBoardGameId(id)))

        res.render('friends', {
            page: { title: `Friends :: ${config.get('title.suffix')}` },
            errors: req.flash('error'),
            friends,
        })
    })

    app.post('/friends/add', async (req, res) => {
        const user = await User.fromUsername(req.body.user)

        if (!user) {
            req.flash('error', 'No User Found')
            return res.redirect('/friends')
        }

        if (req.user.user.boardgame.friends.includes(user.user.boardgame._id)) {
            req.flash('error', 'Already a friend')
            return res.redirect('/friends')
        }

        req.user.user.boardgame.friends.push(user.user.boardgame._id)
        await req.user.user.boardgame.save()

        return res.redirect('/friends')
    })

    app.post('/friends/remove', async (req, res) => {
        const user = req.body.friend

        const index = req.user.user.boardgame.friends.indexOf(user)
        req.user.user.boardgame.friends.splice(index, 1)
        await req.user.user.boardgame.save()

        res.redirect('/friends')
    })

    app.get('/play', async (req, res) => {
        const friends = await Promise.all(req.user.user.boardgame.friends.map(id => User.fromBoardGameId(id)))

        let games = undefined

        if (req.query.player_count && req.query.players && req.query.minimum_playing_time && req.query.maximum_playing_time) {
            if (typeof req.query.players === 'string') req.query.players = [req.query.players]

            // calculate game options
            const players = await Promise.all(req.query.players.map(player => User.fromBoardGameId(player)))
            const things = await Promise.all([...new Set(players.map(player => player.user.boardgame.things).flat())].map(game => Thing.fromId(game, { bgg })))

            const playable_games = things.filter(thing => {
                if (thing.thing.minplaytime.value < Number(req.query.minimum_playing_time)) return false
                if (thing.thing.maxplaytime.value > Number(req.query.maximum_playing_time)) return false
                if (thing.thing.minplayers.value > Number(req.query.player_count)) return false
                if (thing.thing.maxplayers.value < Number(req.query.player_count)) return false

                return true
            })

            games = playable_games.map(game => game.simple())
        }

        res.render('play', {
            page: { title: `Play :: ${config.get('title.suffix')}` },
            friends,
            games,
            query: req.query
        })
    })
    
    app.listen(port, () => console.log(`Board games app listening on port ${port}`))
})()
