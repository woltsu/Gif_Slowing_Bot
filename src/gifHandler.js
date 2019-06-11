// Imports
const fs = require('fs')
const path = require('path')
const axios = require('axios').default

// Constants
const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'

const download = async (url, dir) => {
  console.log('downloading ' + url + '...')
  const resultName = generateName()
  const formattedUrl = await getGifData(url)

  const resultPath = path.resolve(dir, `${resultName}.mp4`)
  const writer = fs.createWriteStream(resultPath)

  const fileStream = await axios({
    url: formattedUrl,
    method: 'GET',
    responseType: 'stream'
  })
  fileStream.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log('downloaded ' + url + '!')
      resolve(resultName)
    })
    writer.on('error', reject)
  })
}

const getGifData = async (url) => {
  if (url.includes('imgur')) {
    const urlParts = url.split('.')
    urlParts.splice(urlParts.length - 1, 1, 'mp4')
    return urlParts.join('.')
  } else if (url.includes('gfycat')) {
    const urlParts = url.split('/')
    return await getGfycatUrl(urlParts[urlParts.length - 1])
  } else {
    // TODO: Reddit hosted gifs / videos
    return null
  }
}

const getGfycatUrl = async (id) => {
  const { data } = await axios.get(`https://api.gfycat.com/v1/gfycats/${id}`)
  return data.gfyItem.mp4Url
}

const generateName = () => {
  let result = ''
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

module.exports = {
  download
}