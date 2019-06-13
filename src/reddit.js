const axios = require('axios').default
const { VERSION } = require('./config')

const getUrls = async () => {
  await initRedditApi()
}

const initRedditApi = async () => {
  const accessToken = await getRedditAccessToken()
  axios.interceptors.request.use((config) => ({
    ...config,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...config.headers
    }
  }))
}

const getRedditAccessToken = async () => {
  const {
    REDDIT_USER_NAME,
    REDDIT_PASSWORD,
    REDDIT_CLIENT_ID,
    REDDIT_SECRET
  } = process.env

  const authEndpoint = 'https://www.reddit.com/api/v1/access_token'

  const bodyParams = new URLSearchParams()
  bodyParams.append('grant_type', 'password')
  bodyParams.append('username', REDDIT_USER_NAME)
  bodyParams.append('password', REDDIT_PASSWORD)

  const headers = {
    'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_SECRET}`).toString('base64')}`,
    'User-Agent': `gif_slowing_bot/${VERSION} by /u/Gif_Slowing_Bot`,
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const result = await axios.post(
    authEndpoint,
    bodyParams.toString(),
    { headers }
  )

  return result.data.access_token
}

module.exports = {
  getUrls
}