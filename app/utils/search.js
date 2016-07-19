import url from 'url'
import _ from 'lodash'
import cheerio from 'cheerio'
import crawl from './crawl'

const getUrl = function (q, site, provider) {
  switch (provider) {
    case 'google':
    default:
      return url.format({
        protocol: 'http:',
        slashes: true,
        host: 'www.google.com',
        query: {
          tbm: 'isch', // stands for image search, see https://stenevang.wordpress.com/2013/02/22/google-advanced-power-search-url-request-parameters/
          gws_rd: 'cr', // get rid of our request being redirected by country
          q: `${q} site:${site}`
        },
        pathname: '/search'
      })
  }
}

const getOriginSrcFromItunes = function (src) {
  const falseReg = /cover\d{3}x\d{3}/
  const trueReg = /1200x1200/

  if (falseReg.test(src) && !trueReg.test(src)) {
    src = src.replace(falseReg, 'cover1200x1200')
  }
  return src
}

const getOriginSrcFrom163 = function (src) {
  return _.assign(url.parse(src), { search: '' })
    .format(src)
}

const getOriginSrc = function (src, scope) {
  var getOriginSrc

  if (_.includes(scope, 'itunes')) {
    getOriginSrc = getOriginSrcFromItunes
  } else if (_.includes(scope, 'music.163.com')) {
    getOriginSrc = getOriginSrcFrom163
  } else {
    getOriginSrc = _.identity
  }

  return getOriginSrc(src)
}

const searchResults2Json = function (html, scope) {
  return cheerio
    .load(html)('.rg_meta')
    .map(function () {
      let meta = $(this).html()
      meta = _.unescape(meta)
      meta = JSON.parse(meta)
      return {
        originTitle: meta.pt,
        title: meta.pt,
        refer: meta.ru,
        src: meta.ou,
        originSrc: getOriginSrc(meta.ou, scope)
      }
    })
    .get()
}

const search = function (q, site, provider = 'google') {
  const url = getUrl(q, site)
  return crawl(url)
    .then(content => searchResults2Json(content))
}

export default search
