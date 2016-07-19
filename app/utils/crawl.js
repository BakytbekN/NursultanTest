import phantom from 'phantom'

let phInstance = null
const getPage = () => {
  const promise = new Promise((resolve, reject) => {
    try {
      phInstance = phInstance || phantom.create()
    } catch (e) {
      reject(e)
      return
    }
    resolve(phInstance)
  })

  return promise
    .then(phInstance => phInstance.createPage())
}

const crawl = function (url) {
  console.log(`Fetching ${url}...`)

  let workingPage

  return getPage()
    .then(page => {
      workingPage = page
      return workingPage
        .setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36')
    })
    .then(() => workingPage.open(url))
    .then(() => workingPage.property('content'))
    .then((content) => {
      console.error(`Fetch ${url} success!`)
      workingPage.close()
      return content
    })
    .catch(error => {
      console.error(`Fetch ${url} failed:`)
      console.error(error)
      workingPage.close()
    })
}

export default crawl
