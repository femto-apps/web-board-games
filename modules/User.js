const { v4: uuidv4 } = require('uuid')
const memoize = require('memoizee')
const fetch = require('node-fetch')
const config = require('@femto-apps/config')

const UserModel = require('../models/User')

class User {
  constructor(user) {
    this.user = user
  }

  static async fromApiKey(key) {
    const boardgameUser = await UserModel.findOne({ apiKey: key })

    if (!boardgameUser) {
      return undefined
    }

    let user = {
      boardgame: boardgameUser
    }

    return new User(user)
  }

  static async fromUser(genericUser) {
    let user = {
      generic: genericUser,
      boardgame: await UserModel.findOne({ user: genericUser._id })
    }

    if (!user.boardgame) {
      console.log('Updating user model')
      user.boardgame = new UserModel({
        user: genericUser._id,
        apiKey: uuidv4()
      })

      await user.boardgame.save()
    }

    return new User(user)
  }

  static async fromBoardGameId(id) {
    // console.log('checking id', id)
    return User.fromBoardGameUser(await UserModel.findOne({ _id: id }))
  }

  static async fromBoardGameUser(boardgameUser) {
    // console.log('getting user from boardgame', boardgameUser, `${config.get('authenticationProvider.endpoint')}/api/user/id/${encodeURIComponent(boardgameUser.user)}`)
    return fetch(`${config.get('authenticationProvider.endpoint')}/api/user/id/${encodeURIComponent(boardgameUser.user)}`)
      .then(async res => {
        // console.log('got response from api')

        if (res.status !== 200 && res.status !== 404) {    
          console.error(res)
          throw new Error('fromUsername call failed')
        } else if (res.status === 404) {
          return undefined
        }
        // console.log('found user, returning it')

        return User.fromUser(await res.json())
      })
  }

  static fromReq(req) {
    if (req.body && req.body.apiKey && !req.user) {
        return User.fromApiKey(req.body.apiKey)
    }

    return req.user
  }

  getIdentifier() {
    // console.log(this.user)

    if (this.user) {
      return this.user._id || this.user.boardgame.user
    }
  }

  getApiKey() {
    return this.user.boardgame.apiKey
  }

  static fromUsername(username) {
    return fetch(`${config.get('authenticationProvider.endpoint')}/api/user/${encodeURIComponent(username)}`)
      .then(async res => {
        if (res.status !== 200 && res.status !== 404) {    
          console.error(res)
          throw new Error('fromUsername call failed')
        } else if (res.status === 404) {
          return undefined
        }
        return User.fromUser(await res.json())
      })
  }
}

User.fromUserCached = memoize(User.fromUser, {
  promise: true,
  normalizer: args => args[0]._id,
  maxAge: 1000 * 60 * 60,
  preFetch: true,
  primitive: true
})

module.exports = User