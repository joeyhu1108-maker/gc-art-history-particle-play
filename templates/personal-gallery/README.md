# Personal Gallery Starter

This template turns user-owned images into a private, walkable Three.js gallery. It contains no museum collection records or artwork files.

## What is included

- `HangingGallery.tsx` — reusable Three.js gallery engine for up to 12 image items;
- `PersonalMomentUpload.tsx` — one-image private upload entrance;
- `PersonalGalleryStarter.tsx` — minimal upload → gallery → detail loop;
- two scoped CSS files for desktop, touch, mobile, and reduced-motion behavior.

## Run the starter

```bash
cd templates/personal-gallery
npm install
npm run dev
```

Then upload one JPG, PNG, or WebP image. The browser will open it inside the private 3D room.

## Copy into an existing project

Copy this folder into a React + TypeScript project and install Three.js:

```bash
npm install three
```

Render the starter inside a full-page route:

```tsx
import { PersonalGalleryStarter } from "./personal-gallery";

export default function App() {
  return <PersonalGalleryStarter />;
}
```

The starter keeps uploaded images in browser memory through `URL.createObjectURL`. Refreshing the page clears the experience. Replace `savePrivate` in `PersonalGalleryStarter.tsx` with your private storage gateway when persistence is required.

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
