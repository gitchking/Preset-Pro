# Cloudflare R2 Setup Guide

## 1. Create R2 Bucket

```bash
# Create the R2 bucket
wrangler r2 bucket create preset-pro-files

# Create preview bucket (for development)
wrangler r2 bucket create preset-pro-files-preview
```

## 2. Update wrangler.toml

Add the R2 bucket configuration to your `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "PRESET_BUCKET"
bucket_name = "preset-pro-files"
preview_bucket_name = "preset-pro-files-preview"
```

## 3. Configure Custom Domain (Optional but Recommended)

### Option A: R2 Custom Domain
1. Go to Cloudflare Dashboard → R2 → Your Bucket
2. Click "Settings" → "Custom Domains"
3. Add a custom domain like `files.your-domain.com`
4. Update the R2 service to use your custom domain

### Option B: Workers Route (Simpler)
The current setup uses `/api/r2-download/[key]` which works immediately without additional configuration.

## 4. Update R2 Service (if using custom domain)

In `src/utils/r2Service.ts`, update the `uploadFile` method to return your custom domain URL:

```typescript
// Replace this line in r2-upload.js:
const publicUrl = `https://files.your-domain.com/${uniqueFileName}`;
```

## 5. Test the Setup

1. Deploy your changes:
   ```bash
   npm run deploy
   ```

2. Test R2 upload:
   ```bash
   curl -X POST https://your-site.pages.dev/api/r2-upload \
     -F "file=@test-file.zip"
   ```

## 6. Benefits of R2 vs External Services

✅ **Integrated**: Same Cloudflare account and billing
✅ **Unlimited**: No file size limits (practical limit ~5GB)
✅ **Fast**: Global CDN with edge caching
✅ **Reliable**: Enterprise-grade storage (99.999999999% durability)
✅ **Cost-effective**: Pay only for what you use
✅ **Direct URLs**: True CDN links for immediate downloads
✅ **Security**: Full control over access and permissions

## 7. Pricing

- **Storage**: $0.015 per GB per month
- **Downloads**: $0.36 per million requests
- **Uploads**: Free
- **Data transfer**: $0.00 (free egress to internet)

For a preset sharing site, costs are typically under $1/month for moderate usage.