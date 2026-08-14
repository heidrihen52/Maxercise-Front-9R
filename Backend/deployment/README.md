# Deployment & Infrastructure Tests

Scripts automatizados para la carta de liberación de software.

## Pruebas incluidas

| # | Script | Herramienta | Meta |
|---|--------|-------------|------|
| 1 | `app_load_test.js` | k6 | 300 RPS, p95 < 250ms |
| 2 | `db_stress_test.js` | Node + Prisma | 100 consultas simultáneas |
| 3 | `nginx.conf` | NGINX | Balanceo activo-pasivo + failover |
| 4 | `dns_latency_test.sh` | Bash | Resolución DNS < 50ms |
| 5 | `ssl_security_check.sh` | Bash + OpenSSL | TLS 1.3 + headers de seguridad |

## Ejecución

```bash
# 1. Load test (requiere k6 instalado)
k6 run deployment/app_load_test.js

# 2. DB stress test (requiere DATABASE_URL y servidor MySQL activo)
node deployment/db_stress_test.js

# 3. NGINX (copiar a /etc/nginx/sites-available/)
sudo cp deployment/nginx.conf /etc/nginx/sites-available/adaptive-exercise
sudo nginx -t && sudo systemctl reload nginx

# 4. DNS latency
bash deployment/dns_latency_test.sh localhost

# 5. SSL/TLS audit
bash deployment/ssl_security_check.sh https://localhost:443
```

## Requisitos previos

- **k6**: https://k6.io/docs/get-started/installation/
- **Node.js** con `@prisma/client` generado
- **MySQL** accesible vía `DATABASE_URL`
- **NGINX** con certificados SSL en `/etc/ssl/`
- **OpenSSL** y **curl** para auditoría SSL
