import { json } from '../lib/leaveStore.js';

export default async function handler(req, res) {
  return json(res, 410, { error: 'retired' });
}
