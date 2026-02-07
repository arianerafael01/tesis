## AWS Cheatsheet (números y decisiones)

### SQS
- Tipos: Standard (al menos una vez, posible desorden) vs FIFO (exactamente una vez efectivo, orden por groupId).
- Long polling: 0–20s; Visibility Timeout: hasta 12h; Retention: 1 min–14 días.
- DLQ y redrive policy; deduplicación FIFO (5 min window) por `MessageDeduplicationId`.
- Métricas: ApproximateNumberOfMessages{Visible,NotVisible,Delayed}; AgeOfOldestMessage.

### Kinesis Data Streams
- Shard: 1 MB/s write, 2 MB/s read, 1000 records/s por shard.
- Ordering por `partitionKey`. Reshard (split/merge) sin downtime.
- Retention: 24h–365 días; Enhanced fan-out: 2 MB/s por consumidor.
- Producers: aglutinación (KPL) reduce costo; consumidores con checkpoints.

### Lambda
- Concurrency: reserved/provisioned; cold start mitiga con provisioned.
- Retries: invocación async (2 reintentos con backoff); destinos on-failure; DLQ.
- Límite duración: 15 min; tamaño paquete: ~50MB zipped; env vars cifradas.

### API Gateway / ALB
- API Gateway: throttling integrado, WAF, authorizers, integración con Lambda.
- ALB: HTTP/2, websockets, balanceo a ECS/EKS/EC2; sticky sessions opcional.

### DynamoDB
- Clave partición compuesta; RCU/WCU; on-demand vs provisioned + autoscaling.
- Transacciones; TTL; streams para reacciones asincrónicas.

### ElastiCache (Redis)
- Cache-aside; TTL; locking para evitar stampede; Pub/Sub y streams según caso.

### Decisiones rápidas
- SQS vs Kinesis: cola de tareas vs stream ordenado/analítico; fan-out y replay → Kinesis.
- FIFO vs Standard: ordering/dup estricto y throughput bajo → FIFO; escala y simplicidad → Standard.
- Lambda vs EKS/ECS: ráfagas/event-driven → Lambda; control fino/latencia sostenida → contenedores.




