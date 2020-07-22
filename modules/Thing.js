const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

function parseGame(item) {
    const links = {}
    for (let link of item.link) {
        if (!(link.type in links)) links[link.type] = []
        links[link.type].push({ id: link.id, value: link.value })
    }

    return {
        id: item.id,
        name: entities.decode(Array.isArray(item.name) ? item.name.filter(name => name.type === 'primary')[0].value : item.name.value),
        thumbnail: item.thumbnail,
        description: entities.decode(entities.decode(entities.decode(item.description))),
        minimum_players: item.minplayers.value,
        maximum_players: item.maxplayers.value,
        minimum_playtime: item.minplaytime.value,
        maximum_playtime: item.maxplaytime.value,
        game_weight: item.statistics.ratings.averageweight.value,
        links,
        year_published: item.yearpublished.value,
        rating: item.statistics.ratings.average.value
    }
}

class Thing {
    constructor(thing) {
        this.thing = thing
    }

    static async fromId(id, { bgg }) {
        const item = (await bgg.gameMemo(id)).items.item
        return new Thing(item)
    }

    simple() {
        return parseGame(this.thing)
    }
}

module.exports = Thing