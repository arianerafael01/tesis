## Marco de respuesta (System Design)

1) Requisitos y KPIs: funcionales, no funcionales, SLOs (p95/p99), disponibilidad.
2) Estimaciones: QPS, tamaño de eventos, almacenamiento, crecimiento, picos.
3) API y modelo de datos: contratos, versionado, idempotency keys.
4) Arquitectura: sync vs async; colas/streams; caché; TTL; particionado.
5) Consistencia: strong vs eventual; ordering; idempotencia; deduplicación.
6) Escalado: horizontal, partición por clave; throughput por shard/partición.
7) Fallos: reintentos, backoff + jitter, DLQ, circuit breakers, timeouts.
8) Observabilidad: logs estructurados, métricas de negocio y sistema, tracing.
9) Seguridad y costos: IAM least-privilege, KMS, WAF; costo por QPS/GB/shard.

## Estimaciones rápidas

- 1 req/s ≈ 86,400 req/día. 100 req/s ≈ 8.64M/día.
- Tamaño medio evento (B) × QPS × 86,400 = GB/día.
- S3 y Kinesis costos dominan por volumen; SQS por requests; Lambda por invocaciones+duración.

## Patrones clave

- CQRS; Event Sourcing; Saga/Outbox; Cache-Aside/Write-Through; Rate Limiting/Token Bucket.
- Idempotencia: `idempotencyKey` + store con TTL (Dynamo/Redis) → upserts atómicos.
- Ordering por entidad: particionar por `userId` o `aggregateId`.

## Observabilidad mínima

- SLO: latencia p95, tasa error, disponibilidad.
- Métricas: throughput, retries, DLQ depth, lag de consumidores, saturación.
- Trazas: correlación `traceId`/`spanId` en logs; sampling configurable.

## Seguridad

- IAM least-privilege; secretos en Secrets Manager/SSM; cifrado KMS en reposo y en tránsito (TLS).
- Validación de entrada; WAF/Rate limiting; auditoría de cambios.

## Plantilla de apertura (3–4 min)

- Aclarar alcance, SLAs, volúmenes (tráfico pico/medio), canales, retención de datos, compliance.
- Proponer topología: API → cola/stream → workers; cache; almacenamientos.
- Llamar trade-offs y riesgos; confirmar prioridades (latencia vs costo vs simplicidad).

## Plantilla de cierre (1–2 min)

- Riesgos/mitigaciones; roadmap incremental; pruebas de carga; costos estimados.

## Ejemplo de API (notificaciones)

POST /notifications
{
  "idempotencyKey": "uuid",
  "userId": "u123",
  "channels": ["email", "push"],
  "template": "welcome",
  "data": {"name": "Ana"},
  "priority": "high"
}

GET /notifications/{id}/status → { status: "queued|sent|partial|failed" }




