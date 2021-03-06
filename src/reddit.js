const axios = require('axios').default
const decode = require('unescape')
const _ = require('lodash')
const { VERSION, ERRORS, NODE_ENVS, MESSAGE_SUBJECTS, DOMAINS } = require('./config')
const { handleError } = require('./errorHandler')
const logger = require('./logger')('reddit')

const sleep = ms => new Promise(res => setTimeout(() => res(), ms))

module.exports = class Reddit {
  constructor(props) {
    _.map(props, (val, key) => this[key] = val)
    this.startTimeRegex = /@[0-5][0-9]:[0-5][0-9]/g
    this.urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  }

  async getUrls() {
    if (!this.api) {
      await this._initApi()
    }
    const messages = await this._getMentionedMessages()
    const urlPromises = messages.map(m => this._getUrlItem(m))
    
    logger.info('Getting gif urls from mentions...')
    return new Promise(async (resolve, reject) => {
      try {
        const urlItems = await Promise.all(urlPromises)
        resolve(urlItems)
      } catch (e) {
        reject(e)
      }
    })
  }

  async replyToComment(content, id) {
    try {
      const commentData = new URLSearchParams()
      commentData.append('thing_id', id)
      commentData.append('text', content)
  
      const { data } = await this.api.post(
        '/api/comment',
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
    if (process.env.NODE_ENV !== NODE_ENVS.production) return
    try {
      const data = new URLSearchParams()
      data.append('id', id)
      for (let i = 1; i <= 6; i++) {
        try {
          await this.api.post(
            '/api/read_message',
            data.toString()
          )
          break
        } catch (e) {
          if (i === 6) {
            throw e
          }

          await sleep(10000 * i)
        }
      }
    } catch (e) {
      handleError(e, ERRORS.ERROR_MARKING_REDDIT_MESSAGE_READ)
    }
  }

  async _getMentionedMessages() {
    logger.info('Getting Reddit mentions...')
    try {
      const { data: { data } } = await this.api.get(
        '/message/unread'
      )

      const mentionedMessages = []
      const messages = data.children
      for (let i = 0; i < messages.length; i++) {
        const { data: { subject, name, body_html } } = messages[i]
        if (
          _.includes(_.values(MESSAGE_SUBJECTS), subject) &&
          decode(body_html).toLowerCase().includes(`u/${this.username.toLowerCase()}`)
        ) {
          mentionedMessages.push(messages[i])
        } else {
          await this.markMessageRead(name)
        }
      }
      return mentionedMessages
    } catch (e) {
      handleError(e, ERRORS.ERROR_FETCHING_REDDIT_MENTIONS)
    }
  }

  async _getUrlItem(comment) {
    try {
      const { kind, data: { id, subreddit, link_title, body_html, parent_id } } = comment

      const decodedBody = decode(body_html)
      const startTimeIndex = decodedBody.search(this.startTimeRegex)

      const startTime = startTimeIndex > 0 ?
        `${decodedBody.slice(startTimeIndex + 1, startTimeIndex + 6)}` :
        null

      const parent = await this.api.get(`/r/${subreddit}/api/info?id=${parent_id}`)
      const parentBody = decode(parent.data.data.children[0].data.body_html)
      const parentBodyUrlMatches = parentBody.match(this.urlRegex)
      if (parentBodyUrlMatches && parentBodyUrlMatches.length) {
        let url = parentBodyUrlMatches[0]
        const domain = Object.values(DOMAINS).find(d => url.includes(d))
        if (domain && domain !== DOMAINS.reddit_v) {
          if (domain === DOMAINS.imgur) {
            url = url.replace('imgur', 'i.imgur')
          }
          return {
            url,
            commentId: id,
            kind,
            domain,
            startTime
          }
        }
      }

      const commentInfoUrl = `/r/${subreddit}/api/info?id=${kind}_${id}`
      const { data: commentInfo } = await this.api.get(commentInfoUrl)
      const { data: { link_id} } = commentInfo.data.children[0]
  
      const linkInfoUrl = `/r/${subreddit}/api/info?id=${link_id}`
      const { data: linkInfo } = await this.api.get(linkInfoUrl)
      const { data: { url, domain, permalink } } = linkInfo.data.children[0]
      let decodedUrl = decode(url)

      if (domain === DOMAINS.imgur) {
        decodedUrl = decodedUrl.replace('imgur', 'i.imgur')
      }

      return {
        url: decodedUrl,
        commentId: id,
        kind,
        title: link_title,
        domain,
        permalink,
        startTime
      }
    } catch (e) {
      handleError(e, ERRORS.ERROR_FETCHING_REDDIT_URL_DATA)
    }
  }

  async _initApi() {
    logger.info('Initializing reddit api...')
    try {
      const accessToken = await this._getAccessToken()
      this.api = axios.create({
        baseURL: 'https://oauth.reddit.com'
      })
      this.api.defaults.headers.common = {
        ...this.api.defaults.headers.common,
        'Authorization': `Bearer ${ accessToken }`,
        'User-Agent': `${this.username}/${VERSION} by /u/${this.username}`,
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
