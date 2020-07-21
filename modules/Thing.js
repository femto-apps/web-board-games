function parseGame(item) {
    return {
        id: item.id,
        name: Array.isArray(item.name) ? item.name.filter(name => name.type === 'primary')[0].value : item.name.value,
        thumbnail: item.thumbnail,
        description: item.description,
        minimum_players: item.minplayers.value,
        maximum_players: item.maxplayers.value,
        minimum_playtime: item.minplaytime.value,
        maximum_playtime: item.maxplaytime.value
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