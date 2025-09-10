# Troubleshooting 403 Forbidden Error with Keycloak Authentication

## Issue Summary
You're experiencing a 403 Forbidden error when the frontend tries to fetch user data from `/api/user/me` even though Keycloak authentication is successful.

## Enhanced Debugging Features Added

I've added comprehensive debugging features to help identify the root cause:

### 1. Enhanced Token Logging
- Token existence and expiry status
- Detailed token claims and user information
- Authorization header preview (without exposing sensitive data)

### 2. Enhanced API Request/Response Logging
- Request details (URL, method, auth header presence)
- Response details (status, data, errors)
- Specific 403 error detection and logging

### 3. Enhanced Error Context
- Detailed error information in development mode
- Better error messages and debugging data

## How to Debug

### Step 1: Check Browser Console
Run your application and check the browser console for detailed logs:

1. **Keycloak Authentication Logs**: Look for `[Keycloak]` prefixed messages
2. **Auth Context Logs**: Look for `[Auth]` prefixed messages  
3. **API Request Logs**: Look for `[API]` prefixed messages

### Step 2: Verify Token Information
The enhanced logging will show you:
- Token expiry time
- User claims (email, username, groups, roles)
- Token validity status

### Step 3: Check API Request Details
Look for logs showing:
- Full request URL being called
- Whether authorization header is present
- Response status and error details

## Common Causes and Solutions

### 1. Backend Not Configured for Keycloak
**Symptoms**: 403 error, backend doesn't recognize the token
**Solution**: Ensure your backend is configured to:
- Accept and validate Keycloak JWT tokens
- Use the correct Keycloak public key for token verification
- Match the realm and client configuration

### 2. CORS Issues
**Symptoms**: Network errors or 403 errors with CORS-related messages
**Solution**: Configure your backend to accept requests from your frontend origin:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 3. User Roles/Groups Not Configured
**Symptoms**: 403 error, token is valid but user lacks permissions
**Solution**: 
- Check if the user has required roles/groups in Keycloak
- Verify backend is correctly reading user roles from the token
- Ensure the `/api/user/me` endpoint doesn't require specific roles

### 4. Token Format Mismatch
**Symptoms**: Backend rejects otherwise valid tokens
**Solution**: Verify:
- Backend expects `Bearer ` prefix in Authorization header
- Token is not being double-encoded or modified
- Clock synchronization between Keycloak and backend

### 5. Backend Service Discovery Issues
**Symptoms**: 403 errors, backend can't validate tokens
**Solution**: Ensure backend can reach Keycloak for token validation:
- Network connectivity between backend and Keycloak
- Correct Keycloak URL configuration in backend
- Firewall/security group settings

## Debugging Steps

### 1. Test Token with Backend Directly
Copy the token from browser console and test directly:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:8000/api/user/me
```

### 2. Check Backend Logs
Look for:
- Token validation errors
- Permission/authorization failures
- CORS rejection messages
- Connection errors to Keycloak

### 3. Verify Keycloak Configuration
- User exists and is active
- User has appropriate roles/groups
- Client configuration allows the intended access
- Token settings (lifespan, refresh settings)

### 4. Network Analysis
Use browser DevTools Network tab to inspect:
- Request headers (Authorization header presence)
- Response headers (CORS headers)
- Response body (error details)

## Next Steps

1. **Run the application** and check the enhanced console logs
2. **Copy the detailed error information** from the console
3. **Test the API endpoint directly** using the token
4. **Check your backend logs** for corresponding error messages
5. **Verify Keycloak user configuration** and permissions

## Environment Variables to Verify

Ensure these are correctly set:
- `VITE_KEYCLOAK_URL` - Points to your Keycloak server
- `VITE_KEYCLOAK_REALM` - Correct realm name
- `VITE_KEYCLOAK_CLIENT_ID` - Correct client ID
- `VITE_API_BASE_URL` - Points to your backend API

The enhanced debugging will help pinpoint exactly where the authentication flow is failing.
