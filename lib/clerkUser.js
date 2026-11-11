import { createClerkClient, verifyToken } from '@clerk/backend';
import { hashToken } from './leaveStore.js';

const PARTIES = [
  'https://leave.fedretire.net',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

function partiesFor(req) {
  const origin = String(req.headers.origin || '');
  const allowed = /^(https:\/\/leave\.fedretire\.net|http:\/\/(localhost|127\.0\.0\.1):\d+)$/.test(origin);
  return allowed ? [...new Set([...PARTIES, origin])] : PARTIES;
}

function sessionToken(req) {
  const raw = req.headers.authorization || req.headers.Authorization || '';
  const match = /^Bearer\s+(\S+)$/i.exec(String(raw).trim());
  if (!match) return '';
  const token = match[1];
  return token.split('.').length === 3 ? token : '';
}

function emailOf(user) {
  const primary = user.primaryEmailAddress?.emailAddress;
  if (primary) return primary.trim().toLowerCase();
  const match = (user.emailAddresses || []).find((entry) => entry.id === user.primaryEmailAddressId);
  const email = match?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';
  return String(email).trim().toLowerCase();
}

function displayName(user) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || null;
}

function mergeExtra(current, patch) {
  const base = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
  return { ...base, ...patch };
}

export async function requireClerkUser(req) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return { status: 503 };
  const token = sessionToken(req);
  if (!token) return { status: 401 };
  let payload;
  try {
    payload = await verifyToken(token, { secretKey, authorizedParties: partiesFor(req) });
  } catch {
    return { status: 401 };
  }
  if (!payload?.sub) return { status: 401 };
  try {
    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(payload.sub);
    const email = emailOf(user);
    if (!email) return { status: 401 };
    return {
      status: 200,
      user: {
        id: user.id,
        email,
        name: displayName(user),
        firstName: user.firstName || null,
        lastName: user.lastName || null,
      },
    };
  } catch {
    return { status: 500 };
  }
}

export async function signupForClerkUser(supabase, clerkUser) {
  const now = new Date().toISOString();
  const extraPatch = { clerk_user_id: clerkUser.id };
  if (clerkUser.firstName) extraPatch.first_name = clerkUser.firstName;
  if (clerkUser.lastName) extraPatch.last_name = clerkUser.lastName;

  const byId = await supabase
    .from('leave_chart_signups')
    .select('id, extra')
    .contains('extra', { clerk_user_id: clerkUser.id })
    .maybeSingle();
  if (byId.error) return { error: true };
  if (byId.data) {
    const patch = { extra: mergeExtra(byId.data.extra, extraPatch), last_seen_at: now };
    if (clerkUser.name) patch.name = clerkUser.name;
    const { error } = await supabase.from('leave_chart_signups').update(patch).eq('id', byId.data.id);
    if (error) return { error: true };
    return { signup: { id: byId.data.id } };
  }

  const byEmail = await supabase
    .from('leave_chart_signups')
    .select('id, extra')
    .eq('email', clerkUser.email)
    .maybeSingle();
  if (byEmail.error) return { error: true };
  if (byEmail.data) {
    const patch = { extra: mergeExtra(byEmail.data.extra, extraPatch), last_seen_at: now };
    if (clerkUser.name) patch.name = clerkUser.name;
    const { error } = await supabase.from('leave_chart_signups').update(patch).eq('id', byEmail.data.id);
    if (error) return { error: true };
    return { signup: { id: byEmail.data.id } };
  }

  const { data, error } = await supabase.from('leave_chart_signups').insert({
    email: clerkUser.email,
    name: clerkUser.name,
    extra: extraPatch,
    token_hash: hashToken('clerk:' + clerkUser.id),
    last_seen_at: now,
  }).select('id').single();
  if (error || !data) return { error: true };
  return { signup: data };
}
