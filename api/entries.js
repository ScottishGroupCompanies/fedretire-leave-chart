import { bearerToken, clientIp, getSupabase, hashToken, json, MAX_BYTES, rateLimited, readJson } from '../lib/leaveStore.js';

export const config = { api: { bodyParser: { sizeLimit: '200kb' } } };

async function signupFor(supabase, token) {
  const token_hash = hashToken(token);
  const { data, error } = await supabase.from('leave_chart_signups').select('id').eq('token_hash', token_hash).maybeSingle();
  if (error) return { error: true };
  if (!data) return { missing: true };
  return { signup: data };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') return json(res, 405, { error: 'method' });
  const supabase = getSupabase();
  if (!supabase) return json(res, 503, { error: 'unconfigured' });

  const token = bearerToken(req);
  if (!token) return json(res, 401, { error: 'auth' });
  const ip = clientIp(req);
  if (rateLimited('entries:' + ip, 60, 60 * 1000) || rateLimited('entries-token:' + token.slice(0, 12), 40, 60 * 1000)) {
    return json(res, 429, { error: 'rate' });
  }

  const found = await signupFor(supabase, token);
  if (found.error) return json(res, 500, { error: 'lookup' });
  if (found.missing) return json(res, 401, { error: 'auth' });
  const signupId = found.signup.id;

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('leave_chart_entries').select('data, updated_at').eq('signup_id', signupId).maybeSingle();
    if (error) return json(res, 500, { error: 'read' });
    if (!data) return json(res, 404, { data: null });
    return json(res, 200, { data: data.data, updated_at: data.updated_at });
  }

  let body;
  try { body = readJson(req); }
  catch { return json(res, 400, { error: 'json' }); }
  const data = body && Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : body;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return json(res, 400, { error: 'data' });
  let encoded;
  try { encoded = JSON.stringify(data); }
  catch { return json(res, 400, { error: 'data' }); }
  if (Buffer.byteLength(encoded, 'utf8') > MAX_BYTES) return json(res, 413, { error: 'size' });

  const updated_at = new Date().toISOString();
  const { error } = await supabase.from('leave_chart_entries').upsert({
    signup_id: signupId,
    data,
    updated_at,
  }, { onConflict: 'signup_id' });
  if (error) return json(res, 500, { error: 'save' });
  return json(res, 200, { updated_at });
}
