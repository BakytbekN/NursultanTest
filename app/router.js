import Router from 'koa-router'
import controller from './controller'

export default new Router()
  .get('', controller.home)
  .get('/covers', controller.home)
  .get('/api/covers', controller.search)
  .get('/file', controller.download)
