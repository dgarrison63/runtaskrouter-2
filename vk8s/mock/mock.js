// import { createHmac } from "crypto"
const koa = require('koa')
const koaRouter = require('koa-router')// importing Koa-Router
const bodyParser = require('koa-bodyparser');
const app = new koa()
const router = new koaRouter()
// const axios = require('axios');

router.post('/as3', (ctx) => {
  const { body } = ctx.request;
  // console.log('This is the request body...', JSON.stringify(ctx.request.body))
  const result = 'passed';
  const message = 'this is a message';
  const urlLink = 'https://www.f5.com';
  const data = JSON.stringify({
    "data": {
        "result": result,
        "message": message,
        "urlLink": urlLink
    }
})
 ctx.response.body = data;
ctx.response.status = 200;
 console.log("RESPONSE BODY", ctx.response.body);
// console.log(result, message, urlLink);
  return ctx.response;
});

// router.all('/', (ctx) => {
//     ctx.body = "Invalid Request"
//     ctx.status = 404
//     console.log(ctx.req)
// })

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(9090, () => {
    console.log('Mock service started on port 9090')
  }
);
