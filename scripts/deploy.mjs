/**
 * Deploys the storefront to both hosts, so they never drift apart:
 * Oxygen first (Shopify's checkout links back to it after a payment),
 * then Cloudflare Workers (the public address).
 * Oxygen refuses to deploy a repo with uncommitted changes; that stops
 * the script before Cloudflare, so both always run the same commit.
 * The Oxygen token is read from SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN in .env.
 */
import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const token = readFileSync('.env', 'utf8')
  .split(/\r?\n/)
  .find((line) => line.startsWith('SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN='))
  ?.split('=')
  .slice(1)
  .join('=')
  .replace(/^["']|["']$/g, '');

if (!token) {
  console.error('SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN is missing from .env');
  process.exit(1);
}

const run = (command, env = {}) =>
  execSync(command, {stdio: 'inherit', env: {...process.env, ...env}});

console.log('\n→ Oxygen\n');
run(`npx shopify hydrogen deploy --token ${token}`, {CI: 'true'});

console.log('\n→ Cloudflare Workers\n');
run('npx shopify hydrogen build');
run('npx wrangler deploy');
