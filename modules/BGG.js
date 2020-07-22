const bgg = require('bgg')
const fetch = require('node-fetch')

// const defaults = {
//     timeout: 5000, // timeout of 10s (5s is the default)

//     // see https://github.com/cujojs/rest/blob/master/docs/interceptors.md#module-rest/interceptor/retry
//     retry: {
//         initial: 100,
//         multiplier: 2,
//         max: 15e3
//     }
// }

class BGG {
    constructor(options) {
        if (typeof options === 'undefined') options = {}

        this.bgg = bgg(options)
    }

    search(query, type, exact) {
        type = type.join(',')
        exact = exact ? 1 : 0

        return this.bgg('search', { query, type, exact })
    }

    bggSearch(query) {
        console.log('starting query for', query)
        const res = fetch('https://boardgamegeek.com/search/boardgame?showcount=5&q=' + encodeURIComponent(query), {
            headers: {
                'Accept': ' application/json, text/plain, */*'
            }
        })
            .then(res => res.json())

        console.log('finished query for', query)

        return res
    }

    game(id) {
        return this.bgg('thing', {
            type: 'boardgame,boardgameexpansion',
            id,
            stats: 1
        }).then((res) => {
            // console.log(JSON.stringify(res))
            return res
        })
    }
}

module.exports = BGG