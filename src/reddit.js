const axios = require('axios').default
const { VERSION } = require('./config')

const getUrls = async () => {
  await initRedditApi()
  const messages = await getMentionedMessages()
  const urlPromises = messages.map(m => getUrlItem(m))
  return new Promise(resolve => {
    Promise.all(urlPromises).then((items) => {
      resolve(items)
    })
  })
}

const getUrlItem = async (comment) => {
  const { kind, data: { id, subreddit, link_title } } = comment

  const commentInfoUrl = `/r/${subreddit}/api/info?id=${kind}_${id}`
  const { data: commentInfo } = await axios.get(commentInfoUrl)
  const { data: { link_id, id: commentId } } = commentInfo.data.children[0]

  const linkInfoUrl = `/r/${subreddit}/api/info?id=${link_id}`
  const { data: linkInfo } = await axios.get(linkInfoUrl)
  const { data: { url } } = linkInfo.data.children[0]

  return {
    url,
    commentId: id,
    title: link_title
  }
}

const initRedditApi = async () => {
  const accessToken = await getRedditAccessToken()
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
  const { data: { data } } = await axios.get(
    '/message/unread'
  )

  return await processMessages(data.children)
}

const processMessages = async (messages) => {
  const mentionMessages = messages.filter(({ data: { subject } }) => {
    return subject === 'username mention'
  })

  if (messages.length) {
    //await markMessagesRead(messages)
  }

  return mentionMessages
}

const markMessagesRead = async (messages) => {
  const promises = messages.map(m => markMessageRead(m))
  return new Promise(resolve => {
    Promise.all(promises).then(() => {
      resolve()
    })
  })
}

const markMessageRead = async ({ kind, data: { id } }) => {
  const data = new URLSearchParams()
  data.append('id', `${kind}_${id}`)
  return await axios.post(
    '/api/read_message',
    data.toString()
  )
}

module.exports = {
  getUrls
}