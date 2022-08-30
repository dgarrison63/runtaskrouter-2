// import { createHmac } from "crypto"
const koa = require('koa')
const koaRouter = require('koa-router')// importing Koa-Router
const bodyParser = require('koa-bodyparser');
const app = new koa()
const router = new koaRouter()
const axios = require('axios');

router.post('/as3', (ctx) => {
  const { body } = ctx.request;
  console.log('This is the request body...', body);
//  console.log('This is the plan output url...', body.plan_json_api_url);
  // logRequest(ctx);
  ctx.status = 200;
  // console.log(ctx.response);
  ctx.body = 'got it!';
  return {
    'status': "passed"
  };
});

router.all('/', (ctx) => {
    ctx.body = "Invalid Request"
    ctx.status = 404
    console.log(ctx.req)
})

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(9090, () => {
    console.log('Mock service started on port 9090')
  }
);
