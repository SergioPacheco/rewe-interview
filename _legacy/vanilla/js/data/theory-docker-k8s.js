/**
 * Theory — Docker & Kubernetes
 * Containers, Dockerfile, Pods, Deployments, Probes, Scaling
 */
const theoryDockerK8s = [
  {
    id: 'theory-docker-basics',
    title: 'Docker — Containers & Images',
    sections: [
      {
        heading: 'Why containers?',
        content: `<strong>Problem:</strong> "It works on my machine" — different environments have different dependencies, OS versions, configurations.

<strong>Solution:</strong> Package your application + ALL its dependencies into a container that runs identically everywhere.

<pre><code>Traditional:  App → depends on OS, JDK version, libraries, config → "works on dev, breaks on prod"
Containers:   App + JDK + config + dependencies → single image → runs same everywhere</code></pre>

<strong>Docker concepts:</strong>
• <strong>Image:</strong> read-only template (like a class) — built from Dockerfile
• <strong>Container:</strong> running instance of an image (like an object)
• <strong>Registry:</strong> stores images (Docker Hub, company registry)
• <strong>Dockerfile:</strong> recipe to build an image`
      },
      {
        heading: 'Dockerfile for Spring Boot',
        content: `<pre><code># Multi-stage build — smaller final image
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/delivery-service-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]</code></pre>

<strong>Best practices:</strong>
• Multi-stage: build with JDK, run with JRE only (smaller image)
• .dockerignore: exclude target/, .git/, IDE files
• Non-root user: \`RUN useradd -r appuser && USER appuser\`
• Health check: \`HEALTHCHECK CMD curl -f http://localhost:8080/actuator/health\`
• Layer caching: copy pom.xml first (dependencies cached), then src (changes frequently)`
      },
      {
        heading: 'Docker Compose for local development',
        content: `<pre><code># docker-compose.yml — full local environment
services:
  delivery-service:
    build: .
    ports: ["8080:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/delivery
    depends_on: [db, kafka]

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: delivery
      POSTGRES_PASSWORD: dev123
    ports: ["5432:5432"]

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports: ["9092:9092"]
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092</code></pre>

\`docker compose up\` → full stack running locally in seconds.

<strong>Java EE comparison:</strong> Instead of installing WildFly + PostgreSQL + ActiveMQ manually, you define everything in one file and spin it up/down instantly.`
      }
    ]
  },
  {
    id: 'theory-k8s-pods',
    title: 'Kubernetes — Pods & Deployments',
    sections: [
      {
        heading: 'What is Kubernetes?',
        content: `Kubernetes (K8s) = orchestrator that manages containers in production: scheduling, scaling, healing, networking, load balancing.

<pre><code>Your container (Docker image)
       │
       ▼
Pod (smallest deployable unit — 1+ containers)
       │
       ▼
Deployment (manages N pod replicas — rolling updates)
       │
       ▼
Service (stable network endpoint — load balances across pods)
       │
       ▼
Ingress (external traffic → Service)</code></pre>

<strong>Key concepts:</strong>
• <strong>Pod:</strong> one or more containers that share network/storage (usually 1 container per pod)
• <strong>Deployment:</strong> declares desired state ("I want 3 replicas of delivery-service v2.1")
• <strong>Service:</strong> stable DNS name + load balancing (pods come and go, service stays)
• <strong>ConfigMap/Secret:</strong> externalized configuration`
      },
      {
        heading: 'Deployment manifest',
        content: `<pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: delivery-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: delivery-service
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0     # never go below 3
      maxSurge: 1           # add 1 new before removing old
  template:
    spec:
      containers:
      - name: delivery-service
        image: registry.rewe.io/delivery-service:2.1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password</code></pre>

<strong>What this means:</strong>
• 3 replicas running simultaneously (high availability)
• Rolling update: new version deployed without downtime
• Resource limits prevent one service from consuming all cluster resources
• Secrets for sensitive config (not in image!)`
      }
    ]
  },
  {
    id: 'theory-k8s-services',
    title: 'Kubernetes — Services, Probes & Scaling',
    sections: [
      {
        heading: 'Health probes',
        content: `Kubernetes uses probes to know if your pod is alive and ready:

<pre><code>livenessProbe:            # "Is the app alive?"
  httpGet:                # → if fails → K8s RESTARTS the pod
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:           # "Can the app accept traffic?"
  httpGet:                # → if fails → K8s REMOVES from load balancer
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5

startupProbe:             # "Is the app still starting?"
  httpGet:                # → gives slow apps time to start
    path: /actuator/health/liveness
    port: 8080
  failureThreshold: 30   # 30 × 10s = 5 minutes to start
  periodSeconds: 10</code></pre>

<strong>Rules:</strong>
• Liveness: NEVER include external dependencies (DB down ≠ restart the pod!)
• Readiness: CAN include critical dependencies (DB down → stop sending traffic)
• Don't make probes expensive (no heavy queries)
• Spring Boot Actuator provides these endpoints out of the box`
      },
      {
        heading: 'Scaling & Auto-scaling',
        content: `<pre><code># Manual scaling
kubectl scale deployment delivery-service --replicas=5

# Auto-scaling based on CPU
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: delivery-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: delivery-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # scale up when CPU > 70%</code></pre>

<strong>For REWE transport:</strong>
• Morning peak (route planning): auto-scale to 8 pods
• Night (low traffic): scale down to 2 pods
• Cost-efficient: only pay for resources you use

<strong>What your app needs for horizontal scaling:</strong>
• Stateless (no local state — use DB/Redis)
• Graceful shutdown (finish in-flight requests on SIGTERM)
• Health probes (K8s needs to know when ready)
• Externalized config (env vars, ConfigMaps)`
      },
      {
        heading: 'Graceful shutdown',
        content: `When Kubernetes terminates a pod (deploy, scale-down), your app must shut down cleanly:

<pre><code># Spring Boot application.yml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s</code></pre>

<strong>Shutdown sequence:</strong>
1. K8s sends SIGTERM to the pod
2. Pod removed from Service (no new traffic)
3. App stops accepting new requests
4. App finishes in-flight requests (up to 30s)
5. App closes DB connections, flushes buffers, commits Kafka offsets
6. App exits
7. If still running after terminationGracePeriodSeconds → SIGKILL (forced)

<strong>What goes wrong without graceful shutdown:</strong>
• In-flight requests get 502 errors
• Kafka offsets not committed → messages reprocessed
• DB transactions not committed → data loss
• File handles not closed → corruption`
      }
    ]
  }
];
