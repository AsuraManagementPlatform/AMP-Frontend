# Fixing Vite Connection Issues and Authentication Errors

## Issues Identified

### 1. Vite WebSocket Connection Failures
**Symptoms:**
- `Failed to load resource: net::ERR_CONNECTION_REFUSED`
- `WebSocket connection to 'ws://localhost:5173/?token=...' failed`
- `[vite] failed to connect to websocket`

### 2. Authentication Initialization Failure
**Symptoms:**
- `[Auth] Initialization failed`
- All environment variables set to "fillin" placeholder values

## Solutions Implemented

### 1. Fixed Vite Configuration
Updated `vite.config.ts` with proper server configuration:
- Added explicit HMR settings
- Set strict port configuration
- Defined localhost host explicitly

### 2. Enhanced Environment Variable Validation
- Added detection for placeholder values ("fillin", "changeme", etc.)
- Improved error messages with specific examples
- Created `.env.example` for reference

### 3. Better Error Handling in Auth Context
- Added environment variable validation before Keycloak initialization
- Enhanced error messages for configuration issues
- Added detailed logging for debugging

## Steps to Fix Your Setup

### Step 1: Configure Environment Variables
1. **Open your `.env` file**
2. **Replace placeholder values** with your actual configuration:

```env
# Keycloak Configuration
VITE_KEYCLOAK_URL="http://localhost:8080"  # Your Keycloak server URL
VITE_KEYCLOAK_REALM="your-realm-name"     # Your Keycloak realm
VITE_KEYCLOAK_CLIENT_ID="your-client-id"   # Your Keycloak client ID

# API Configuration  
VITE_API_BASE_URL="http://localhost:8000"  # Your backend API URL
```

### Step 2: Verify Your Keycloak Setup
Make sure you have:
1. **Keycloak server running** on the configured URL
2. **Realm created** with the name specified in your env
3. **Client configured** with the ID specified in your env
4. **Client settings:**
   - Access Type: `public` (for frontend apps)
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`
   - Standard Flow Enabled: `ON`

### Step 3: Verify Your Backend API
Ensure your backend:
1. **Is running** on the configured API URL
2. **Accepts CORS requests** from `http://localhost:5173`
3. **Is configured to validate Keycloak tokens**
4. **Has the `/api/user/me` endpoint** properly implemented

### Step 4: Test the Setup

#### 4.1 Test Keycloak Connection
```bash
# Test if Keycloak is accessible
curl http://localhost:8080/realms/your-realm-name/.well-known/openid_configuration
```

#### 4.2 Test Backend API
```bash
# Test if backend is accessible
curl http://localhost:8000/api/user/me
# Should return 401 (unauthorized) - this is expected without token
```

#### 4.3 Check Browser Console
After fixing the environment variables, check browser console for:
- Improved error messages
- Keycloak configuration logging
- Detailed authentication flow information

### Step 5: Common Configuration Examples

#### For Local Development with Docker
```env
VITE_KEYCLOAK_URL="http://localhost:8080"
VITE_KEYCLOAK_REALM="asura-platform"  
VITE_KEYCLOAK_CLIENT_ID="amp-frontend"
VITE_API_BASE_URL="http://localhost:8000"
```

#### For Local Development with External Keycloak
```env
VITE_KEYCLOAK_URL="https://keycloak.example.com"
VITE_KEYCLOAK_REALM="production"
VITE_KEYCLOAK_CLIENT_ID="amp-frontend"
VITE_API_BASE_URL="http://localhost:8000"
```

## Troubleshooting Steps

### If WebSocket Issues Persist:
1. **Check firewall settings** - Ensure localhost connections are allowed
2. **Try different browser** - Some browsers have stricter WebSocket policies
3. **Check antivirus software** - May block WebSocket connections
4. **Clear browser cache** - Old cached files might cause conflicts

### If Authentication Still Fails:
1. **Verify Keycloak is running**: Visit `http://localhost:8080` in browser
2. **Check realm configuration**: Ensure realm name matches exactly
3. **Verify client settings**: Ensure client ID and settings are correct
4. **Check backend logs**: Look for token validation errors
5. **Test with curl**: Manually test the authentication flow

### If 403 Errors Continue:
1. **Check user roles** in Keycloak admin panel
2. **Verify backend role validation** logic
3. **Check CORS headers** in network tab
4. **Ensure backend can reach Keycloak** for token validation

## Expected Console Output After Fix

After properly configuring your environment, you should see:
```
[Auth] Keycloak configuration: { url: "http://localhost:8080", realm: "your-realm", clientId: "your-client" }
[Keycloak] Ready. Authenticated: true/false
[Auth] Token exists: true
[API] Request details: { url: "http://localhost:8000/api/user/me", method: "GET", hasAuthHeader: true }
```

Instead of:
```
❌ Environment variables with placeholder values: ["VITE_KEYCLOAK_URL", "VITE_KEYCLOAK_REALM", ...]
[Auth] Initialization failed: Keycloak environment variables are not properly configured
```
