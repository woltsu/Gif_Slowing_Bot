const fs = require('fs')
const path = require('path')
const axios = require('axios').default
const { CHARS, DOMAINS } = require('./config')

const download = async (urlItem, dir) => {
  const resultName = generateName()
  const gifData = await getGifData(urlItem)
  const { url: formattedUrl } = gifData

  const resultPath = path.resolve(dir, `${resultName}.mp4`)
  const writer = fs.createWriteStream(resultPath)

  const fileStream = await axios({
    url: formattedUrl,
    method: 'GET',
    responseType: 'stream'
  })
  fileStream.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(resultName))
    writer.on('error', reject)
  })
}

const getGifData = async ({ url, domain }) => {
  if (domain === DOMAINS.imgur) {
    const urlParts = url.split('/')
    const id = urlParts[urlParts.length - 1].split('.')[0]
    return await getImgurUrl(id)

  } else if (domain === DOMAINS.gfycat) {
    const urlParts = url.split('/')
    return await getGfycatUrl(urlParts[urlParts.length - 1])

  } else if (domain === DOMAINS.reddit) {
    return { url }
  } else {
    throw Error('Unsupported domain!')
  }
}

const getImgurUrl = async (id) => {
  const headers = {
    Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
  }
  const { data: { data } } = await axios.get(`https://api.imgur.com/3/image/${id}`, { headers })
  return {
    url: data.mp4
  }
}

const getGfycatUrl = async (id) => {
  const { data: { gfyItem } } = await axios.get(`https://api.gfycat.com/v1/gfycats/${id}`)
  return {
    url: gfyItem.mp4Url
  }
}

const generateName = () => {
  let result = ''
  for (let i = 0; i < 6; i++) result += CHARS[Math.floor(Math.random() * CHARS.length)]
  return result
}

module.exports = {
  download
}