/**
 * Stress test de conexiones MySQL vía Prisma
 * Meta: 100 consultas simultáneas sin agotar el pool
 *
 * Ejecución:
 *   node deployment/db_stress_test.js
 *   DATABASE_URL=mysql://... node deployment/db_stress_test.js
 */

const { PrismaClient } = require('@prisma/client');

const CONCURRENT_QUERIES = 100;
const POOL_LIMIT = 10;
const TIMEOUT_MS = 30000;

async function runQuery(prisma, index) {
  const start = Date.now();
  const result = await prisma.$queryRaw`SELECT 1 AS ok, ${index} AS query_id`;
  return { index, duration: Date.now() - start, result };
}

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  console.log('=== DB STRESS TEST ===');
  console.log(`Concurrent queries: ${CONCURRENT_QUERIES}`);
  console.log(`Expected pool limit: ${POOL_LIMIT}`);
  console.log('');

  const start = Date.now();
  const promises = Array.from({ length: CONCURRENT_QUERIES }, (_, i) => runQuery(prisma, i + 1));

  let results;
  try {
    results = await Promise.race([
      Promise.all(promises),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: pool exhausted or DB unreachable')), TIMEOUT_MS)
      ),
    ]);
  } catch (err) {
    console.error('FAIL:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }

  const totalTime = Date.now() - start;
  const durations = results.map((r) => r.duration);
  const maxDuration = Math.max(...durations);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p95 = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)];

  console.log(`Completed: ${results.length}/${CONCURRENT_QUERIES} queries`);
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Avg latency: ${avgDuration.toFixed(2)}ms`);
  console.log(`Max latency: ${maxDuration}ms`);
  console.log(`p95 latency: ${p95}ms`);
  console.log(`Result: ${results.length === CONCURRENT_QUERIES ? 'PASS' : 'FAIL'}`);

  await prisma.$disconnect();
  process.exit(results.length === CONCURRENT_QUERIES ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
