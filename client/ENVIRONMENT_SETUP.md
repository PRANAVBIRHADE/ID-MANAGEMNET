# Environment Setup for Frontend Deployment

## Required Environment Variables

### For Vercel Deployment

You need to set the following environment variable in your Vercel project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variable:

```
Name: REACT_APP_BACKEND_URL
Value: https://your-backend-service.onrender.com
```

Replace `your-backend-service.onrender.com` with your actual Render backend URL.

## How to Find Your Render Backend URL

1. Go to your Render dashboard
2. Find your backend service
3. Copy the URL from the service overview
4. It should look like: `https://your-app-name.onrender.com`

## Example

If your Render backend is deployed at `https://id-management-api.onrender.com`, then set:

```
REACT_APP_BACKEND_URL=https://id-management-api.onrender.com
```

## After Setting the Environment Variable

1. Redeploy your Vercel project
2. The frontend will now correctly call your backend API
3. Login and registration should work properly

## Troubleshooting

- If you see "405 Method Not Allowed" errors, it means the frontend is still calling its own `/api` routes instead of the backend
- Check that `REACT_APP_BACKEND_URL` is set correctly in Vercel
- Make sure to redeploy after setting the environment variable 