# The Homesteading Compass Website

Static public website for `thehomesteadingcompass.com`.

The homepage includes an interactive app-style preview in `app.js`. It uses
browser `localStorage` only right now, so it does not require Supabase keys,
user login, or storage buckets yet.

`supabase-adapter.js` is a placeholder boundary for the later real connection.
When the website becomes a real web app, replace the local preview state with
Supabase Auth, database calls, and Storage uploads there. Never put service-role
keys in the website.

`supabase-config.js` is the browser-safe place to paste the public Supabase URL
and public anon key later. Leave it blank while the website is in demo mode.
Use `SUPABASE-CONNECTION-CHECKLIST.md` when you are ready to connect it.

The Account tab has local demo-data tools for testing:

- Export Demo Data downloads the current browser preview state as JSON.
- Import Demo Data restores a previously exported JSON file.
- Reset Demo Data clears local changes and restores the default preview.

The local preview currently includes interactive Almanac reminders, To Dos,
recurring chores, Farm Alerts/weather settings, animal Log Book records, Recipe
Book entries, Farm Stand inventory, Post Box messages, Porch Light pins, Trading
Post listings, and Front Porch posts.

## App-Like Website Files

- `manifest.webmanifest` lets mobile browsers install the website to the home screen.
- `service-worker.js` caches the app shell and public pages for a basic offline fallback.
- `404.html` is the static not-found page for Cloudflare Pages.
- `_headers` adds basic browser safety headers and long-lived asset caching.
- `_redirects` keeps a few older/simple URLs pointed at the current pages.
- `SUPABASE-CONNECTION-CHECKLIST.md` lists the later copy/paste steps for Supabase.

## Cloudflare Pages

- Build command: leave blank
- Build output directory: `website`
- Root directory: repository root, unless Cloudflare asks for a project root. If it does, use `website`.

## Important URLs

- `/`
- `/privacy-policy/`
- `/terms/`
- `/support/`
- `/safety/`
- `/community-guidelines/`
- `/marketplace-rules/`
- `/manifest.webmanifest`
- `/robots.txt`
- `/sitemap.xml`

Use this in Google Play Console after the domain is connected:

```text
https://thehomesteadingcompass.com/privacy-policy/
```
