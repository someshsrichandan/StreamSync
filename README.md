
# StreamSync: End-to-End Streaming Application

StreamSync is a demo application showcasing:

- **Backend** (Node.js/Express) for video streaming & user management
- **Frontend** (React/Vite) for a client interface
- **Redis** for storing stream status and user playlists
- **MinIO** for hosting and serving video content (HLS `.m3u8` and `.ts` files) instead of storing locally

The goal: **Seamless, scalable streaming** of pre-encoded HLS segments with real-time syncing for all users, using a “global timeline” or manual admin starts.

---

## Table of Contents

1. [What Does StreamSync Do?](#what-does-streamsync-do)
2. [Local Development (No Containers)](#local-development-no-containers)
   - [Frontend Setup](#frontend-setup)
   - [Backend Setup](#backend-setup)
3. [MinIO Setup (Local & Public Access)](#minio-setup-local--public-access)
   - [Installing MinIO](#installing-minio)
   - [Creating a Bucket & Policy](#creating-a-bucket--policy)
4. [Redis Setup (Windows / macOS / Linux)](#redis-setup-windows--macos--linux)
5. [Docker & Docker Compose](#docker--docker-compose)
   - [Dockerizing Backend & Frontend](#dockerizing-backend--frontend)
   - [docker-compose.yml Example](#docker-composeyml-example)
6. [Kubernetes Deployment (Optional)](#kubernetes-deployment-optional)
   - [Minikube / Local K8s](#minikube--local-k8s)
   - [Sample Kubernetes Manifests](#sample-kubernetes-manifests)
7. [Conclusion & Further Steps](#conclusion--further-steps)

---

## 1. What Does StreamSync Do?

**StreamSync** is a simplified streaming system that:

- Lets an **admin** upload video files in the backend
  - The backend uses **FFmpeg** to convert them into **HLS** segments
  - **MinIO** stores `.m3u8` + `.ts` files
- **Redis** tracks which video is currently streaming (if any)
- **Frontend** (React) has:
  - A user-facing player that fetches the HLS manifest from MinIO
  - An admin dashboard (optional) to start/stop streams, upload new videos, or see status
- The entire system is easily scalable or containerized.

Use cases:

- **Personal Netflix**-like streaming
- **Live event replays** with an offset-based timeline
- **Hackathon demo** to unify storage (MinIO), in-memory DB (Redis), simple Node server, and modern React UI

---

## 2. Local Development (No Containers)

If you prefer a quick local dev flow:

### 2.1 **Frontend Setup**

1. **Navigate to `frontend/` folder**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **(Optional) Create `.env`** if you have environment variables for Vite:
   ```bash
   # .env
   VITE_API_BASE_URL=http://localhost:3001
   ```
4. **Start Vite dev server**:
   ```bash
   npm run dev
   ```
5. By default, your React app is at **`http://localhost:5173`**.

### 2.2 **Backend Setup**

1. **Open another terminal** in `backend/`:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a `.env`** (if your backend uses environment variables):
   ```bash
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   MINIO_ENDPOINT=127.0.0.1
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET=streamsync
   ```
4. **Run the server**:
   ```bash
   node server.js
   ```
5. Now your API is at **`http://localhost:3001`**.

**Result:** React app at `5173` + Node backend at `3001` are running locally, using local Redis & MinIO (once set up).

---

## 3. MinIO Setup (Local & Public Access)

MinIO is an S3-compatible storage system used to store videos, HLS `.m3u8` and `.ts` segments.

### 3.1 Installing MinIO

- **Docker** approach:
  ```bash
  docker run -p 9000:9000 -p 9001:9001 \
    -e MINIO_ROOT_USER=minioadmin \
    -e MINIO_ROOT_PASSWORD=minioadmin \
    minio/minio server /data --console-address ":9001"
  ```
- **Binary** approach from [MinIO Downloads](https://min.io/download)

Then open the **MinIO Console** at `http://localhost:9001`.  
Default credentials: `minioadmin / minioadmin`.

### 3.2 Creating a Bucket & Policy

1. **In MinIO Console** → Buckets → **Create Bucket** named `streamsync`.
2. To allow your app to fetch `.m3u8` and `.ts` publicly:
   - Bucket → **⋮** → **Edit Policy**
   - Paste:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": ["s3:GetObject"],
         "Resource": ["arn:aws:s3:::streamsync/*"]
       }
     ]
   }
   ```
3. **Save**. Now your app can do `http://localhost:9000/streamsync/videos/.../playlist.m3u8`.

If you see `403 (Forbidden)`, re-check policy or minio logs.

---

## 4. Redis Setup (Windows / macOS / Linux)

**Redis** is an in-memory data structure store used by StreamSync to track current streaming video, user playlists, etc.

### 4.1 Windows

- Download from [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases) (for older builds) or from [Memurai](https://memurai.com/)
- Run `redis-server.exe`

### 4.2 Linux/macOS

```bash
sudo apt-get install redis-server
# or
brew install redis
redis-server
```

### 4.3 Test

```bash
redis-cli
> ping
PONG
```

---

## 5. Docker & Docker Compose

When you’re ready to containerize:

1. **Create Dockerfiles** for `backend` & `frontend`
2. **docker-compose.yml** to define services (backend, redis, minio, maybe frontend)

**Example**:

```yaml
version: '3.8'

services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    env_file:
      - ./backend/.env
    depends_on:
      - redis
      - minio

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

Then:

```bash
docker-compose up --build
```

---

## 6. Kubernetes Deployment (Optional)

For advanced scalability, you can run everything in a K8s cluster:

### 6.1 Minikube (Local K8s)

```bash
minikube start
```

### 6.2 Sample Manifests

- **`redis-deployment.yaml`**  
- **`minio-deployment.yaml`**  
- **`backend-deployment.yaml`**  
- **`frontend-deployment.yaml`**  
- **Services** for each to route traffic (ClusterIP/NodePort/Ingress)

**Example** (`backend-deployment.yaml` + Service):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: streamsync-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: your-dockerhub/streamsync-backend:latest
          env:
            - name: REDIS_HOST
              value: "redis-service"
            ...
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - port: 3001
      targetPort: 3001
  type: NodePort
```

Then:

```bash
kubectl apply -f k8s/
```

---

## 7. Conclusion & Further Steps

You’ve now seen how to:

1. **Run everything locally** (simple dev approach)
2. **Use MinIO** for video storage, with public read policy
3. **Use Redis** for in-memory data, tested locally or in Docker
4. **Containerize** with Docker Compose for easy multi-service deployment
5. **Scale** using Kubernetes for advanced scenarios

**Possible next improvements**:

