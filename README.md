# Good Morning Message Maker – Subah Bakhair Studio (صبح بخیر اسٹوڈیو)

A Windows desktop app that creates beautiful Good Morning greeting pictures with Urdu messages (صبح بخیر):
one message, one background, one greeting at a time.

Built with **Electron + React**. Urdu text is drawn by Chromium's text engine (HarfBuzz), so it comes out
right-to-left, with joined letters and proper Nastaliq ligatures. The same engine draws the exported image.

## Phase 1 – Basic Greeting Maker (this release)

- **Home**: welcome message, mood picker, one-click **Generate New Greeting**, featured backgrounds, recent designs, favourite messages
- **Message generator**: 10 moods, 3 lengths (Medium is the default), recipient type, an optional special request, one message at a time, Regenerate / Edit / Copy / Favourite
  - With a **Claude API key**, Claude writes a fresh message each time
  - Without a key or internet, messages come from a built-in **offline library** of hand-written Urdu messages. The app labels these as offline; it never presents them as AI-written
- **Background library**: 18 built-in backgrounds (sunrise, nature, flowers, butterflies, mosque at sunrise, Islamic patterns, soft gradients). They are painted at the export size, so they stay sharp in portrait or landscape. You can also upload your own photos
- **AI background generator** (OpenAI Images). It generates the picture *without* any text; the app adds the Urdu afterwards so the spelling is always correct
- **Designer**: drag text, centre guides, size, line spacing, width, rotation, alignment, bold, colours (including gold gradient), shadow, outline, transparent panel, extra text boxes, emojis, borders, brightness/contrast/saturation/blur/darken, photo zoom and position, undo/redo (Ctrl+Z / Ctrl+Y), auto-save
- **Fonts**: Noto Nastaliq Urdu and Noto Naskh Arabic come with the app. Jameel Noori Nastaleeq and Urdu Typesetting are used if they are installed on the PC, and you can list every font installed on the PC
- **Preview & Export**: WhatsApp Status, Instagram Story/Post, Facebook, Greeting Card, Landscape, Custom size; PNG, JPEG (quality slider), high-quality JPG; Save, Copy Image, **Copy & open WhatsApp Web**
- **My Library**: saved designs (rename, duplicate, delete), favourite messages, recent messages, exported images, your photos, search
- **Settings**: API keys are stored encrypted with Windows DPAPI. Also: models, defaults, light/dark theme, and a table of which features work offline

## Getting the Windows app

1. Every push to `main` starts the **Build Windows App** workflow on GitHub Actions.
2. Open the repo on GitHub → **Actions** tab → the latest **Build Windows App** run.
3. When it shows a green tick, scroll to **Artifacts** and download **SubahBakhairStudio-Windows**.
4. Unzip it. You will find:
   - `Subah Bakhair Studio Setup 0.1.0.exe`: the installer
   - `Subah Bakhair Studio 0.1.0.exe`: a portable version that runs without installing
5. Windows may show "Windows protected your PC" because the app is not code-signed. Click **More info → Run anyway**.

## Setting up AI (optional)

| Feature | Needs |
|---|---|
| Built-in backgrounds, photos, designer, Urdu text, export | Works offline, free |
| Offline message library | Works offline, free |
| Fresh AI-written Urdu messages | Internet + Claude API key from console.anthropic.com (paid per use) |
| AI-generated backgrounds | Internet + OpenAI API key from platform.openai.com (paid per image) |

Paste your keys into **Settings → AI connections** in the app.

## Development

```bash
npm install
npm run build      # build the interface into dist/
npm start          # run the desktop app
npm run dist       # build the Windows installer into release/
```

To bundle the Noto fonts on a local build, download `NotoNastaliqUrdu.ttf` and `NotoNaskhArabic.ttf` into `public/fonts/`. The GitHub workflow does this for you.

## Roadmap

- **Phase 2 – Creative Design Studio**: stickers and decorative elements (flowers, butterflies, Islamic ornaments), ready-made templates, save your own templates, more photo adjustments, creative effects
- **Phase 3 – AI Features**: full AI Urdu writing assistant (chat-style), background removal, photo enhancement, upscaling, object removal
- **Phase 4 – Productivity & Sharing**: more sharing destinations (Instagram, Facebook, Telegram, email, Windows Share), daily morning reminder with Windows notifications, scheduled greetings, advanced export settings

Scheduled greetings will never claim that a message was sent unless a real sending integration is set up.
