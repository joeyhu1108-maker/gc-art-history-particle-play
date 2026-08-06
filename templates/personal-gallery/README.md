# Personal Gallery Adapter

This adapter connects an existing particle Earth to a private, walkable Three.js gallery. It contains no particle-Earth replacement, museum collection records, or artwork files.

> Do not mount this folder as a standalone first screen. The visitor must see and touch the host particle Earth first. Upload appears only after the Earth responds; the gallery opens only after the visitor clicks a created personal point.

## What is included

- `HangingGallery.tsx` — reusable Three.js gallery engine for up to 12 image items;
- `PersonalMomentUpload.tsx` — private one-image input to open after the first Earth interaction;
- `preparePersonalMomentImage.ts` — automatic aspect-ratio-preserving resize and web conversion;
- scoped CSS for desktop, touch, mobile, and reduced-motion behavior.

## Required host flow

The host application owns this state path:

`earth -> earth responded -> upload -> private point on earth -> click point -> gallery -> detail`

The adapter provides the upload and gallery pieces. Reuse the particle Earth that already belongs to the product; do not replace it with a generic sphere or open directly on the gallery.

## Install in an existing project

Copy this folder into a React + TypeScript project and install Three.js:

```bash
npm install three
```

Mount these pieces only from state owned by the existing Earth experience:

```tsx
import {
  HangingGallery,
  PersonalMomentUpload,
  preparePersonalMomentImage,
  type PersonalMomentDraft,
} from "./personal-gallery";

async function saveMomentAndCreateEarthPoint(draft: PersonalMomentDraft) {
  const image = await preparePersonalMomentImage(draft.file);
  await savePrivateMoment({ ...draft, image });
  createPrivateEarthPoint();
}

{phase === "upload" ? (
  <PersonalMomentUpload onSavePrivate={saveMomentAndCreateEarthPoint} />
) : null}

{phase === "gallery" ? (
  <HangingGallery
    items={privateMoments}
    active
    reduceMotion={false}
    onOpen={openMomentDetail}
  />
) : null}
```

Here, `phase === "upload"` is allowed only after the visitor has interacted with the Earth. Set `phase === "gallery"` only when they click their own new point.

The host should create an immediate private preview with `URL.createObjectURL` or a private storage gateway. Refreshing clears browser-only URLs. Public persistence and moderation are separate services.

## Use the engine with your own data

```tsx
import { HangingGallery, type HangingGalleryItem } from "./personal-gallery";

const items: HangingGalleryItem[] = [
  {
    id: "moment-1",
    title: "风停下来的时候",
    date: "冰岛 · 2026",
    imageUrl: "/my-private-preview.jpg",
  },
];

<HangingGallery
  items={items}
  active
  reduceMotion={false}
  onOpen={(id) => openMomentDetail(id)}
  openLabel="打开这个瞬间"
/>;
```

## Product boundary

The template creates a private preview only. Do not treat “save to my gallery” as consent to publish.

Use a separate explicit action for public publishing:

`private preview → request public publishing → server moderation → approved → public point/share link`

Before public launch, add private quarantine storage, server-side image and text review, re-encoding and metadata stripping, rate limits, reporting, and an appeal path. Pending or rejected media must never receive a public URL.

## Interaction contract

- The particle Earth remains the first-screen protagonist.
- Upload comes after the visitor has played with the Earth.
- A saved moment becomes one personal light point.
- Clicking that point zooms into this gallery.
- Scroll or drag walks through the room; touch selects a work.
- The room may contain several personal moments, but it must not become an unmoderated public feed.

For non-technical visitors, follow [`references/beginner-playbook.md`](../../references/beginner-playbook.md).
