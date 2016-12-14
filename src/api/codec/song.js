import * as quality from './quality'

export function encode(object = {}) {
  return {
    siteId: object.siteId,
    songId: object.songId
  }
}

export function decode(object = {}) {
  const parseFile = file => {
    if (!file) return
    if (!file.file) return
    return [
      file.file,
      file.fileViaCdn || file.file,
      file.quality,
      file.format,
      file.audioBitrate
    ]
  }
  const parseLyrics = lyrics => {
    if (!lyrics) return
    const lrcItems = lyrics
      .filter(item => item.withTimeline)
      .sort((item1, item2) => item1.translate - item2.translate)
    if (!lrcItems.length) return
    const lrcText = (lrcItems[0].lyric || '').split(/[\n\r]/).join(' ')
    if (!lrcText.length) return
    const metadata = {}
    const lines = []
    for (let string = lrcText; string;) {
      const times = []
      for (let match; (match = string.match(/^\s*\[(.*?):(.*?)]/));) {
        const data = match.slice(1, 3)
        if (isNaN(parseInt(data[0])) || isNaN(parseFloat(data[1]))) {
          metadata[data[0]] = data[1]
        } else {
          times.push(parseInt(data[0]) * 60 + parseFloat(data[1]))
        }
        string = string.substr(match[0].length)
      }
      const match = string.match(/^(\s*(.*?)\s*)(\[.*?:.*?]|$)/)
      const text = match[2]
      times.forEach(time => lines.push({time, text}))
      string = string.substr(match[1].length)
    }
    if (metadata.offset) {
      const offset = parseFloat(metadata.offset) / 1000
      lines.forEach(line => line.time += offset)
    }
    lines.sort((line1, line2) => line1.time - line2.time)
    return lines
  }
  const files = object.musics && object.musics
    .map(it => Object.assign(it, {quality: quality.decode(it.audioQuality)}))
    .sort((a, b) => b.quality - a.quality)
    .map(parseFile)

  return {
    id: `${object.siteId}.${object.songId}`,
    siteId: object.siteId,
    songId: object.songId,
    title: object.title,
    album: object.album,
    artist: object.artist,
    artwork: parseFile(object.artwork),
    length: object.length,
    url: object.webUrl,
    files,
    mvUrl: object.mvWebUrl,
    mvFile: parseFile(object.mv),
    lyrics: parseLyrics(object.lyrics)
  }
}
