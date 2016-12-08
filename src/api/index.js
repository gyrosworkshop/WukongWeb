import 'whatwg-fetch'

import {isEqual} from 'lodash'

import Action from '../action'
import Codec from './codec'

export default function API() {
  return ({getState, dispatch}) => (next) => {
    const api = (() => {
      const app = `${location.protocol}//${location.host}`
      const server = __env.production ? app : (
        __env.server || 'http://localhost:5000'
      )
      const http = async (method, endpoint, data) => {
        const response = await fetch(server + endpoint, {
          method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
          mode: __env.production ? 'same-origin' : 'cors',
          credentials: __env.production ? 'same-origin' : 'include',
          cache: 'default',
          redirect: 'manual',
          referrer: 'no-referrer'
        })
        if (response.ok) {
          const data = await response.text()
          if (data) {
            return JSON.parse(data)
          }
        } else if (response.status == 401) {
          location.href = `${server}/oauth/google?redirectUri=${
            encodeURIComponent(app)
          }`
        } else {
          throw new Error(`${response.statusText}: ${method} ${endpoint}`)
        }
      }
      const websocket = (endpoint, handler) => {
        const socket = new WebSocket(server.replace(/^http/i, 'ws') + endpoint)
        const emit = handler({
          connect() {
            websocket(endpoint, handler)
          },
          send(data) {
            socket.send(JSON.stringify(data))
          }
        })
        socket.onopen = event => emit('open', event)
        socket.onclose = event => emit('close', event)
        socket.onerror = event => emit('error', event)
        socket.onmessage = event => {
          if (event.data) {
            const {eventName, ...eventData} = JSON.parse(event.data)
            emit(eventName, eventData)
          }
        }
      }
      return {http, websocket}
    })()

    const fetchUser = async () => {
      const user = await api.http('GET', '/api/user/userinfo')
      next(Action.User.profile.create(
        Codec.User.decode(user)
      ))
    }
    const fetchPlaylist = async () => {
      const state = getState()
      const sync = state.user.sync
      if (!sync) return
      const urls = sync.split('\n').filter(line => line)
      if (!urls.length) return
      const lists = await Promise.all(urls.map(url =>
        api.http('POST', '/provider/songListWithUrl', {
          url,
          withCookie: state.user.cookie
        })
      ))
      const songs = [].concat(...lists.map(list => list.songs || []))
      next(Action.Song.assign.create(
        songs.map(Codec.Song.decode)
      ))
    }
    const sendChannel = async prevState => {
      const state = getState()
      const channel = state.user.channel
      if (!channel) return
      const prevChannel = prevState && prevState.user.channel
      if (channel == prevChannel) return
      await api.http('POST', `/api/channel/join/${channel}`)
    }
    const sendUpnext = async prevState => {
      const state = getState()
      const channel = state.user.channel
      if (!channel) return
      const song = Codec.Song.encode(
        state.user.listenOnly ? undefined : state.song.playlist[0]
      )
      const prevSong = Codec.Song.encode(prevState && (
        prevState.user.listenOnly ? undefined : prevState.song.playlist[0]
      ))
      if (prevState && isEqual(song, prevSong)) return
      await api.http('POST', `/api/channel/updateNextSong/${channel}`, {
        ...song,
        withCookie: state.user.cookie
      })
    }
    const sendSync = async () => {
      const state = getState()
      const channel = state.user.channel
      if (!channel) return
      const song = Codec.Song.encode(state.song.playing)
      await api.http('POST', `/api/channel/finished/${channel}`,
        song.songId ? song : null
      )
    }
    const sendDownvote = async () => {
      const state = getState()
      const channel = state.user.channel
      if (!channel) return
      const song = Codec.Song.encode(state.song.playing)
      await api.http('POST', `/api/channel/downVote/${channel}`,
        song.songId ? song : null
      )
    }
    const sendSearch = async () => {
      const state = getState()
      const keyword = state.search.keyword
      if (keyword) {
        const results = await api.http('POST', '/provider/searchSongs', {
          key: keyword,
          withCookie: state.user.cookie
        })
        next(Action.Search.results.create(
          results.map(Codec.Song.decode)
        ))
      } else {
        next(Action.Search.results.create([]))
      }
    }
    const notifyError = (error, action, callback) => {
      next(Action.Misc.notification.create({
        message: error.toString(),
        action,
        callback
      }))
    }
    const reloadApp = () => {
      location.reload(true)
    }

    (async () => {
      try {
        await fetchUser()
        await sendChannel()
      } catch (error) {
        notifyError(error, 'Reload', reloadApp)
        return
      }
      api.websocket('/api/ws', ({connect, send}) => async (event, data) => {
        try {
          switch (event) {
            case 'open':
              await sendUpnext()
              break
            case 'close':
              await sendChannel()
              setTimeout(connect, 5000)
              break
            case 'error':
              notifyError('Connection lost. Reconnecting...')
              break
            case 'UserListUpdated':
              next(Action.Channel.status.create({
                members: data.users.map(Codec.User.decode)
              }))
              break
            case 'Play':
              next(Action.Song.play.create(data.song && {
                ...Codec.Song.decode(data.song),
                player: data.user || '',
                time: (Date.now() / 1000) - (data.elapsed || 0)
              }))
              if (data.downvote) {
                next(Action.Song.downvote.create())
              }
              break
            case 'NextSongUpdate':
              next(Action.Song.preload.create(data.song && {
                ...Codec.Song.decode(data.song)
              }))
              break
          }
        } catch (error) {
          notifyError(error)
        }
      })
    })()

    return async action => {
      const prevState = getState()
      next(action)
      try {
        switch (action.type) {
          case Action.User.profile.type:
            await sendChannel(prevState)
            await sendUpnext()
            break
          case Action.User.sync.type:
            await fetchPlaylist()
            await sendUpnext()
            break
          case Action.Song.prepend.type:
          case Action.Song.append.type:
          case Action.Song.remove.type:
          case Action.Song.move.type:
          case Action.Song.assign.type:
          case Action.Song.shuffle.type:
            await sendUpnext(prevState)
            break
          case Action.Song.ended.type:
            await sendSync()
            break
          case Action.Song.downvote.type:
            await sendDownvote()
            break
          case Action.Search.keyword.type:
            await sendSearch()
            break
        }
      } catch (error) {
        notifyError(error)
      }
    }
  }
}
