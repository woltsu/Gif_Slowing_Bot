const axios = require('axios').default
const decode = require('unescape')
const _ = require('lodash')
const { VERSION, SUPPORTED_DOMAINS, ERRORS } = require('./config')
const { handleError } = require('./errorHandler')
const { log } = require('./utils')

module.exports = class Reddit {
  constructor(props) {
    _.map(props, (val, key) => this[key] = val)
  }

  async getUrls() {
    if (!this.api) {
      await this._initApi()
    }
    const messages = await this._getMentionedMessages()
    const urlPromises = messages.map(m => this._getUrlItem(m))
    
    log('Getting gif urls from mentions...')
    return new Promise(resolve => {
      Promise.all(urlPromises).then((items) => {
        resolve(items.filter(({ domain }) => {
          return SUPPORTED_DOMAINS.includes(domain)
        }))
      })
    })
  }

  async replyToComment(content, id) {
    try {
      const commentData = new URLSearchParams()
      commentData.append('thing_id', id)
      commentData.append('text', content)
  
      const { data } = await this.api.post(
        'https://oauth.reddit.com/api/comment',
        commentData
      )
      if (!data.success) {
        throw new Error()
      }
    } catch (e) {
      handleError(e, ERRORS.ERROR_REPLYING_TO_REDDIT_COMMENT)
    }
  }

  async markMessageRead(id) {
    try {
      const data = new URLSearchParams()
      data.append('id', id)
      await this.api.post(
        'https://oauth.reddit.com/api/read_message',
        data.toString()
      )
    } catch (e) {
      handleError(e, ERRORS.ERROR_MARKING_REDDIT_MESSAGE_READ)
    }
  }

  async _getMentionedMessages() {
    log('Getting Reddit mentions...')
    try {
      const { data: { data } } = await this.api.get(
        '/message/unread'
      )
  
      return data.children.filter(({ data: { subject } }) => {
        return subject === 'username mention'
      })
    } catch (e) {
      handleError(e, ERRORS.ERROR_FETCHING_REDDIT_MENTIONS)
    }
  }

  async _getUrlItem(comment) {
    try {
      const { kind, data: { id, subreddit, link_title } } = comment
  
      const commentInfoUrl = `/r/${subreddit}/api/info?id=${kind}_${id}`
      const { data: commentInfo } = await this.api.get(commentInfoUrl)
      const { data: { link_id} } = commentInfo.data.children[0]
  
      const linkInfoUrl = `/r/${subreddit}/api/info?id=${link_id}`
      const { data: linkInfo } = await this.api.get(linkInfoUrl)
      const { data: { url, domain } } = linkInfo.data.children[0]
  
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

  async _initApi() {
    log('Initializing reddit api...')
    try {
      const accessToken = await this._getAccessToken()
      this.api = axios.create({
        baseURL: 'https://oauth.reddit.com'
      })
      this.api.defaults.headers.common = {
        ...this.api.defaults.headers.common,
        'Authorization': `Bearer ${ accessToken }`,
        'User-Agent': `gif_slowing_bot/${VERSION} by /u/Gif_Slowing_Bot`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    } catch (e) {
      handleError(e, ERRORS.ERROR_AUTHENTICATING_TO_REDDIT)
    }
  }

  async _getAccessToken() {
    const {
      username,
      password,
      clientId,
      secret
    } = this
  
    const authEndpoint = 'https://www.reddit.com/api/v1/access_token'
  
    const data = new URLSearchParams()
    data.append('grant_type', 'password')
    data.append('username', username)
    data.append('password', password)
  
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'User-Agent': `gif_slowing_bot/${VERSION} by /u/Gif_Slowing_Bot`
    }
  
    const result = await axios.post(
      authEndpoint,
      data.toString(),
      { headers }
    )
  
    return result.data.access_token
  }
}
