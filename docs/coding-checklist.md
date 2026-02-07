## Checklist de Coding (Node/TS/React)

### Node/TypeScript servicios
- Timeouts en HTTP/DB y AbortController; límites de concurrencia (p-limit/p-queue).
- Retries exponenciales + jitter; idempotencia con store (Redis/Dynamo) y claves.
- Backpressure con `stream.pipeline`; manejar errores y `unpipe`.
- Logs estructurados (JSON) con correlation id; métricas (p95, tasa error, DLQ depth).
- Validación de entrada (zod/yup) y tipos estrictos; manejar errores con códigos claros.

### React/Next
- Evitar renders: `memo`, `useMemo`, `useCallback` en hot paths.
- Data fetching con React Query: `staleTime`, `cacheTime`, `queryKey`, invalidation.
- Listas grandes: virtualización; Suspense/transitions según caso.
- SSR/ISR: headers de caché e invalidación.

### Seguridad/Operación
- IAM least-privilege; secretos en Secrets Manager/SSM.
- Observabilidad: traces (OpenTelemetry), logs y métricas con etiquetas de negocio.
- Feature flags/canary; migraciones con compatibilidad hacia atrás.




