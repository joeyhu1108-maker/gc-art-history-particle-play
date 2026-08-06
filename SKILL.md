---
name: gc-art-history-particle-play
description: Turn an existing particle-globe, art-history atlas, or WebGL Earth experience into a fast mobile-first viral play loop. Use when the user wants people to immediately touch a dramatic particle Earth, upload a personal image or art moment, moderate public submissions, generate a short shareable artifact, or continue another person's point. Especially suited to ART LOOKS BACK / Art History Twin and similar cultural H5 experiences. Do not use for generic particle decoration, ordinary gallery pages, or backend-only moderation work with no public interaction flow.
---

# GC Art History Particle Play

Turn a visually strong particle Earth into a public experience people can understand, touch, personalize, and share within seconds.

The propagation loop is the product:

`see the Earth -> touch the effect -> add my moment -> private preview -> save locally -> request public publishing -> moderation -> publish -> share -> friend continues`

Do not bury the particle effect behind a long introduction, art-history explanation, login wall, or gallery navigation.

## Core Outcome

The first useful release should let a new visitor:

1. see the particle Earth immediately;
2. trigger the main effect without logging in;
3. understand the gesture without a tutorial;
4. optionally upload one image and one short line;
5. receive an immediate private particle preview;
6. save a private local poster without waiting for moderation;
7. explicitly request public publishing and pass content moderation;
8. generate a public share artifact after approval;
9. send a deep link that opens the visitor's moment, not a generic homepage.

## Stable Product Contracts

Preserve these contracts unless the user explicitly changes them:

- The particle Earth is the first-screen protagonist.
- The first meaningful interaction is available in under three seconds.
- The globe keeps a smooth silhouette; do not create a bumpy ball of glowing beads.
- The main effect is one coherent transformation: pull or tear, gather, reveal, burst, return.
- The user's current point is the clearest chromatic signal; the rest of the world stays restrained.
- Public UGC never appears before server-side approval.
- Uploaders may keep a private preview and download a local private poster before requesting publication.
- Moderation starts only after an explicit public-publish action.
- Public video download, public share, public point, referral deep link, and friend continuation remain locked until approval.
- The mobile experience is primary; desktop is an intentional adaptation.
- Reduced-motion and low-performance fallbacks remain usable.
- Local preview, generated artifact, approved record, public route, and published deployment are separate status claims.
- A personal point may open a private 3D gallery, but the gallery is a consequence of creation, never a replacement for the immediate Earth interaction.
- The reusable gallery accepts user-owned image records only; curated museum assets and public UGC stay in separate provenance lanes.

For Art History Twin, preserve `OCEAN / SIGNAL / YOU` and the existing immersive archive. Add the viral play path as a fast entrance; do not flatten the whole product into a generic upload form.

## Workflow

### 1. Identify the requested mode

- `strategy`: define the smallest viral loop, state model, moderation boundary, share artifact, and metrics.
- `prompt`: produce a reusable implementation brief for another builder or coding agent.
- `implementation`: inspect the real project, make surgical changes, run the experience, and verify the real route.
- `audit`: diagnose why the current effect is watched but not played or shared.

If the request is ambiguous, default to `strategy` and recommend the narrowest shippable first release.

### 2. Inspect before changing

For implementation or audit work:

1. locate the current repository, branch, route, and listener;
2. inspect the real rendered particle effect on mobile and desktop;
3. identify the current state owner and input handlers;
4. find upload, storage, moderation, poster or video export, and public visibility boundaries;
5. preserve unrelated dirty-worktree changes;
6. separate historical deployment evidence from current route health.

For ART LOOKS BACK / Art History Twin, inspect these files first when present:

- `src/AestheticTwinImmersive.tsx` for experience state and transitions;
- `src/AestheticTwinScene.tsx` for WebGL particles and pointer response;
- `src/personal-artifact-model.ts` for the personal record model and session fallback;
- `src/personal-artifact-gateway.ts` for durable upload boundaries;
- `src/personal-artifact-poster-renderer.ts` and personal poster routes for share output.

### 3. Build the fast entrance

Default first-screen copy:

`用手划开艺术史`

The visitor should be able to drag, press, or sweep the Earth immediately. Use one visible action with a generous touch target. Do not require scrolling to discover the interaction.

The main effect should read as a large field transformation:

1. the surface responds to the gesture;
2. particles stretch into a directional flow;
3. one region gathers into a temporary image or signal;
4. release causes a decisive return to the globe;
5. one point remains as evidence of the action.

Avoid generic fireworks, random sparkles, constant camera motion, or several competing particle tricks.

Read [references/viral-loop.md](references/viral-loop.md) when designing the entrance, personalization, share artifact, referral path, or launch metrics.

### 3b. Add the optional personal gallery layer

After a visitor saves a private moment, it may become a clickable personal light point. Clicking the point should focus the globe, zoom toward the point, and then open a small personal 3D gallery.

Use [`templates/personal-gallery`](templates/personal-gallery/README.md) as the reference implementation. The template provides a generic Three.js suspended-work renderer and a private upload entry without bundling museum artwork data.

Preserve this route:

`particle Earth -> private upload -> personal point -> point focus -> personal 3D gallery -> moment detail -> back to gallery`

Keep scroll/drag walking, touch selection, mobile layout, keyboard navigation, and reduced-motion behavior usable. The gallery should begin with the visitor's own work and may grow as they add moments; do not seed it with public points or unrelated collection records.

### 4. Separate immediate play from public publishing

The user may receive an immediate local or private preview. Saving privately must not silently start public moderation. Use this state path:

`draft -> uploading -> private_saved -> private_preview -> publish_requested -> auto_reviewing -> approved -> published`

Ambiguous publication requests branch to `manual_review`. Unsafe publication requests branch to `rejected`. A private, rejected, or pending item may retain its private preview and local poster, but must not have a public media URL, public globe point, downloadable public clip, or referral deep link.

Read [references/moderation.md](references/moderation.md) before implementing user uploads, visibility rules, review UI, rejection, appeal, or public queries.

### 5. Create the share artifact

The preferred propagation artifact is a silent four-second vertical loop:

- start with a readable whole Earth;
- move to the user's point;
- gather into the approved image or visual fragment;
- burst and return to the Earth;
- leave the personal point visible;
- end close enough to the first frame for a clean loop.

Use a 9:16 social-video frame when the target platform requires it. Preserve the complete Earth and extend the background instead of cropping the central effect.

Default end copy:

`YOUR POINT IS NOW IN HISTORY`

`你的一刻，已经进入艺术史`

Provide a static private poster immediately when browser or device video export is unreliable. Public video export remains approval-gated. A prompt, private preview, local poster, submitted render, downloaded public file, and verified playable file are different states.

### 6. Make sharing reopen the meaningful state

The shared link should open at the approved point or its short reveal, then offer one clear action:

`接上这条轨迹`

Do not send referred visitors to a generic homepage or long introduction. A continuation may preserve one source point and let the new visitor add their own moment.

### 7. Verify the real loop

Test, at minimum:

- fresh mobile entry;
- first gesture and visible response;
- pointer, touch, and drag release;
- private preview and local poster download before moderation;
- explicit public-publish request starting moderation;
- auto-approved path;
- manual-review path;
- rejected path;
- public API exclusion for pending and rejected records;
- approved point appearing on the globe;
- share artifact generation and decode;
- deep link opening the correct point;
- friend continuation;
- reset and replay;
- reduced-motion fallback;
- mobile overflow, loading, and back navigation.

Do not call the work finished because the build passes or a share card exists. Open the actual route and complete the user journey.

## Moderation Boundary

Moderation is a publication gate, not a cosmetic warning.

- Perform authoritative moderation on the server.
- Store uploads in private quarantine before approval.
- Validate and re-encode files; strip metadata.
- Review both the image and user-supplied text.
- Auto-reject clearly disallowed sexual or graphic content.
- Route ambiguous artistic nudity, historical violence, medical, documentary, or performance-art context to human review.
- Keep curated museum records and public UGC in separate provenance lanes.
- Version the policy and retain an audit decision.
- Add rate limits, reporting, repeat-abuse controls, and an appeal path before a broad public launch.
- Verify current provider capabilities and legal obligations instead of assuming one classifier covers every category or jurisdiction.

Never expose the quarantine object URL to the public client.

## Output Formats

For strategy or audit requests, return:

```markdown
目标：
[one concrete propagation outcome]

第一屏：
[visual, copy, gesture, first response]

核心循环：
[entry -> play -> personalize -> moderate -> publish -> share -> referral]

状态与安全边界：
[private/public states and moderation branches]

分享成品：
[duration, ratio, sequence, copy, deep-link behavior]

最小版本：
[P0 only]

验证：
[real-route tests and product metrics]

不做：
[expensive distractions]
```

For implementation requests, additionally report:

- actual changed files;
- exact local or public route;
- checks performed;
- rendered or exported artifacts with absolute paths;
- current moderation/publication status;
- known gaps and one executable next step.

## Metrics

Prefer behavior metrics over exposure counts:

- time to first interaction;
- first-gesture completion;
- personalization start and completion;
- moderation pass, manual-review, and rejection rates;
- approved share-artifact generation;
- save or share action;
- referred visitor open rate;
- friend-continuation rate;
- replay or return rate.

Treat targets as hypotheses until a real pilot supplies evidence.

## Avoid

- long cinematic intros before play;
- mandatory login before the first gesture;
- generic particle decoration with no user consequence;
- bumpy, protruding, over-glowing particle spheres;
- upload forms as the first screen;
- public display before moderation;
- public video downloads that bypass approval;
- avatars, chat, rankings, badges, or realtime rooms in v1;
- adding a gallery, metaverse, or social network before the share loop works;
- opening the 3D gallery before the visitor has created or selected a meaningful point;
- bundling proprietary, museum, or third-party artwork assets with the generic gallery engine;
- claiming a local preview or prepared package is published;
- changing the entire visual system when only the propagation entrance is requested.

## Quality Gate

Before finalizing, confirm:

- Can a visitor trigger the main effect immediately?
- Is the particle Earth still the unmistakable protagonist?
- Does the effect use one coherent cause and return cleanly?
- Does personal input create a visible consequence?
- Can the visitor click their point, enter the personal gallery, open the moment, and return without losing context?
- Is the private preview clearly separated from public publication?
- Can the uploader save a private local poster without triggering moderation?
- Can no pending or rejected record leak through public APIs or media URLs?
- Does approval unlock a real share artifact and point-specific link?
- Can a referred visitor continue without first understanding the whole product?
- Does the experience work on a real phone-sized viewport?
- Are reduced-motion, loading, failure, rejection, and retry states usable?
- Are the actual output and publication statuses reported truthfully?
