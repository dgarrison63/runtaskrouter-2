// import { createHmac } from "crypto"
const fetch = require('node-fetch');
const koa = require('koa')
const koaRouter = require('koa-router')// importing Koa-Router
const bodyParser = require('koa-bodyparser');
const app = new koa()
const router = new koaRouter()
const axios = require('axios');
const jsonQuery = require('json-query');
const AS3URL = "http://localhost:9090/as3";

/*
function getPlanOutput(body, url, token) {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  console.log('BEFORE CALL TO AXIOS IN GET PLAN OUTPUT')
  axios
    .get(url, config)
    .then((res) => {
      const planOutput = res.data;
      console.log('AFTER CALL TO AXIOS IN GET PLAN OUTPUT: ', planOutput)

      return planOutput;
    })
    .catch((error) => {
      console.error(error);
    });
}
*/
/*
app.use( async (ctx, next) => {
  try {
    await next()
  } catch(err) {
    console.log(err.status)
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
})
*/

/* const getPlanOutput =  async (body, planOutputURL, apiToken) => {
  const config = {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  };
  try {
      const resp = await axios.get(planOutputURL, config).then(resp => {
      console.log(resp.data);
      const payload = resp.data;
      return resp.data.json();
     })
  } catch (err) {
      // Handle Error Here
      console.error(err);
  }
}; */


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
  // console.log('PLAN OUTPUT IN getPlan FUNCTION', JSON.parse(plan));
  return plan.json()

}



/* 
async function postCallback(body, url, token, taskStatus) {
  console.log('PLAN RESULT IN POSTCALLBACK', `${taskStatus}`);
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
        status: `${taskStatus}`,
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
 */

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

 const taskStatus  = await fetch(AS3URL, options)
 console.log("STATUS", taskStatus);
 return taskStatus
}



/*
async function callAS3Validate(planOutput) {
    console.log('PLAN BEFORE CALL TO AS3 WORKER' + planOutput);
    const payload = JSON.stringify({
      "data": {
        "planOutput": planOutput
      },
      body: payload
    });
    await axios
      .post(AS3URL, payload)
      .then((res) => {
        console.log(`statusCode: ${res.status}`);
    //    console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  */

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
  const planOutput = await getPlan(planOutputURL, apiToken).then(plan => (taskStatus =  callAS3Validator(plan)) );
  // let planOutput = ""; 
  // getPlan(planOutputURL, apiToken).then(plan => planOutput = plan);
  // console.log('THIS IS THE RESULT AFTER CALL TO GET PLAN OUTPUT...' +  planOutput().then);
  console.log('PLAN OUTPUT BEFORE CALLING AS3', JSON.stringify(planOutput));
 // const taskStatus = await callAS3Validator(planOutput);
 // postCallback(body, callbackURL, apiToken, taskStatus);
 await sendCallback(callbackURL, apiToken, 'passed', 'Hello World', 'http://example.com/runtask/QxZyl')

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
