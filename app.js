// import { createHmac } from "crypto"
const koa = require('koa')
const koaRouter = require('koa-router')// importing Koa-Router
const bodyParser = require('koa-bodyparser');
const app = new koa()
const router = new koaRouter()
const axios = require('axios');
const jsonQuery = require('json-query');

async function getPlanOutput(body, url, token) {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  await axios
    .get(url, config)
    .then((res) => {
//      console.log(`statusCode: ${res.status}`);
      const myarray = res.data.resource_changes;
      const plan_array = res.data;
//      console.log(res.data);
      query_result = jsonQuery('resource_changes[type=bigip_as3].change', {
        data: plan_array,
      }).value;
      console.log('VALUE OF AS3 QUERY IS: ', query_result);

      if (query_result == null) {
        console.log('RETURNING FAILED RESPONSE');
        return Promise.all('failed');
      }
      console.log('RETURNING PASSED RESPONSE');

      return true;
      /*
     terraform_result = jsonQuery('after.as3json', {
        data: query_result,
      });
      console.log(terraform_result);

      //       console.log(res.data)
      //       console.log(res.data.format_version)
      //       console.log(res.data.resource_changes[0])
      console.log(res.data.resource_changes[0].change);
*/
      /*
      for (let i=0; i < myarray.length; i++) {
          console.log(myarray[i].type)
      }
*/
    })
    .catch((error) => {
      console.error(error);
    });
}


/* app.use( async (ctx, next) => {
  try {
    await next()
  } catch(err) {
    console.log(err.status)
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
}) */

async function postCallback(body, url, token, planStatus) {
  console.log('PLAN RESULT', `${planStatus}`);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json',
    },
  };
  const payload = {
    data: {
      type: 'task-results',
      attributes: {
        status: `${planStatus}`,
        message: 'Hello task',
        url: 'http://google.com'
      },
    },
  };
  await axios
    .patch(url, payload, config)
    .then((res) => {
      console.log(`statusCode: ${res.status}`);
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
}

router.post('/as3', (ctx) => {
  const { body } = ctx.request;
  console.log('This is the request body...', body);
//  console.log('This is the plan output url...', body.plan_json_api_url);
  const planOutputURL = body.plan_json_api_url;
  const apiToken = body.access_token;
  const callbackURL = body.task_result_callback_url;
  // logRequest(ctx);
  const result = getPlanOutput(body, planOutputURL, apiToken);
  console.log('THIS IS THE RESULT FROM PLAN OUTPUT...', result);
  // callAS3Validate(dfapofidjafpodjsaf)
  postCallback(body, callbackURL, apiToken, result);

  ctx.status = 200;
  // console.log(ctx.response);
  ctx.body = 'got it!';
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
  .listen(8080, () => {
    console.log('Run Task Receiver started on port 8080')
  }
);
