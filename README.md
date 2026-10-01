# Notebook IA — API Proxy

This tiny Cloudflare Worker holds your real Gemini / OpenAI / Groq / Jina API
keys as server-side secrets. Your front-end (`page_principale.html`) never
sees or stores them — it just calls this Worker, and the Worker attaches the
real key before forwarding the request upstream.

## 1. Install Wrangler (Cloudflare's CLI)

```bash
npm install -g wrangler
wrangler login
```

## 2. Deploy the Worker

From this `proxy/` folder:

```bash
wrangler deploy
```

This prints your Worker's URL, something like:

```
https://notebook-ia-proxy.YOUR-SUBDOMAIN.workers.dev
```

Copy that URL — you'll paste it into the app's settings modal (or directly
into `PROXY_BASE_URL` in the HTML file).

## 3. Set your real API keys as secrets

These are **never written to any file** — Cloudflare stores them encrypted,
and only this Worker can read them at request time.

```bash
wrangler secret put GEMINI_API_KEYS
wrangler secret put OPENAI_API_KEYS
wrangler secret put GROQ_API_KEYS
wrangler secret put JINA_API_KEYS
```

Each prompt will ask you to paste a value. You can paste a single key, or
several comma-separated keys for automatic rotation/fallback, e.g.:

```
sk-abc123...,sk-def456...
```

## 4. (Recommended) Set a proxy access token

This stops random visitors from using your Worker (and burning your API
quota) even if they discover its URL. It's a shared secret between your
front-end and your Worker — not a provider key, just an abuse gate.

```bash
wrangler secret put PROXY_TOKEN
```

Then in the app's settings modal, paste the same value into "Proxy Token".

## 5. Lock down CORS (optional but recommended)

Edit `wrangler.toml` and set:

```toml
[vars]
ALLOWED_ORIGIN = "https://your-actual-site.example.com"
```

Then redeploy with `wrangler deploy`.

## 6. Point the app at your Worker

Open `page_principale.html` in the browser, click the settings/API icon,
and paste:

- **Proxy URL**: your Worker URL from step 2
- **Proxy Token**: the value from step 4 (if you set one)

That's it — the app will call your Worker instead of the AI providers
directly, and the real keys never leave your Cloudflare account.

## Rotating your previously-exposed keys

Because keys were pasted into a chat and were already hardcoded as fallback
defaults in the original HTML file, treat all of the following as
compromised and regenerate them before wiring up the new ones:

- Gemini key (started `AQ.Ab8RN6...`)
- OpenAI service-account key (started `sk-svcacct-...`)
- OpenAI project key that was hardcoded as a default (started `sk-proj-...`)
- Groq key (started `gsk_...`)
- Jina key (started `jina_...`)

Revoke each in its respective dashboard, generate fresh ones, and set only
the fresh ones as Worker secrets in step 3.
