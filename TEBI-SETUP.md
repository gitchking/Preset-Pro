# Tebi Storage Setup Guide

## Why Tebi?

✅ **50GB free storage** (vs 25MB in Cloudflare D1)
✅ **250GB free bandwidth** per month
✅ **No credit card required** (unlike Cloudflare R2)
✅ **S3-compatible API** (professional grade)
✅ **Direct download URLs** (true CDN)
✅ **Unlimited file sizes** (within storage limit)

## Setup Steps

### 1. Create Tebi Account

1. Go to [tebi.io](https://tebi.io)
2. Sign up for free account (no credit card required)
3. Verify your email

### 2. Create S3 Bucket

1. Login to Tebi dashboard
2. Go to "Buckets" section
3. Create new bucket: `preset-pro-files`
4. Set region: `global`
5. Enable public read access

### 3. Get API Credentials

1. Go to "Access Keys" in Tebi dashboard
2. Create new access key
3. Copy the Access Key ID and Secret Access Key

### 4. Configure Cloudflare Environment Variables

Add these to your Cloudflare Pages environment variables:

```
TEBI_ACCESS_KEY=your_access_key_here
TEBI_SECRET_KEY=your_secret_key_here
```

**How to add environment variables:**
1. Go to Cloudflare Dashboard → Pages → Your Site
2. Click "Settings" → "Environment variables"
3. Add both variables for Production and Preview

### 5. Deploy and Test

1. Deploy your changes:
   ```bash
   npm run deploy
   ```

2. Test Tebi upload:
   - Upload a preset with a file
   - Check console logs for "Tebi upload successful"
   - Verify download works

## Benefits vs Other Solutions

| Feature | Tebi | Cloudflare R2 | External Services |
|---------|------|---------------|-------------------|
| **Free Storage** | 50GB | Unlimited* | 100MB-512MB |
| **Credit Card** | ❌ None | ⚠️ Required | ❌ None |
| **File Limits** | Unlimited | Unlimited | Limited |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Setup** | Easy | Complex | Simple |
| **Direct URLs** | ✅ Yes | ✅ Yes | ✅ Yes |

*Cloudflare R2 requires credit card even for free tier

## Fallback Strategy

The system uses this priority:

1. **Tebi** (primary) - 50GB free, no credit card
2. **Cloudflare D1** (fallback) - 25MB limit, always works

This ensures uploads always succeed, even if Tebi is unavailable.

## Cost Comparison

### Tebi Free Tier
- **Storage**: 50GB free
- **Bandwidth**: 250GB/month free
- **Requests**: Unlimited free
- **Cost**: $0/month for typical usage

### After Free Tier
- **Storage**: $0.023/GB/month
- **Bandwidth**: $0.09/GB
- **Still cheaper than most alternatives**

## Troubleshooting

### "Tebi storage not configured" Error
- Check environment variables are set correctly
- Redeploy after adding variables

### Upload Fails
- Check bucket permissions (should allow public read)
- Verify access key has write permissions
- Check file size (should be under storage limit)

### Downloads Don't Work
- Verify bucket has public read access
- Check CORS settings in Tebi dashboard

## Security Notes

- Access keys are stored securely in Cloudflare environment
- Files are uploaded through Cloudflare Workers (no client-side credentials)
- Public read access only (no public write)
- Signed URLs for additional security (optional)