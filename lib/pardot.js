// Sends a leave chart sign-up to the Pardot form handler "FedRetire – 2027 Leave Chart".
// That handler tags the prospect "Leave Chart 2027" and adds them to the
// Dennis Damp FedRetire Email List. Override the URL with PARDOT_FORM_HANDLER_URL if needed.
const DEFAULT_URL = 'https://www2.unitedbenefits.com/l/860683/2026-11-11/2p7sdy';

export async function sendToPardot({ email, firstName, lastName }) {
  const url = process.env.PARDOT_FORM_HANDLER_URL || DEFAULT_URL;
  if (!url || !email) return false;
  const body = new URLSearchParams({ email });
  if (firstName) body.set('first_name', firstName);
  if (lastName) body.set('last_name', lastName);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      redirect: 'manual',
      signal: ctrl.signal,
    });
    // Pardot answers a form handler post with a redirect to the success location.
    return res.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
