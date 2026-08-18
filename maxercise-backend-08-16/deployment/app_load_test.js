/**
 * Prueba de carga - Servidor de Aplicaciones (Node.js Express)
 * Herramienta: k6 (https://k6.io)
 *
 * Meta: 300 RPS con latencia p95 < 250ms
 *
 * Ejecución:
 *   k6 run deployment/app_load_test.js
 *   k6 run -e BASE_URL=http://localhost:3000 deployment/app_load_test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const healthLatency = new Trend('health_latency', true);

export const options = {
  scenarios: {
    load_test: {
      executor: 'constant-arrival-rate',
      rate: 300,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 100,
      maxVUs: 500,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<250'],
    errors: ['rate<0.01'],
    health_latency: ['p(95)<250'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/health`, {
    tags: { name: 'health_check' },
  });

  healthLatency.add(res.timings.duration);

  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
    'body has success': (r) => r.body && r.body.includes('"success":true'),
  });

  errorRate.add(!ok);
  sleep(0.01);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] ?? 0;
  const passed = p95 < 250;

  return {
    stdout: [
      '',
      '=== APP LOAD TEST SUMMARY ===',
      `Target: 300 RPS | p95 < 250ms`,
      `Actual p95: ${p95.toFixed(2)}ms`,
      `Result: ${passed ? 'PASS' : 'FAIL'}`,
      '',
    ].join('\n'),
  };
}
