import compare from 'tsscmp'
import auth from 'basic-auth'

function unauthorizedResponse(body) {
  return new Response(
    body, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="User Visible Realm"'
      }
    }
  )
}

function check(name,pass) {
  var valid = true
 
  valid = compare(name, WEBHOOK_USER) && valid
  valid = compare(pass, WEBHOOK_PASSWORD) && valid

  return valid
}

async function purgeCache() { 
  const apiUrl = "https://api.cloudflare.com/client/v4/zones/"+CF_ZONE_ID+"/purge_cache"

  const apiPayload = {
    "prefixes" : ["www.paolotagliaferri.com/about-paolo-tagliaferri/"]
    //"purge_everything":true
  }

  const init = {
    body: JSON.stringify(apiPayload),
    method: 'POST',
    headers : {
      'Authorization' : "Bearer " + CF_AUTH_TOKEN
    }
  }

  const response = await fetch(apiUrl, init)
  return await response.json()

}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {

  var credentials = auth.parse(request.headers.get("Authorization"))

  if ( !credentials || !check(credentials.name, credentials.pass) ) {
    return unauthorizedResponse("Unauthorized")
  } else {
    const responseData = await purgeCache()

    if (responseData.success){ 
      return new Response (
        JSON.stringify({"result": "OK"}), {
          status: 200,
          headers : { 
            'Content-Type' : 'application/json'
          }
      })
    } else  {
      return new Response (
        JSON.stringify({"result": "FAILED"}), {
          status: 500, 
          headers : { 
            'content-type' : 'application/json'
          }
      })
    }

  }
}

