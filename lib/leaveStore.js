import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';

export const MAX_BYTES = 200 * 1024;

const hits = new Map();

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim().slice(0, 80);
  return String((req.socket && req.socket.remoteAddress) || 'unknown').slice(0, 80);
}

/** Light in-memory limit. Each serverless instance keeps its own counters. */
export function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export function tokenPair() {
  const token = randomBytes(32).toString('hex');
  return { token, token_hash: hashToken(token) };
}

export function hashToken(token) {
  return createHash('sha256').update(String(token), 'utf8').digest('hex');
}

export function bearerToken(req) {
  const raw = req.headers.authorization || req.headers.Authorization || '';
  const m = /^Bearer\s+([a-f0-9]{64})$/i.exec(String(raw).trim());
  return m ? m[1].toLowerCase() : '';
}

export function readJson(req) {
  if (req.body == null || req.body === '') return {};
  if (typeof req.body === 'string') return JSON.parse(req.body);
  if (typeof req.body === 'object') return req.body;
  return {};
}

export function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(body);
}

export function clip(value, max) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

export function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
