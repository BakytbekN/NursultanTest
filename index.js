import Koa from 'koa'
import views from 'koa-views'
import morgan from 'koa-morgan'
import favicon from 'koa-favicon'
import serve from 'koa-static'
import json from 'koa-json'
import compress from 'koa-compress'
import router from './app/router'

(new Koa())
  .use(compress())
  .use(favicon('./public/favicon.ico'))
  .use(views('view', {extension: 'jade'}))
  .use(serve('./public'))
  .use(morgan('combined'))
  .use(json())
  .use(router.routes())
  .listen(process.env.PORT || 5000)
