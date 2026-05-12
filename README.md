# Serverless Redis with Upstash compatibility

This repo provides an HTTP server that interacts with the Redis database via
HTTP requests. It supports compatibility with Upstash, a cloud service that
provides Redis.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/hBFwO4?referralCode=73cYCO)

### Technologies used:

- **Hono**: A lightweight framework for building high-performance HTTP servers
  in TypeScript. In this template, Hono is used to handle HTTP requests.
- **Deno**: A secure runtime for JavaScript and TypeScript.

### Why use this template:

- Simple setup and high performance thanks to Hono.
- Easy to deploy on Railway.
- Compatible with Upstash, a cloud service that provides Redis.

### Environment variables:

- `REDIS_URL` — connection string to the Redis instance (defaults to `redis://localhost:6379`).
- `SR_TOKEN` — bearer token required by clients.
- `PORT` / `HOST` — HTTP server bind address (default `0.0.0.0:3000`).
- `SR_IDLE_TIMEOUT_MS` — idle timeout for the Redis connection in milliseconds.
  Defaults to `0` (the connection is kept open for the lifetime of the process,
  matching the previous behaviour). Any value greater than `0` will close the
  Redis connection after that many milliseconds of inactivity and re-open it on
  the next request.

  Useful for platforms like [Railway serverless](https://docs.railway.com/deployments/serverless),
  where an active outbound TCP connection (e.g. to Redis) prevents the service
  from being put to sleep. Note that every reconnect pays the TCP/TLS/AUTH
  handshake cost, so pick a value that fits your traffic profile.
