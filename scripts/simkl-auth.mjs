#!/usr/bin/env node
/**
 * Simkl OAuth2 PKCE + PIN flow
 * Run: node scripts/simkl-auth.mjs
 * Stores access token in .env as SIMKL_ACCESS_TOKEN
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

const CLIENT_ID = '3b8da8bc2ff9ffc4ca420fdd1258b9375e82cfb070e72dd8c4340c65f1a05188';

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generatePKCE() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

async function getPinCode(challenge) {
  const url = `https://api.simkl.com/oauth/pin?app_id=${CLIENT_ID}&code_challenge=${challenge}&code_challenge_method=S256`;
  const res = await fetch(url);
  return res.json();
}

async function pollToken(userCode, verifier, interval = 5, maxTries = 60) {
  for (let i = 0; i < maxTries; i++) {
    await new Promise(r => setTimeout(r, interval * 1000));
    const res = await fetch('https://api.simkl.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: userCode,
        client_id: CLIENT_ID,
        code_verifier: verifier,
      }),
    });
    const data = await res.json();
    if (data.access_token) return data.access_token;
    if (data.error === 'grant_error') {
      process.stdout.write('.');
    } else {
      console.error('\nUnexpected response:', data);
    }
  }
  return null;
}

function writeEnvToken(token) {
  let contents = '';
  if (fs.existsSync(ENV_PATH)) {
    contents = fs.readFileSync(ENV_PATH, 'utf8');
    contents = contents.replace(/^SIMKL_ACCESS_TOKEN=.*$/m, '');
  }
  contents = contents.trim() + `\nSIMKL_ACCESS_TOKEN=${token}\n`;
  fs.writeFileSync(ENV_PATH, contents);
}

const { verifier, challenge } = generatePKCE();
const pin = await getPinCode(challenge);

console.log('\n=== Simkl Authentication ===');
console.log(`1. Go to: ${pin.verification_url}`);
console.log(`2. Enter code: \x1b[1;33m${pin.user_code}\x1b[0m`);
console.log(`3. Authorize the app`);
console.log(`\nWaiting for authorization (${pin.expires_in / 60} min)...\n`);

const token = await pollToken(pin.user_code, verifier, pin.interval, Math.floor(pin.expires_in / pin.interval));

if (token) {
  writeEnvToken(token);
  console.log(`\n\x1b[32mSuccess!\x1b[0m Token written to .env`);
  console.log('Rebuild the site to fetch your live Simkl watchlist.');
} else {
  console.error('\nTimed out or failed. Re-run the script to try again.');
  process.exit(1);
}
