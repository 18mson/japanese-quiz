import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const poolsPath = path.resolve(__dirname, '../data/pools.json');
const poolsData = JSON.parse(fs.readFileSync(poolsPath, 'utf-8'));
export const POOLS = poolsData.pools;

/**
 * Resolves a pool by name, recursively merging include and applying exclude.
 * Also deduplicates items by compound jp keys (jp, jp2, jp3, jp4).
 * @param {string} poolName
 * @returns {any[]}
 */
export function resolvePool(poolName) {
  const pool = POOLS[poolName];
  if (!pool) {
    throw new Error(`Pool not found: ${poolName}`);
  }

  let items = [...(pool.items || [])];

  if (pool.include && Array.isArray(pool.include)) {
    for (const inc of pool.include) {
      items = items.concat(resolvePool(inc));
    }
  }

  if (pool.exclude && Array.isArray(pool.exclude)) {
    const excludeSet = new Set(pool.exclude);
    items = items.filter(it => !excludeSet.has(it.jp));
  }

  // Deduplicate items based on jp, jp2, jp3, jp4
  const seen = new Set();
  return items.filter(it => {
    const key = `${it.jp}__${it.jp2 || ''}__${it.jp3 || ''}__${it.jp4 || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
