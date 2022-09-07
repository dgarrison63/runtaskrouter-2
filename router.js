// import { createHmac } from "crypto"
const fetch = require('node-fetch');
const koa = require('koa')
const koaRouter = require('koa-router')// importing Koa-Router
const bodyParser = require('koa-bodyparser');
const app = new koa()
const router = new koaRouter()
const axios = require('axios');
// const jsonQuery = require('json-query');
//const AS3URL = "http://localhost:9090/as3";
const AS3URL = "http://ves-io-04218a69-38d2-43ea-8934-5086550f347b.ac.vh.ves.io/as3";

async function getPlan(url, accessToken) {
  const options = {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer ' + accessToken
      }
  }

  // The first URL returns a 307 Temporary Redirect with the address of the JSON formatted Terraform Plan
  // Documentation - https://www.terraform.io/cloud-docs/api-docs/plans#retrieve-the-json-execution-plan
  // The fetch API follows the redirect by default
  const plan = await fetch(url, options)
  return plan.json();
}

async function sendCallback(callbackUrl, accessToken, status, message, url) {
  // Format the payload for the callback
  // Schema Documentation - https://www.terraform.io/cloud-docs/api-docs/run-tasks-integration#request-body-1
  const data = JSON.stringify({
      "data": {
          "type": "task-results",
          "attributes": {
              status,
              message,
              url,
          }
      }
  })
  const options = {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/vnd.api+json',
          'Authorization': 'Bearer ' + accessToken
      },
      body: data
  }
  await fetch(callbackUrl, options)
}

async function callAS3Validator(planOutput) {
  const data = JSON.stringify({
      "data": {
          "type": "plan-output",
          "attributes": {
            planOutput
          }
      }
  })
  const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: data
  }
 const response = await fetch(AS3URL, options);
 return response.json();
}


router.post('/as3', async(ctx) => {
  const { body } = ctx.request;
 // console.log('This is the request body...', body);
//  console.log('This is the plan output url...', body.plan_json_api_url);
  const planOutputURL = body.plan_json_api_url;
  const apiToken = body.access_token;
  const callbackURL = body.task_result_callback_url;
  // logRequest(ctx);
  console.log('BEFORE CALLING getPlanOutput FUNCTION')
  // planOutput = await getPlanOutput(body, planOutputURL, apiToken);
  // const planOutput = await getPlan(planOutputURL, apiToken).then(plan => console.log('THIS IS THE PLAN IN ROUTER POST', plan));
  //const planOutput = await getPlan(planOutputURL, apiToken).then(plan => (taskStatus =  callAS3Validator(plan)) );
  const planOutput = await getPlan(planOutputURL, apiToken);
  // getPlan(planOutputURL, apiToken).then(plan => planOutput = plan);
  console.log(`THIS IS THE RESULT AFTER CALL TO GET PLAN OUTPUT.. ${JSON.stringify(planOutput, null, 2)}`);
  const validator = await callAS3Validator(planOutput);
 console.log("VALUE OF VALIDATOR ", validator.data.result, validator.data.message, validator.data.urlLink)
//  const result = validator.result
//  const message = ctx.response.message
//  const urlLink = ctx.response.urlLink
//  console.log("THIS IS THE RETURN FROM AS3 VALIDATOR", result, message, urlLink)
// console.log('PLAN OUTPUT AFTER ,CALLING AS3', JSON.stringify(planOutput));
 // postCallback(body, callbackURL, apiToken, taskStatus);
 await sendCallback(callbackURL, apiToken, validator.data.result, validator.data.message, validator.data.urlLink)

  ctx.response.status = 200;
  // console.log(ctx.response);
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
