import { clientIp, clip, getSupabase, json, rateLimited, readJson, tokenPair, validEmail } from '../lib/leaveStore.js';

export const config = { api: { bodyParser: { sizeLimit: '32kb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method' });
  const supabase = getSupabase();
  if (!supabase) return json(res, 503, { error: 'unconfigured' });
  if (rateLimited('signup:' + clientIp(req), 8, 10 * 60 * 1000)) return json(res, 429, { error: 'rate' });

  let body;
  try { body = readJson(req); }
  catch { return json(res, 400, { error: 'json' }); }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!validEmail(email)) return json(res, 400, { error: 'email' });

  const first = clip(body.first_name, 80);
  const last = clip(body.last_name, 80);
  const agency = clip(body.agency, 160);
  const explicitName = clip(body.name, 160);
  const name = explicitName || [first, last].filter(Boolean).join(' ') || null;
  const extra = (first || last || agency) ? { first_name: first, last_name: last, agency } : null;
  const { token, token_hash } = tokenPair();
  const user_agent = clip(req.headers['user-agent'], 400);

  const { error } = await supabase.from('leave_chart_signups').upsert({
    email,
    name,
    extra,
    token_hash,
    user_agent,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: 'email' });
  if (error) return json(res, 500, { error: 'save' });
  return json(res, 200, { token });
}
