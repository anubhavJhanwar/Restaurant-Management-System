# 🚀 BurgerBoss Vercel Deployment Guide

This guide will help you deploy BurgerBoss to Vercel for production use.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Database Service** (Recommended for production)

## 🗄️ Database Setup (IMPORTANT)

**⚠️ Note**: The current SQLite setup won't work on Vercel in production. You need a cloud database.

### Recommended Database Services:

#### Option 1: PlanetScale (MySQL) - Recommended
1. Go to [planetscale.com](https://planetscale.com)
2. Create a free account
3. Create a new database
4. Get your connection string
5. Import your schema

#### Option 2: Supabase (PostgreSQL)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Use the provided PostgreSQL connection
4. Set up your tables

#### Option 3: Railway (PostgreSQL/MySQL)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add a database service
4. Get connection details

## 🚀 Vercel Deployment Steps

### Step 1: Prepare Your Repository
```bash
# Run the deployment preparation script
chmod +x deploy.sh
./deploy.sh

# Or manually:
npm install
cd client && npm install && npm run build && cd ..

# Commit and push all changes
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Your Repository**
   - Select your BurgerBoss repository from GitHub
   - Click "Import"

3. **Configure Project Settings**
   - **Project Name**: `burgerboss-restaurant` (or your preferred name)
   - **Framework Preset**: Other (Vercel will auto-detect React)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (uses vercel.json config)
   - **Output Directory**: Leave empty (uses vercel.json config)

4. **Environment Variables** (CRITICAL)
   Click "Environment Variables" and add:
   ```
   JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random
   NODE_ENV=production
   ```
   
   **Note**: For production, you should use a cloud database instead of SQLite.

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (3-5 minutes)
   - Vercel will build both the React client and Node.js API

### Step 3: Update CORS Configuration

After deployment, update the CORS origin in `api/index.js`:
```javascript
app.use(cors({
  origin: ['https://your-actual-vercel-url.vercel.app'],
  credentials: true
}));
```

## 🔧 Post-Deployment Setup

### 1. Database Migration
If using a cloud database, you'll need to:
1. Create all the required tables
2. Set up initial data
3. Configure proper indexes

### 2. Test Your Deployment
1. Visit your Vercel URL
2. Test user registration/login
3. Verify all features work
4. Check admin controls

### 3. Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Domains"
3. Add your custom domain
4. Update DNS settings

## 🛡️ Security Checklist

- [ ] Strong JWT_SECRET set in environment variables
- [ ] Database connection secured with SSL
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] No sensitive data in client-side code

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database service is running
   - Ensure IP whitelist includes Vercel IPs

2. **CORS Errors**
   - Update CORS origin with your actual Vercel URL
   - Redeploy after changes

3. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are listed in package.json

4. **API Routes Not Working**
   - Ensure vercel.json is properly configured
   - Check API routes start with `/api/`

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connectivity
4. Review CORS configuration

## 🎉 Success!

Once deployed, your BurgerBoss will be available at:
`https://your-project-name.vercel.app`

Users can access it from any device with internet connection!

---

**Note**: Remember to update API URLs in your client code to use the production domain instead of localhost.