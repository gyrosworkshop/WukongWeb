import {combineReducers} from 'redux'

import Action from '../action'

function running(state = false, action) {
  switch (action.type) {
    case Action.Player.running.type:
      return action.running
    default:
      return state
  }
}

function elapsed(state = 0, action) {
  switch (action.type) {
    case Action.Player.elapsed.type:
      return action.elapsed
    default:
      return state
  }
}

function duration(state = 0, action) {
  switch (action.type) {
    case Action.Player.duration.type:
      return action.duration
    default:
      return state
  }
}

function ended(state = false, action) {
  switch (action.type) {
    case Action.Player.ended.type:
      return true
    case Action.Player.reset.type:
      return false
    default:
      return state
  }
}

function downvote(state = false, action) {
  switch (action.type) {
    case Action.Player.downvote.type:
      return true
    case Action.Player.reset.type:
      return action.state.downvote
    default:
      return state
  }
}

function volume(state = 0.5, action) {
  switch (action.type) {
    case Action.Player.volume.type:
      return action.volume
    default:
      return state
  }
}

function reload(state = false, action) {
  switch (action.type) {
    case Action.Player.reload.type:
      return action.reload
    default:
      return state
  }
}

export default combineReducers({
  running,
  elapsed,
  duration,
  ended,
  downvote,
  volume,
  reload
})
