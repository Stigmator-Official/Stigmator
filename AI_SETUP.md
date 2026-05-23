# AI Garment Generation Setup

## Easiest Option: Leonardo.ai ⭐ (Recommended)

**Why:** Email signup, $15 free credits/month, instant approval

1. Go to https://leonardo.ai
2. Click "Start Creating" → Sign up with **email** (no GitHub needed)
3. Click your profile (top right) → "API Access"
4. Click "Subscribe to API Plan" (free tier available)
5. Click "Generate API Key"
6. Copy the key
7. Open `.env.local` and paste:
   ```
   LEONARDO_API_KEY=your-key-here
   ```

## Alternative Options

### Stability AI (25 free images)
- https://platform.stability.ai
- Email signup
- 25 free credits

### Hugging Face (Free but slower)
- https://huggingface.co
- Sign up → Settings → Access Tokens
- Free tier (may queue during peak times)

## Testing

After adding your key, restart the dev server:
```bash
npm run dev
```

Go to `/artist/garments/create` → Step 2 → Click **GENERATE NOW**

You should see a loading spinner for 5-30 seconds, then a generated garment image.

## Troubleshooting

**"Using mock" message?**
- API key not set correctly
- Check `.env.local` has the right variable name

**Generation fails?**
- Out of credits (check provider dashboard)
- Try a different provider
- Check browser console for error details

**Want more control?**
Each provider has different models and settings. Edit `src/app/api/ai/generate-garment/route.ts` to customize.
