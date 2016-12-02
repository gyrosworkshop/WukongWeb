import {combineReducers} from 'redux'

import user from './user'
import channel from './channel'
import song from './song'
import search from './search'
import misc from './misc'

export default combineReducers({
  user,
  channel,
  song,
  search,
  misc
})
