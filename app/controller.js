const _ = require('lodash')
const Q = require('q')

const searchResults2json = require('./utils/search-results2json')

const request = (options) => Q.denodeify(require('request'))(options).then(_.first)

const controller = {
  home: async (ctx) => {
    _.assign(ctx.state, {
      title: `Holly Quintet${ctx.get('host') === 'localhost:5000' ? ' (local)' : ''}`
    })
    await ctx.render('home/index', ctx.state)
  },

  search (ctx) {
    // for dev use
    // return ctx.body = require('./utils/search-results2json/scheme')

    const query = ctx.query.query

    var scope = ctx.query.scope

    switch (scope) {
      case 'itunes-hk':
      case 'itunes-jp':
      case 'itunes-tw':
      case 'itunes-us':
        scope = `itunes.apple.com/${scope.slice('itunes-'.length)}/album`
        break
      case 'amazon-com':
        scope = 'amazon.com'
        break
      case 'amazon-jp':
        scope = 'amazon.co.jp'
        break
      case 'vgmdb':
        scope = 'vgmdb.net/album'
        break
      case 'orpheus':
        scope = 'music.163.com/album'
        break
      case 'qq':
        scope = 'y.qq.com/y/static'
        break
      case 'musicbrainz':
        scope = 'musicbrainz.org'
        break
      default:
        scope = ''
        break
    }

    const requestOption = {
      baseUrl: 'https://www.google.com',
      url: '/search',
      qs: {
        tbm: 'isch',
        gws_rd: 'cr', // get rid of our request being redirected by country
        q: `${query} site:${scope}`
      },
      headers: {
        'user-agent': ctx.request.get('user-agent')
      }
    }

    var searchResponse
    var error

    try {
      searchResponse = request(requestOption)
      ctx.set('X-Proxy-URL', searchResponse.request.uri.href)

      try {
        ctx.body = searchResults2json(searchResponse.body, scope)
      } catch (e) {
        console.error('Error when parsing results from Google:')
        error = e
      }
    } catch (e) {
      console.error('Error when connect to Google:')
      error = e
    }

    if (!error) return

    ctx.status = 500
    ctx.body = {error: _.pick(error, 'message')}
    console.error(error.stack)
  },

  download (ctx) {
    var res = request({
      url: ctx.query.url,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0'
      },
      encoding: null
    })
      .catch((e) => {
        ctx.status = 500
        ctx.body = `${e}`
      })

    if (!res) return

    // in case some covers from itunes only have a 600x600 one
    if (res.statusCode === 404) {
      const keyword = '/cover1200x1200.'
      const index = ctx.query.url.lastIndexOf(keyword)
      const count = _.size(ctx.query.url) - index - keyword.length

      if (index > 0 && count < 5) {
        res = request({
          url: ctx.query.url.replace(keyword, '/cover600x600.'),
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0'
          },
          encoding: null
        }).catch((e) => {
          ctx.status = 500
          ctx.body = `${e}`
        })
      }
    }

    ctx.set(res.headers)
    ctx.body = res.body
    ctx.attachment(ctx.query.filename || res.request.uri.pathname)
  }
}

module.exports = controller
