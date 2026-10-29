# Phase 2 plan: live submissions

Not built yet. v1 is a static page whose content lives in `index.html`. Phase 2 lets Princeton students submit builds and library entries themselves, so officers stop copying form responses by hand.

## Goals

- Builds and library entries live in **Firebase Firestore** and persist across users.
- **Google Sign-In, restricted to `@princeton.edu`.**
- Anyone can read. Only signed-in Princeton users can create. Users can edit and delete only their own documents.
- Screenshots and library files go to **Firebase Storage**, with size and type limits.
- A **featured** flag that only lead emails can set.
- Hosting stays on GitHub Pages. Firebase is only the database, auth and storage.

## Hooks already in v1

- `loadContent()` in `index.html` is the single place content comes from. Today it returns `{ builds: BUILDS, library: LIBRARY }`. In Phase 2 it reads the `builds` and `library` collections and resolves to the same shapes, so `buildCard`, `libraryCard`, the filters and the modal don't change.
- Every "Share your build" / "Suggest a resource" button reads its destination from `LINKS` through `data-link`. Phase 2 points these at an in-page sign-in and submit form instead of an external form.
- `featured` is already a field on builds and already drives sort order.
- All rendering escapes strings, which is what makes user-submitted text safe to show.

## Data model

`builds/{id}`: the same fields as a `BUILDS` entry, plus

- `uid`: the creator's Firebase Auth uid (set on create, never changes)
- `createdAt`, `updatedAt`: server timestamps
- `image`: a Storage download URL instead of an `assets/` path

`library/{id}`: the same fields as a `LIBRARY` entry, plus `uid`, `createdAt` and `updatedAt`.

`config/admins`: `{ emails: ["lead1@princeton.edu", ...] }`. These are the lead emails allowed to set `featured`. They're editable in the Firebase console only, since the rules deny all client writes to `config`.

## Auth

- Use `GoogleAuthProvider` with `provider.setCustomParameters({ hd: "princeton.edu" })`. `hd` only pre-selects the Princeton account in Google's chooser. It is a UI hint, not a security check.
- Enforcement happens in the rules: `request.auth.token.email.matches('.*@princeton[.]edu$')` plus `email_verified == true`.
- After sign-in, also check the email on the client and sign out non-Princeton accounts with a clear message. That's for UX only; the rules are the real gate.

## Firestore rules (draft)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() { return request.auth != null; }
    function isPrinceton() {
      return signedIn()
        && request.auth.token.email_verified == true
        && request.auth.token.email.matches('.*@princeton[.]edu$');
    }
    function isLead() {
      return isPrinceton()
        && request.auth.token.email in get(/databases/$(database)/documents/config/admins).data.emails;
    }
    function str(v, min, max) { return v is string && v.size() >= min && v.size() <= max; }
    function optStr(d, k, max) { return !(k in d) || str(d[k], 0, max); }
    function url(d, k) { return !(k in d) || (d[k] is string && d[k].size() <= 500 && (d[k] == '' || d[k].matches('^https://.*'))); }
    function strList(v, min, max) { return v is list && v.size() >= min && v.size() <= max; }

    function validBuild(d) {
      return d.keys().hasOnly(['name', 'description', 'longWriteup', 'builders', 'claudeTools', 'otherTools',
                               'categories', 'demoUrl', 'repoUrl', 'image', 'featured', 'uid', 'createdAt', 'updatedAt'])
        && d.keys().hasAll(['name', 'description', 'builders', 'claudeTools', 'categories', 'featured', 'uid', 'createdAt'])
        && str(d.name, 2, 80)
        && str(d.description, 10, 280)
        && optStr(d, 'longWriteup', 8000)
        && strList(d.builders, 1, 8)
        && strList(d.claudeTools, 1, 5)
        && d.claudeTools.hasOnly(['Claude Code', 'Claude API', 'Claude.ai', 'MCP', 'Agent SDK'])
        && (!('otherTools' in d) || strList(d.otherTools, 0, 10))
        && strList(d.categories, 1, 4)
        && url(d, 'demoUrl') && url(d, 'repoUrl') && url(d, 'image')
        && d.featured is bool;
    }

    function validResource(d) {
      return d.keys().hasOnly(['title', 'url', 'type', 'products', 'why', 'sharedBy', 'uid', 'createdAt', 'updatedAt'])
        && d.keys().hasAll(['title', 'url', 'type', 'why', 'sharedBy', 'uid', 'createdAt'])
        && str(d.title, 2, 120)
        && d.url is string && d.url.size() <= 500 && d.url.matches('^https://.*')
        && d.type in ['Guide', 'Video', 'Workshop slides', 'Prompt pack', 'Docs']
        && (!('products' in d) || strList(d.products, 0, 5))
        && str(d.why, 5, 200)
        && str(d.sharedBy, 2, 80);
    }

    // Fields a user may never change on their own document.
    function keepsOwnership() {
      return request.resource.data.uid == resource.data.uid
        && request.resource.data.createdAt == resource.data.createdAt;
    }

    match /builds/{id} {
      allow read: if true;
      allow create: if isPrinceton()
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.featured == false
        && request.resource.data.createdAt == request.time
        && validBuild(request.resource.data);
      allow update: if
        (isPrinceton()
          && resource.data.uid == request.auth.uid
          && keepsOwnership()
          && request.resource.data.featured == resource.data.featured
          && validBuild(request.resource.data))
        || (isLead()
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['featured', 'updatedAt'])
          && request.resource.data.featured is bool);
      allow delete: if isPrinceton() && resource.data.uid == request.auth.uid;
    }

    match /library/{id} {
      allow read: if true;
      allow create: if isPrinceton()
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.createdAt == request.time
        && validResource(request.resource.data);
      allow update: if isPrinceton()
        && resource.data.uid == request.auth.uid
        && keepsOwnership()
        && validResource(request.resource.data);
      allow delete: if isPrinceton() && resource.data.uid == request.auth.uid;
    }

    match /config/{doc} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

Rules can check a list's length and its allowed values (`hasOnly`), but they can't loop over items. So `builders` objects are validated for count here and for shape on the client. If that's not strict enough, store builders as parallel string lists.

## Storage rules (draft)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isPrinceton() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.matches('.*@princeton[.]edu$');
    }

    // Build screenshots: images only, 2 MB max, stored under the uploader's uid.
    match /screenshots/{uid}/{file} {
      allow read: if true;
      allow create, update: if isPrinceton() && request.auth.uid == uid
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/(png|jpeg|webp)');
      allow delete: if isPrinceton() && request.auth.uid == uid;
    }

    // Library uploads (slides, PDFs): 20 MB max.
    match /library/{uid}/{file} {
      allow read: if true;
      allow create, update: if isPrinceton() && request.auth.uid == uid
        && request.resource.size < 20 * 1024 * 1024
        && request.resource.contentType.matches('application/pdf|image/(png|jpeg|webp)');
      allow delete: if isPrinceton() && request.auth.uid == uid;
    }
  }
}
```

## Build order

1. Create a Firebase project. Enable Google sign-in, Firestore and Storage. Add `claudeatprinceton.org` (and `localhost`) to Auth's authorized domains.
2. Deploy the rules above with the Firebase CLI, and test them in the Rules Playground or emulator before any UI work: a non-Princeton account must fail, editing someone else's doc must fail, and a non-lead setting `featured` must fail.
3. Seed Firestore with the current `BUILDS` and `LIBRARY` arrays (one-off script) so nothing disappears at switchover.
4. Replace `loadContent()` with Firestore reads. Keep the static arrays as a fallback if the request fails. Keep the grid's height steady while data loads so there's no layout shift.
5. Add the sign-in button and the submit/edit forms (in a modal, reusing the write-up modal's focus handling). Show "Your builds" with edit and delete for the signed-in user.
6. Add the lead-only "Feature" toggle, shown only when the signed-in email is in `config/admins`.
7. Turn on App Check (reCAPTCHA Enterprise) to cut down on scripted abuse, and restrict the Firebase API key to the site's domains in Google Cloud.

## Decisions to make before building

- **Stack constraint.** The Firebase JS SDK loads from `gstatic.com`, which breaks the v1 rule that Google Fonts is the only external resource. Options: accept it, or vendor the SDK files into `/assets`.
- **Moderation.** Should new submissions go live at once, or wait in a `status: "pending"` state until a lead approves? The rules above publish immediately. Lead delete or hide rights would be a small addition.
- **Privacy.** Builder names and LinkedIn URLs become user-entered public data. Add a line on the submit form saying what's shown publicly.
