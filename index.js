import Koa from 'koa'
import views from 'koa-views'
import morgan from 'koa-morgan'
import favicon from 'koa-favicon'
import serve from 'koa-static'
import json from 'koa-json'
import compress from 'koa-compress'
import router from './app/router'

const port = process.argv[2] ||
  process.env.PORT ||
  process.env.npm_package_config_port ||
  5000

new Koa()
  .use(compress())
  .use(favicon('./public/favicon.ico'))
  .use(views('view', {extension: 'jade'}))
  .use(serve('./public'))
  .use(morgan('combined'))
  .use(json())
  .use(router.routes())
  .listen(port)

console.info(`${process.env.npm_package_name || 'app'} is listening on port ${port}...`)
