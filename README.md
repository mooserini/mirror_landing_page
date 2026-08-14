# mirror_landing_page

The Resonant Mirror — a self-contained CRT/terminal-aesthetic landing page.
Boots through a fake AT&T-style BIOS POST, drops to a `C:/>` command shell,
and exposes a small command set (`help`, `enter`, `contact`, etc.).

## Live

Hosted on Cloudflare (R2 static): **https://www.getadongle.com/index.html**

## Layout

```
index.html                     # page shell (HTML + CSS + primary JS inline)
assets/
  fonts/Ac437_ATT_PC6300.ttf   # PC6300 display font (headers/chrome)
  linktree-qr-400.png          # QR shown by the `contact` command
  projects-core.js             # schema guard + dependency-free line renderer
  projects.json                # public work and links manifest
tests/
  projects-core.test.js        # Node built-in contract tests
```

## Dynamic work manifest

The `work` command fetches `/assets/projects.json`, accepts only
`schemaVersion: 1`, and renders validated project and link fields. Unsupported,
missing, malformed, or empty manifests fail quietly to the static work list in
`index.html`; the shell and all other commands continue to work.

The JSON remains a deliberately small public boundary. It describes projects
without publishing credentials, private endpoints, IP addresses, ports, or
access instructions.

## Third-party material

`assets/fonts/Ac437_ATT_PC6300.ttf` comes from VileR's
[Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/).
The font file is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for attribution and
source details. The license applies to that font file, not automatically to
the rest of this repository.

## Local preview

Serve the folder over HTTP (the page fetches `/assets/...` by absolute path):

```bash
python3 -m http.server 8090 --bind 127.0.0.1
# open http://127.0.0.1:8090/
```

## Notes

- `main` is the verified, deployable checkpoint—not a mirror of every transient
  scratch edit.
- Run `node --test tests/projects-core.test.js` before publishing changes to the
  manifest or its renderer.
- There is no build step and no runtime dependency installation. The deployed
  surface is static files only.
