#!/usr/bin/env bash
# =============================================================================
# DNS Latency Test
# Meta: resolución DNS < 50ms
#
# Uso:
#   bash deployment/dns_latency_test.sh
#   bash deployment/dns_latency_test.sh adaptive-exercise.local 8.8.8.8
# =============================================================================

set -euo pipefail

HOST="${1:-localhost}"
DNS_SERVER="${2:-}"
ITERATIONS="${3:-10}"
THRESHOLD_MS=50

echo "=== DNS LATENCY TEST ==="
echo "Host:       $HOST"
echo "Iterations: $ITERATIONS"
echo "Threshold:  ${THRESHOLD_MS}ms"
echo ""

total=0
passed=0

for i in $(seq 1 "$ITERATIONS"); do
  start_ns=$(date +%s%N)

  if [ -n "$DNS_SERVER" ]; then
    result=$(dig @"$DNS_SERVER" +time=2 +tries=1 +short "$HOST" A 2>/dev/null || true)
  else
    result=$(getent hosts "$HOST" 2>/dev/null | awk '{print $1}' || true)
    if [ -z "$result" ]; then
      result=$(nslookup "$HOST" 2>/dev/null | awk '/^Address: / { print $2; exit }' || true)
    fi
  fi

  end_ns=$(date +%s%N)
  elapsed_ms=$(( (end_ns - start_ns) / 1000000 ))
  total=$((total + elapsed_ms))

  status="FAIL"
  if [ "$elapsed_ms" -lt "$THRESHOLD_MS" ]; then
    status="PASS"
    passed=$((passed + 1))
  fi

  echo "  [$i/$ITERATIONS] ${elapsed_ms}ms -> $result [$status]"
done

avg=$(( total / ITERATIONS ))
echo ""
echo "Average latency: ${avg}ms"
echo "Passed: $passed/$ITERATIONS (threshold < ${THRESHOLD_MS}ms)"

if [ "$avg" -lt "$THRESHOLD_MS" ]; then
  echo "Result: PASS"
  exit 0
else
  echo "Result: FAIL"
  exit 1
fi
