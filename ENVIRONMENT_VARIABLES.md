# Environment Variables

This document describes all environment variables used by the OHS Management System.

## Quick Start

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

## Required Variables

### `JWT_SECRET`
- **Purpose**: Secret key for signing JWT authentication tokens
- **Required**: Yes
- **Format**: String (minimum 32 characters recommended)
- **Generate**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Security**: Keep this secret! Anyone with this key can forge authentication tokens.

## Optional Variables

### `PORT`
- **Purpose**: Port for the Express server to listen on
- **Default**: `3000`
- **Example**: `PORT=8080`

### `NODE_ENV`
- **Purpose**: Node.js environment mode
- **Default**: `production`
- **Values**: `development` | `production` | `test`
- **Usage**: Set to `development` for local development with hot reloading

### `VITE_API_BASE_URL`
- **Purpose**: Base URL for API requests from the frontend
- **Default**: Auto-detected (localhost:3000 for dev, same-origin for production)
- **Example**: `VITE_API_BASE_URL=https://api.example.com`
- **Note**: Only needed if API and frontend are on different domains

### `DATA_DIR`
- **Purpose**: Directory for server-side data storage
- **Default**: `./server-data`
- **Example**: `DATA_DIR=/var/lib/ohs-data`

## Deployment Examples

### Local Development
```env
JWT_SECRET=dev-secret-not-for-production
PORT=3000
NODE_ENV=development
```

### Docker Deployment
```env
JWT_SECRET=your-secure-random-secret-here
PORT=3000
NODE_ENV=production
```

### Render/Railway Deployment
Set these in the platform's environment variables dashboard:
- `JWT_SECRET`: Generate a secure random string
- `NODE_ENV`: `production`
- `PORT`: Set by platform (Render: 3000, Railway: auto-assigned)

## Frontend Environment Variables

The frontend automatically detects the API URL:
- **Development** (localhost/127.0.0.1): Uses `http://localhost:3000`
- **Production**: Uses same-origin (empty base URL), assuming API and frontend are served from the same domain

To override, set `window.__API_BASE_URL__` before loading the app:
```html
<script>window.__API_BASE_URL__ = 'https://api.example.com';</script>
```

## Security Best Practices

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use strong secrets** - Generate cryptographically secure random strings
3. **Rotate secrets** - Change `JWT_SECRET` periodically
4. **Use different secrets per environment** - Dev, staging, and production should all have unique secrets
5. **Store secrets securely** - Use platform secret managers (Render env vars, Railway env vars, etc.)
