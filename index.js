import compare from 'tsscmp'

// HTTP Basic Auth logic from https://github.com/jshttp/basic-auth/blob/master/index.js
class Credentials {
  constructor(name, pass) {
    this.name = name
    this.pass = pass
  }
}

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

function parseAuthHeader(header) {

  var CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/
  var USER_PASS_REGEXP = /^([^:]*):(.*)$/

  if (!header) {
    return undefined
  }

  if (typeof header !== 'string') {
    return undefined
  }

  var match = CREDENTIALS_REGEXP.exec(header)

  if (!match) {
    return undefined
  }

  try {
    var userPass = USER_PASS_REGEXP.exec(atob(match[1]))
  } catch (error) {
    return undefined
  }

  if (!userPass) {
    return undefined
  }
  return new Credentials(userPass[1], userPass[2])
}


async function purgeCache() { 
  const apiUrl = "https://api.cloudflare.com/client/v4/zones/"+CF_ZONE_ID+"/purge_cache"

  const apiPayload = {
    "purge_everything":true
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

  var credentials = parseAuthHeader(request.headers.get("Authorization"))

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

