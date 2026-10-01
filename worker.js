/**
 * Notebook IA - Server-side API proxy
 * ------------------------------------
 * Holds real provider API keys as Worker secrets (never shipped to the browser)
 * and forwards chat/completions requests from the front-end to Gemini, OpenAI,
 * Groq and Jina.
 *
 * Deploy with Wrangler, then set secrets (see README.md in this folder):
 *   wrangler secret put GEMINI_API_KEYS
 *   wrangler secret put OPENAI_API_KEYS
 *   wrangler secret put GROQ_API_KEYS
 *   wrangler secret put JINA_API_KEYS
 *   wrangler secret put PROXY_TOKEN        (optional but recommended)
 *
 * Each *_API_KEYS secret can hold one key, or several comma-separated keys
 * for automatic rotation/fallback (e.g. "key1,key2,key3").
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Optional shared-secret gate so random internet traffic can't spend your quota.
    // This does NOT need to be kept as secret as the provider keys themselves --
    // it's just a cheap abuse filter, set it with: wrangler secret put PROXY_TOKEN
    if (env.PROXY_TOKEN) {
      const token = request.headers.get('X-Proxy-Token');
      if (token !== env.PROXY_TOKEN) {
        return json({ error: 'Unauthorized' }, 401, corsHeaders);
      }
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    const route = url.pathname.replace(/^\/+/, '');

    try {
      switch (route) {
        case 'gemini':
          return await handleGemini(request, env, corsHeaders);
        case 'openai':
          return await handleOpenAI(request, env, corsHeaders);
        case 'groq':
          return await handleGroq(request, env, corsHeaders);
        case 'jina':
          return await handleJina(request, env, corsHeaders);
        default:
          return json({ error: 'Not found' }, 404, corsHeaders);
      }
    } catch (err) {
      return json({ error: err.message || 'Proxy error' }, 500, corsHeaders);
    }
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, ...JSON_HEADERS } });
}

function getKeyPool(envVar) {
  return (envVar || '').split(',').map((k) => k.trim()).filter(Boolean);
}

// Tries each key in the pool in turn; returns the first successful upstream response.
async function tryKeys(keys, callFn) {
  if (keys.length === 0) throw new Error('No API keys configured on the server for this provider');
  let lastError = null;
  for (const key of keys) {
    try {
      const res = await callFn(key);
      if (res.ok) return res;
      lastError = new Error(`Upstream rejected request (status ${res.status})`);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

async function handleGemini(request, env, corsHeaders) {
  const body = await request.json();
  const keys = getKeyPool(env.GEMINI_API_KEYS);
  const res = await tryKeys(keys, (key) =>
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    })
  );
  const data = await res.json();
  return json(data, 200, corsHeaders);
}

async function handleOpenAI(request, env, corsHeaders) {
  const body = await request.json();
  const keys = getKeyPool(env.OPENAI_API_KEYS);
  const res = await tryKeys(keys, (key) =>
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    })
  );
  const data = await res.json();
  return json(data, 200, corsHeaders);
}

async function handleGroq(request, env, corsHeaders) {
  const body = await request.json();
  const keys = getKeyPool(env.GROQ_API_KEYS);
  const res = await tryKeys(keys, (key) =>
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    })
  );
  const data = await res.json();
  return json(data, 200, corsHeaders);
}

// Body shape: { payload: {...}, endpoint?: "https://r.jina.ai/" }
// `endpoint` lets the client pick which Jina API (reader, search, embeddings...)
// without ever handling the key itself. Defaults to the Reader API.
async function handleJina(request, env, corsHeaders) {
  const body = await request.json();
  const keys = getKeyPool(env.JINA_API_KEYS);
  const target = body.endpoint || 'https://r.jina.ai/';
  const res = await tryKeys(keys, (key) =>
    fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body.payload || {}),
    })
  );
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : { text: await res.text() };
  return json(data, 200, corsHeaders);
}
