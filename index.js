/* eslint-disable no-undef */
import auth from 'basic-auth'
import timingSafeEqual from 'compare-timing-safe'

function unauthorizedResponse(body) {
  return new Response(body, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="User Visible Realm"',
    },
  })
}

function generateSimpleResponse(httpCode, strMessage) {
  return new Response(JSON.stringify({ result: strMessage }), {
    status: httpCode,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function check(name, pass) {
  var valid = true

  valid = timingSafeEqual(name, WEBHOOK_USER) && valid
  valid = timingSafeEqual(pass, WEBHOOK_PASSWORD) && valid

  return valid
}

async function purgeCache() {
  const apiUrl =
    'https://api.cloudflare.com/client/v4/zones/' + CF_ZONE_ID + '/purge_cache'

  const apiPayload = {
    purge_everything: true,
  }

  const init = {
    body: JSON.stringify(apiPayload),
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + CF_AUTH_TOKEN,
    },
  }

  const response = await fetch(apiUrl, init)
  return await response.json()
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  var credentials = auth.parse(request.headers.get('Authorization'))

  if (!credentials || !check(credentials.name, credentials.pass)) {
    return unauthorizedResponse('Unauthorized')
  } else {
    const responseData = await purgeCache()

    if (responseData.success) {
      return generateSimpleResponse(200, 'OK')
    } else {
      return generateSimpleResponse(500, 'FAILED')
    }
  }
}
