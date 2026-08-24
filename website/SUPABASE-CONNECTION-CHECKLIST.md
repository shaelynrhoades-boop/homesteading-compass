# Website Supabase Connection Checklist

Use this when you are ready to make the website share real app data.

## 1. Database

Run `supabase/waystation-online-repair.sql` in the Supabase SQL Editor first.
That patch creates or repairs the tables, storage buckets, policies, and helper
functions used by the app and the future website.

## 2. Public Browser Config

Open `website/supabase-config.js` and paste:

```js
window.HC_SUPABASE_CONFIG = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-PUBLIC-ANON-KEY",
};
```

Only use the public anon key. Do not use the service-role key in browser code.

## 3. Adapter Work

Replace the placeholder functions in `website/supabase-adapter.js` with real
Supabase calls:

- Auth: email sign-in, sign-out, current session
- Almanac: save reminders and generated animal/chore/weather entries
- Chore List: save To Dos and recurring chore completion state
- Weather: save user alert settings; connect live weather through a safe API path
- Animal Log Book: read/write `livestock_logs` and animal-specific care data
- Recipe Book: read/write recipes through `user_cloud_records` or a recipe table
- Post Box: insert and select `support_messages`
- Storage: upload files to `support-attachments`
- Farm Stand: read and write stand data
- Porch Light Map: call `nearby_porch_light_pins`
- Trading Post and Front Porch: read public active records

## 4. Smoke Test

- Open the Account tab and confirm it says `Supabase config detected`.
- Sign in with a real test account.
- Create one support message with an attachment.
- Create or edit one Farm Stand item.
- Confirm data appears after a browser refresh and on a second device.
