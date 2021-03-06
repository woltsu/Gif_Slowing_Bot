const fs = require('fs')
const path = require('path')
const axios = require('axios').default
const FormData = require('form-data')
const { CHARS, DOMAINS, ERRORS, DEFAULT_FORMAT } = require('./config')
const { handleError } = require('./errorHandler')
const { convertGifToMp4 } = require('./ffmpeg')

const download = async (urlItem, dir) => {
  const resultName = generateName()
  const gifData = await getGifData(urlItem)
  const { url: formattedUrl, format } = gifData

  const resultPath = path.resolve(dir, `${resultName}.${format || DEFAULT_FORMAT}`)
  const writer = fs.createWriteStream(resultPath)

  try {
    const fileStream = await axios({
      url: formattedUrl,
      method: 'GET',
      responseType: 'stream'
    })
    fileStream.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', async () => {
        if (format && format !== DEFAULT_FORMAT) {
          await convertGifToMp4(resultName, dir)
        }
        resolve(resultName)
      })
      writer.on('error', reject)
    })
  } catch (e) {
    handleError(e, ERRORS.ERROR_DOWNLOADING_GIF)
  }
}

const getGifData = async ({ url, domain, permalink }) => {
  if (domain === DOMAINS.i_imgur || domain === DOMAINS.imgur) {
    const urlParts = url.split('/')
    const id = urlParts[urlParts.length - 1].split('.')[0]
    return await getImgurUrl(id)

  } else if (domain === DOMAINS.gfycat) {
    const urlParts = url.split('/')
    return await getGfycatUrl(urlParts[urlParts.length - 1])

  } else if (domain === DOMAINS.reddit_preview) {
    return { url }

  } else if (domain === DOMAINS.reddit_i) {
    if (url.slice(url.length - 4, url.length) !== '.gif') {
      handleError(new Error(), ERRORS.ERROR_UNSUPPORTED_FORMAT)
    }

    return { url, format: 'gif' }
  } else if (domain === DOMAINS.reddit_v) {
    return await getRedditVUrl(permalink)

  } else {
    handleError(new Error(), ERRORS.ERROR_UNSUPPORTED_DOMAIN)
  }
}

const getRedditVUrl = async (permalink) => {
  const { data } = await axios.get(
    `https://www.reddit.com${permalink}.json`
  )
  try {
    let postData = data[0].data.children[0].data
    if (postData.crosspost_parent_list) {
      postData = postData.crosspost_parent_list[0]
    }
    return { url: postData.secure_media.reddit_video.fallback_url }
  } catch (e) {
    handleError(new Error(), ERRORS.ERROR_UNSUPPORTED_FORMAT)
  }
}

const getImgurUrl = async (id) => {
  let result
  try {
    const headers = {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
    }
    const { data: { data } } = await axios.get(`https://api.imgur.com/3/image/${id}`, { headers })
    result = data
  } catch (e) {
    handleError(e, ERRORS.ERROR_FETCHING_GIF_INFO)
  }

  if (!result.mp4) {
    handleError(new Error(), ERRORS.ERROR_UNSUPPORTED_FORMAT)
  }

  return {
    url: result.mp4
  }
}

const getGfycatUrl = async (id) => {
  try {
    const { data: { gfyItem } } = await axios.get(`https://api.gfycat.com/v1/gfycats/${id.split('-')[0]}`)
    return {
      url: gfyItem.mp4Url
    }
  } catch (e) {
    handleError(e, ERRORS.ERROR_FETCHING_GIF_INFO)
  }
}

const generateName = () => {
  let result = ''
  for (let i = 0; i < 6; i++) result += CHARS[Math.floor(Math.random() * CHARS.length)]
  return result
}

const sleep = ms => new Promise(res => setTimeout(() => res(), ms))

const uploadToGfycat = async (file, name) => {
  try {
    const token = (await axios.post('https://api.gfycat.com/v1/oauth/token', {
      client_id: process.env.GFYCAT_CLIENT_ID,
      client_secret: process.env.GFYCAT_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })).data.access_token

    const { gfyname } = (await axios.post('https://api.gfycat.com/v1/gfycats', {}, { headers: { Authorization: token } })).data
    const formData = new FormData()
    formData.append('key', gfyname)

    const { size } = await fs.statSync(file)
    formData.append('file', fs.createReadStream(file), { filename: gfyname, knownLength: size })
    await axios.post('https://filedrop.gfycat.com', formData, { headers: { 'Content-Length': formData.getLengthSync().toString(), ...formData.getHeaders() }, maxContentLength: Infinity, maxBodyLength: Infinity })

    const fetchName = async () => {
      const { task, gfyname: finalGfyname } = (await axios.get(`https://api.gfycat.com/v1/gfycats/fetch/status/${gfyname}`, { headers: { Authorization: token } })).data
      if (task === 'encoding' || task === 'NotFoundo') {
        await sleep(1000)
        return fetchName()
      } else if (task === 'complete') {
        return finalGfyname
      } else {
        throw new Error(`Fetching final gfycat name failed! ${task}`)
      }
    }

    return (await fetchName())
  } catch (e) {
    handleError(e, ERRORS.ERROR_UPLOADING_TO_GFYCAT)
  }
}

const uploadToImgur = async (file, name) => {
  try {
    const formData = new FormData()
    const f = await fs.statSync(file)

    formData.append('video', fs.createReadStream(file))
    formData.append('name', name)
    formData.append('type', 'file')
    formData.append('disable_audio', 1)

    const headers = {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      'Content-Length': f['size'],
      ...formData.getHeaders()
    }

    const { data: { data } } = await axios.post(`https://api.imgur.com/3/upload/`, formData, { headers, maxContentLength: Infinity, maxBodyLength: Infinity })
    return data.link
  } catch (e) {
    console.log('e', e.response.data)
    handleError(e, ERRORS.ERROR_UPLOADING_TO_IMGUR)
  }
}

module.exports = {
  download,
  uploadToImgur,
  uploadToGfycat
}