# Homesteading Compass Website QA Checklist

Use this after website updates and before a Google Play Console build when sync behavior changed.

## Account and Sync

- Sign in on the website with the same account used in the mobile app.
- Click **Load App Records**.
- Confirm the record list shows found records for the expected sections.
- Make one small edit on the website, wait a few seconds, then reopen the mobile app and verify it appears.
- Make one small edit in the mobile app, reload app records on the website, and verify it appears.

## Section 1: Shared App Data

- Create or edit one Recipe Book entry.
- Confirm recipe title, category/type, notes, last cooked date, and published flag still behave in the app.
- Create or edit one Notebook entry.
- Confirm Notebook category path and body show in the app.
- Save a Field Guide sentence to Notebook and confirm it lands in the selected Notebook path.
- Save or edit one Trading Post listing and verify seller, category, price, description, and photo field display.
- Toggle one notification preference and confirm it remains saved after reload.

## Section 2: Profile and Contacts

- Edit Homestead Profile name, area, and tier.
- Add one vet/farrier/farm sitter contact.
- Confirm the contact appears in Notebook and Contacts.
- Confirm the contact is available from livestock/emergency-related areas in the app.

## Section 3: Operations

- Add a To-Do with category and due date.
- Add a Chore and confirm AM/PM or Daily grouping.
- Add or edit a Farm Stand inventory item.
- Confirm date fields use calendar inputs.
- Confirm Farm Stand inventory opens for editing when clicked.
- Add or edit one Workshop project and one supply row.

## Section 4: Log Book

- Add an animal record on the website.
- Add a quick record/note from the desktop workspace.
- Confirm the animal appears in the app Log Book.
- Confirm horse records appear in Horse Log when species is Horse.
- Confirm existing mobile-only fields are not removed after website save.
- Confirm animal photos still display where available.

## Post Box

- Open Post Box and confirm App Support is pinned.
- Confirm saved sellers and previously messaged contacts are listed alphabetically.
- Send a message with subject and body.
- Try sending without a subject and confirm the alert explains why.
- Write a long message, open it, and confirm the reader scrolls.
- Mark a message **In Progress**.
- Mark a message **Completed** and confirm it moves to the Completed section.
- Attach multiple photos and confirm previews open in the message reader.
- Close a partly written message and confirm draft is saved.

## Website Build/Cache

- Confirm the service worker cache version changed after website JS/CSS edits.
- Hard refresh the deployed site after release.
- Confirm the website loads without console errors.
- Confirm mobile width and desktop width do not overlap text or controls.

## Build Gate

- Run `node --check website/app.js`.
- Run `node --check website/supabase-adapter.js`.
- Run `node --check website/service-worker.js`.
- Run `git diff --check -- website`.
- Only start a Google Play Console build after sync and save checks pass.
