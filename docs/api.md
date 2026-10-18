# HR Management System - REST API Contract Specifications

**Document ID:** VGC-HR-API-001  
**Version:** 1.0.0  
**Root Discovery:** `http://localhost:3000/api`  
**v1 Base URL:** `http://localhost:3000/api/v1`  

---

## 0. API Gateway & Versioning Architecture

The backend separates transport routing (`src/api/`) from domain services (`src/features/`):
- `GET /api` — Returns API version discovery metadata, active versions, and documentation links.
- `GET /api/v1/...` — Production Version 1 feature endpoints (`auth`, `users`, `health`).
- `GET /api/v2/...` — Reserved for future non-breaking version extensions.

---

## 1. Global Response Envelopes

Every endpoint returns a standardized response envelope containing correlation metadata and timestamps.

### 1.1 Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... },
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-10-18T14:30:00.000Z"
}
```

### 1.2 Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for incoming payload",
    "details": [
      {
        "path": "email",
        "message": "Invalid email address format"
      }
    ]
  },
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-10-18T14:30:00.000Z"
}
```

---

## 2. Authentication Endpoints (`/api/v1/auth`)

### 2.1 Register User
* **Method:** `POST /api/v1/auth/register`
* **Rate Limit:** 10 requests / minute
* **Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c1f7b8e2-...",
      "email": "employee@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "tokenType": "Bearer",
      "expiresIn": "15m"
    }
  }
}
```

### 2.2 Login User
* **Method:** `POST /api/v1/auth/login`
* **Rate Limit:** 10 requests / minute
* **Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "Password123"
}
```
* **Response (200 OK):** Same as Register.

### 2.3 Logout User
* **Method:** `POST /api/v1/auth/logout`
* **Auth:** Bearer Token
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### 2.4 Refresh Access Token
* **Method:** `POST /api/v1/auth/refresh`
* **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "expiresIn": "15m"
  }
}
```

### 2.5 Current User Profile
* **Method:** `GET /api/v1/auth/me`
* **Auth:** Bearer Token
* **Response (200 OK):** User details.

---

## 3. User Directory Endpoints (`/api/v1/users`)

### 3.1 Get Profile
* **Method:** `GET /api/v1/users/profile`
* **Auth:** Bearer Token

### 3.2 Update Profile
* **Method:** `PATCH /api/v1/users/profile`
* **Auth:** Bearer Token
* **Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe"
}
```

### 3.3 List Users (Admin Only)
* **Method:** `GET /api/v1/users?page=1&limit=20&search=john`
* **Auth:** Bearer Token (`role === 'ADMIN'`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [ ...users... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

## 4. Telemetry Endpoint (`/health`)

* **Method:** `GET /health`
* **Auth:** Public
* **Response (200 OK / 503 Service Unavailable):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "up",
      "redis": "up"
    },
    "uptime": 1245.8,
    "version": "1.0.0"
  }
}
```
