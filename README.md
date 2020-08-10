# 👷‍♀️ `Cloudflare Cache Purger for Ghost Blog`

[![Total alerts](https://img.shields.io/lgtm/alerts/g/Vortexmind/ghost-cloudflare-cache-purge.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Vortexmind/ghost-cloudflare-cache-purge/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Vortexmind/ghost-cloudflare-cache-purge.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Vortexmind/ghost-cloudflare-cache-purge/context:javascript)

This [Cloudflare Worker](https://workers.cloudflare.com/) can be used to execute a cache purge on a given Cloudflare zone when invoked. It uses HTTP Basic Authentication to allow only authorized users. This is the only authentication scheme currently supported by [Ghost Webhooks](https://ghost.org/docs/api/v3/webhooks/). This can be used to automate cache purging on certain actions on Ghost, for example new post publishing.

What it does:

- It accepts a request including an HTTP Basic Authentication header.
- If the credentials are invalid, an `HTTP 401` response is returned.
- It decodes the header and compares it with pre-configured credentials.
- If valid, it issues a [Cloudflare API](https://api.cloudflare.com/) call for a specific zone, and purges everything.
- If the call is successful, it returns an `HTTP 200` response, otherwise it returns an `HTTP 500` error.

You can read full setup instructions [on the related blog article I wrote](https://www.paolotagliaferri.com/cloudflare-cache-purge-with-ghost-webhook/).

#### Wrangler

For ease of use, this script should be managed using Wrangler.
Further documentation for Wrangler can be found [here](https://developers.cloudflare.com/workers/tooling/wrangler).

The worker requires environment variables that needs to be set in your `wrangler.toml` file alongside the other options.
See the provided `wrangler.toml.example` included in this repository. It also expects two secrets, which need to be configured
via wrangler.

#### Setup

1. Clone the repository and set up `wrangler`
2. Add a `wrangler.toml` file to your folder `cp wrangler.toml.example wrangler.toml`
3. Edit the file, adding your Cloudflare Account Id, Zone ID and the `WEBHOOK_USER`, `CF_ZONE_ID` values
4. Test your changes
5. Use `wrangler secret put` to configure two secrets for your worker: `wrangler secret put CF_AUTH_TOKEN` with a Cloudflare API token with the Cache Purge permission for the intended zone. `wrangler secret put WEBHOOK_PASSWORD` with the password that will be associated to the above `WEBHOOK_USER`
6. Once happy, run `wrangler publish` to deploy the worker
