#!/usr/bin/env bash
# =============================================================================
# SSL/TLS Security Audit Checklist
# Verifica TLS 1.3, certificado y encabezados de seguridad
#
# Uso:
#   bash deployment/ssl_security_check.sh
#   bash deployment/ssl_security_check.sh https://localhost:443
# =============================================================================

set -euo pipefail

TARGET="${1:-https://localhost:443}"
HOST=$(echo "$TARGET" | sed -E 's|https?://([^/:]+).*|\1|')
PORT=$(echo "$TARGET" | sed -E 's|.*:([0-9]+)$|\1|')
PORT=${PORT:-443}

PASS=0
FAIL=0
WARN=0

check_pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
check_fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }
check_warn() { echo "  [WARN] $1"; WARN=$((WARN + 1)); }

echo "=== SSL/TLS SECURITY CHECK ==="
echo "Target: $TARGET"
echo ""

# 1. TLS 1.3 support
echo "--- TLS Protocol ---"
if command -v openssl &>/dev/null; then
  tls13=$(echo | openssl s_client -connect "${HOST}:${PORT}" -tls1_3 2>/dev/null | grep -i "Protocol" || true)
  if echo "$tls13" | grep -qi "TLSv1.3"; then
    check_pass "TLS 1.3 negociado correctamente"
  else
    check_fail "TLS 1.3 no disponible (requerido)"
  fi

  tls10=$(echo | openssl s_client -connect "${HOST}:${PORT}" -tls1 2>/dev/null | grep -i "Protocol" || true)
  if echo "$tls10" | grep -qi "TLSv1 "; then
    check_fail "TLS 1.0 aún habilitado (debe deshabilitarse)"
  else
    check_pass "TLS 1.0 deshabilitado"
  fi
else
  check_warn "openssl no instalado, omitiendo verificación TLS"
fi

# 2. Certificate validity
echo ""
echo "--- Certificate ---"
if command -v openssl &>/dev/null; then
  cert_info=$(echo | openssl s_client -connect "${HOST}:${PORT}" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || true)
  if [ -n "$cert_info" ]; then
    check_pass "Certificado presente"
    echo "       $cert_info" | tr '\n' ' '
    echo ""
  else
    check_fail "No se pudo obtener certificado"
  fi
fi

# 3. Security headers
echo ""
echo "--- Security Headers ---"
if command -v curl &>/dev/null; then
  headers=$(curl -skI "$TARGET" 2>/dev/null || true)

  for header in \
    "Strict-Transport-Security" \
    "X-Frame-Options" \
    "X-Content-Type-Options" \
    "X-XSS-Protection" \
    "Referrer-Policy" \
    "Content-Security-Policy"; do

    if echo "$headers" | grep -qi "^${header}:"; then
      check_pass "$header presente"
    else
      check_fail "$header ausente"
    fi
  done
else
  check_warn "curl no instalado, omitiendo verificación de headers"
fi

# Summary
echo ""
echo "=== SUMMARY ==="
echo "  Passed:  $PASS"
echo "  Failed:  $FAIL"
echo "  Warnings: $WARN"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo "Result: PASS"
  exit 0
else
  echo "Result: FAIL ($FAIL checks failed)"
  exit 1
fi
