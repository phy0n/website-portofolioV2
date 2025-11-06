# Vercel Deployment Guide

## Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

```
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_USER_ID=your_discord_user_id_here
```

## Build Settings

Vercel should auto-detect Next.js settings, but if needed:

- **Framework Preset**: Next.js
- **Build Command**: `bun run build`
- **Output Directory**: `.next`
- **Install Command**: `bun install`

## Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Regenerate Discord Bot Token** before deploying if it was ever exposed
3. **Join Lanyard Discord** server for Discord status to work: https://discord.gg/lanyard

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes | Discord Bot Token from Developer Portal |
| `DISCORD_USER_ID` | Yes | Your Discord User ID (enable Developer Mode → right click profile → Copy User ID) |

## Deploy Steps

1. Push your code to GitHub (without `.env.local`)
2. Import repository in Vercel
3. Add environment variables in Vercel settings
4. Deploy!

## Troubleshooting

### Discord Avatar Not Loading
- Check if `DISCORD_TOKEN` and `DISCORD_USER_ID` are set in Vercel
- Verify bot token is valid
- Check Vercel function logs

### Discord Status Not Working
- Make sure you've joined Lanyard server: https://discord.gg/lanyard
- Wait a few seconds after joining
- Check browser console for errors

### Build Failed
- Check Vercel deployment logs
- Make sure all dependencies are in `package.json`
- Try building locally first: `bun run build`
