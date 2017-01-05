import {combineReducers} from 'redux'
import {pick, shuffle, unary, partialRight} from 'lodash'

import Action from '../action'

function playlist(state = [], action) {
  const normalize = unary(partialRight(pick, [
    'id', 'siteId', 'songId',
    'title', 'album', 'artist', 'artwork',
    'url', 'mvUrl'
  ]))
  switch (action.type) {
    case Action.Song.prepend.type:
      return [
        normalize(action.song),
        ...state.filter(song => song.id != action.song.id)
      ]
    case Action.Song.append.type:
      return [
        ...state.filter(song => song.id != action.song.id),
        normalize(action.song)
      ]
    case Action.Song.remove.type:
      return [
        ...state.filter(song => song.id != action.song.id)
      ]
    case Action.Song.move.type: {
      const newState = state.slice()
      const item = newState.splice(action.from, 1).pop()
      newState.splice(action.to, 0, item)
      return newState
    }
    case Action.Song.assign.type:
      return [...action.songs.map(normalize)]
    case Action.Song.shuffle.type:
      return shuffle(state)
    default:
      return state
  }
}

function playing(state = {}, action) {
  switch (action.type) {
    case Action.Song.play.type:
      return {...action.song}
    default:
      return state
  }
}

function preload(state = {}, action) {
  switch (action.type) {
    case Action.Song.preload.type:
      return {...action.song}
    default:
      return state
  }
}

export default combineReducers({
  playlist,
  playing,
  preload
})
