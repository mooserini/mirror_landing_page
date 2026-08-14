# mirror_landing_page

The Resonant Mirror — a self-contained CRT/terminal-aesthetic landing page.
Boots through a fake AT&T-style BIOS POST, drops to a `C:/>` command shell,
and exposes a small command set (`help`, `enter`, `contact`, etc.).

## Live

Hosted on Cloudflare (R2 static): **https://www.getadongle.com/index.html**

## Layout

```
index.html                     # the whole page (HTML + CSS + JS, inline)
assets/
  fonts/Ac437_ATT_PC6300.ttf   # PC6300 display font (headers/chrome)
  linktree-qr-400.png          # QR shown by the `contact` command
```

## Local preview

Serve the folder over HTTP (the page fetches `/assets/...` by absolute path):

```bash
python3 -m http.server 8090 --bind 127.0.0.1
# open http://127.0.0.1:8090/
```

## Notes

- All editing happens in the working scratch copy; this repo is the
  cleaned, GitHub-aligned source of the approved live version.
- No build step, no dependencies. Static files only.
