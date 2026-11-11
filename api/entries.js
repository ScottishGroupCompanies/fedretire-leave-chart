import { requireClerkUser, signupForClerkUser } from '../lib/clerkUser.js';
import { clientIp, getSupabase, json, MAX_BYTES, rateLimited, readJson } from '../lib/leaveStore.js';

export const config = { api: { bodyParser: { sizeLimit: '200kb' } } };

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') return json(res, 405, { error: 'method' });
  const supabase = getSupabase();
  if (!supabase || !process.env.CLERK_SECRET_KEY) return json(res, 503, { error: 'unconfigured' });

  const ip = clientIp(req);
  if (rateLimited('entries:' + ip, 60, 60 * 1000)) return json(res, 429, { error: 'rate' });

  const auth = await requireClerkUser(req);
  if (auth.status === 503) return json(res, 503, { error: 'unconfigured' });
  if (auth.status === 401) return json(res, 401, { error: 'auth' });
  if (auth.status !== 200) return json(res, 500, { error: 'auth' });
  if (rateLimited('entries-user:' + auth.user.id, 40, 60 * 1000)) return json(res, 429, { error: 'rate' });

  const found = await signupForClerkUser(supabase, auth.user);
  if (found.error) return json(res, 500, { error: 'lookup' });
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
