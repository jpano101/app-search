# App Search API

A simple Node.js/Express API with hello endpoints.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET /
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Welcome to the App Search API",
  "endpoints": {
    "hello": "/hello",
    "helloWithName": "/hello/:name"
  },
  "status": "running"
}
```

### GET /hello
Returns a simple hello message.

**Response:**
```json
{
  "message": "Hello, World!",
  "timestamp": "2023-12-05T19:00:00.000Z",
  "status": "success"
}
```

### GET /hello/:name
Returns a personalized hello message.

**Parameters:**
- `name` (string): The name to include in the greeting

**Example:** `GET /hello/John`

**Response:**
```json
{
  "message": "Hello, John!",
  "timestamp": "2023-12-05T19:00:00.000Z",
  "status": "success"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-05T19:00:00.000Z",
  "uptime": 123.456
}
```

## Testing

You can test the endpoints using curl:

```bash
# Basic hello
curl http://localhost:3000/hello

# Personalized hello
curl http://localhost:3000/hello/YourName

# Health check
curl http://localhost:3000/health
```
