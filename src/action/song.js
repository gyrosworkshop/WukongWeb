export const prepend = {
  type: 'SongPrepend',
  create(song) { return {type: this.type, song} }
}

export const append = {
  type: 'SongAppend',
  create(song) { return {type: this.type, song} }
}

export const remove = {
  type: 'SongRemove',
  create(song) { return {type: this.type, song} }
}

export const play = {
  type: 'SongPlay',
  create(song) { return {type: this.type, song} }
}

export const preload = {
  type: 'SongPreload',
  create(song) { return {type: this.type, song} }
}

export const elapsed = {
  type: 'SongElapsed',
  create(elapsed) { return {type: this.type, elapsed} }
}

export const ended = {
  type: 'SongEnded',
  create() { return {type: this.type} }
}

export const downvote = {
  type: 'SongDownvote',
  create() { return {type: this.type} }
}
