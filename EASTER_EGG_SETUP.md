# Easter Egg Setup Guide 🎉

## What Was Implemented

A special easter egg for student ID **1009104** that:
1. Plays a John Cena video at full volume when the student ID is entered
2. Prevents skipping (no controls, escape key disabled)
3. Replays the video every time they refresh and enter their ID
4. Shows confetti animation after the video ends
5. Then displays their actual QR code

## Setup Instructions

### Step 1: Place the Video File

Move your video file `Cenafy John Cena.mp4` to:
```
frontend/public/Cenafy John Cena.mp4
```

The `frontend/public/` folder has been created for you.

### Step 2: Test Locally

1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

2. Open the student check-in page
3. Enter student ID: `1009104`
4. The video should play at full volume!

### Step 3: Deploy

When you deploy to production (Vercel), the video file in `frontend/public/` will automatically be included in the build and served as a static asset.

**Important**: Make sure the video file is committed to your git repository so it gets deployed.

## How It Works

- **StudentApp.tsx**: Detects when student ID 1009104 is entered and triggers the easter egg
- **EasterEgg.tsx**: Component that plays the video fullscreen with no controls
- Video plays at full volume (volume = 1.0)
- **Explosive confetti** triggers 1.8 seconds after video starts
- Confetti explodes from center of screen in all directions
- Escape key is disabled during playback
- After video ends, waits 3 seconds then shows QR code
- Then the normal QR code page appears

## Features

✅ Only triggers for student ID 1009104  
✅ Full volume playback  
✅ No skip controls  
✅ Replays on refresh  
✅ **Explosive confetti** 1.8 seconds into video 🎉  
✅ Works on mobile and desktop  
✅ Automatically proceeds to QR code after easter egg  
✅ **Works perfectly on Vercel deployment** - video served as static asset

## Vercel Deployment

**Yes, this will work on Vercel!** Here's why:

1. Files in `frontend/public/` are automatically included in the Vercel build
2. They're served as static assets from Vercel's CDN
3. The video will be fast and reliable
4. No database needed - static files are the best approach for this

**Make sure to:**
- Commit the video file to git: `git add frontend/public/"Cenafy John Cena.mp4"`
- Push to your repository
- Vercel will automatically include it in the deployment

## Notes

- The video file should be in MP4 format for best browser compatibility
- Modern browsers may block autoplay with sound - the user might need to interact with the page first
- The explosive confetti effect shoots particles in all directions from the center
- Confetti appears 1.8 seconds after video starts playing
- The video file will be served from Vercel's CDN (not from a database)
