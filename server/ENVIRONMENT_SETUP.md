# Server Environment Setup

## Required Environment Variables

### For Render Deployment

You need to set the following environment variables in your Render project settings:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add the following variables:

#### Required Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-id-management
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Optional Variables:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=https://your-frontend-domain.vercel.app
PORT=5000
```

## How to Get MongoDB URI

1. **MongoDB Atlas** (Recommended):
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `student-id-management`

2. **Local MongoDB**:
   - Use: `mongodb://localhost:27017/student-id-management`

## Example MongoDB URI:
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/student-id-management
```

## JWT Secret
Generate a strong random string for JWT_SECRET. You can use:
- Online generators
- Node.js: `require('crypto').randomBytes(64).toString('hex')`

## After Setting Environment Variables

1. Redeploy your Render service
2. Check the logs to ensure MongoDB connection is successful
3. Test your API endpoints

## Troubleshooting

- If you see "MongoDB connection error", check your MONGODB_URI
- If you see "JWT_SECRET is not set", add the JWT_SECRET variable
- Make sure to redeploy after setting environment variables 