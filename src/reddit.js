const axios = require('axios').default
const decode = require('unescape')
const { VERSION, SUPPORTED_DOMAINS, ERRORS } = require('./config')
const { handleError } = require('./errorHandler')

const getUrls = async () => {
  await initRedditApi()
  const messages = await getMentionedMessages()
  const urlPromises = messages.map(m => getUrlItem(m))
  
  console.log('Getting gif urls from mentions...')
  return new Promise(resolve => {
    Promise.all(urlPromises).then((items) => {
      resolve(items.filter(({ domain }) => {
        return SUPPORTED_DOMAINS.includes(domain)
      }))
    })
  })
}

const getUrlItem = async (comment) => {
  try {
    const { kind, data: { id, subreddit, link_title } } = comment

    const commentInfoUrl = `/r/${subreddit}/api/info?id=${kind}_${id}`
    const { data: commentInfo } = await axios.get(commentInfoUrl)
    const { data: { link_id} } = commentInfo.data.children[0]

    const linkInfoUrl = `/r/${subreddit}/api/info?id=${link_id}`
    const { data: linkInfo } = await axios.get(linkInfoUrl)
    const { data: { url, domain, subreddit_id} } = linkInfo.data.children[0]

    return {
      url: decode(url),
      commentId: id,
      kind,
      title: link_title,
      domain: domain
    }
  } catch (e) {
    handleError(e, ERRORS.ERROR_FETCHING_REDDIT_URL_DATA)
  }
}

const initRedditApi = async () => {
  console.log('Authenticating to Reddit...')
  try {
    const accessToken = await getRedditAccessToken()
    token = accessToken
    axios.interceptors.request.use((config) => ({
      baseURL: 'https://oauth.reddit.com',
      ...config,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': `gif_slowing_bot/${VERSION} by /u/Gif_Slowing_Bot`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...config.headers
      }
    }))
  } catch (e) {
    handleError(e, ERRORS.ERROR_AUTHENTICATING_TO_REDDIT)
  }
}

const getRedditAccessToken = async () => {
  const {
    REDDIT_USER_NAME,
    REDDIT_PASSWORD,
    REDDIT_CLIENT_ID,
    REDDIT_SECRET
  } = process.env

  const authEndpoint = 'https://www.reddit.com/api/v1/access_token'

  const data = new URLSearchParams()
  data.append('grant_type', 'password')
  data.append('username', REDDIT_USER_NAME)
  data.append('password', REDDIT_PASSWORD)

  const headers = {
    'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_SECRET}`).toString('base64')}`,
    'User-Agent': `gif_slowing_bot/${VERSION} by /u/Gif_Slowing_Bot`
  }

  const result = await axios.post(
    authEndpoint,
    data.toString(),
    { headers }
  )

  return result.data.access_token
}

const getMentionedMessages = async () => {
  console.log('Getting Reddit mentions...')
  try {
    const { data: { data } } = await axios.get(
      '/message/unread'
    )

    return data.children.filter(({ data: { subject } }) => {
      return subject === 'username mention'
    })
  } catch (e) {
    handleError(e, ERRORS.ERROR_FETCHING_REDDIT_MENTIONS)
  }
}

module.exports.markMessageRead = async ({ kind, id }) => {
  try {
    const data = new URLSearchParams()
    data.append('id', `${kind}_${id}`)
    return await axios.post(
      '/api/read_message',
      data.toString()
    )
  } catch (e) {
    handleError(e, ERRORS.ERROR_MARKING_REDDIT_MESSAGE_READ)
  }
}

module.exports = {
  getUrls
}