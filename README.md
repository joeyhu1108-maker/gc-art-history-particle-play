# GC Art History Particle Play

Turn a particle globe or art-history atlas into a mobile-first play, personalize, moderate, publish, and share loop.

This Codex Skill was created for **ART LOOKS BACK / Art History Twin**, but its product contracts can be reused by other cultural WebGL experiences.

## Effect preview

![ART LOOKS BACK particle Earth play loop](assets/particle-earth-play.jpg)

*Particle Earth → first gesture → one personal moment. The image shows the private test entrance; public publishing remains moderation-gated.*

## What it helps with

- Put the particle Earth on the first screen and make it playable in under three seconds.
- Design one coherent gesture: pull or tear, gather, reveal, burst, return.
- Let visitors create an immediate private preview and local poster from one image and one short line.
- Start authoritative server-side moderation only after an explicit public-publish request.
- Produce a point-specific deep link and an optional four-second vertical share loop.
- Turn each personal light point into a private, walkable 3D gallery made from user-owned images.
- Audit the real mobile route, reduced-motion fallback, and publication boundary.

## New: personal 3D gallery adapter

The repository now includes a reusable React + Three.js adapter at [`templates/personal-gallery`](templates/personal-gallery/README.md). It provides:

- a generic suspended-work gallery engine;
- a one-image private upload entrance;
- automatic aspect-ratio-preserving resize and web conversion;
- mobile touch, wheel/drag navigation, keyboard navigation, and reduced-motion handling.

It is intentionally not a standalone website: the existing particle Earth remains the first screen and owns the point interaction. No Art History Twin museum records or artwork assets are included.

For a visitor who does not know how to prepare images or use the experience, follow [`references/beginner-playbook.md`](references/beginner-playbook.md). The product should resize and convert the image automatically; the visitor should only choose one clear image.

## Install

Clone the repository into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
git clone https://github.com/joeyhu1108-maker/gc-art-history-particle-play.git \
  ~/.codex/skills/gc-art-history-particle-play
```

Restart Codex if the Skill is not discovered immediately.

## Use

Invoke it explicitly:

```text
Use $gc-art-history-particle-play to turn this particle-globe experience into an immediate mobile play loop with private preview and local poster download, explicit moderation-gated public publishing, and a moment-specific share artifact.
```

To add the personal gallery layer:

```text
Use $gc-art-history-particle-play to keep the particle Earth as the first screen, let a visitor upload one private moment, create a personal light point, and make clicking that point zoom into the reusable 3D personal gallery. Keep all public publishing moderation-gated.
```

## How to play

1. Open the particle Earth and drag it immediately — no login is required for the first effect.
2. Scroll through time and watch the particle field respond.
3. Choose **放入我的第一个瞬间** and upload one JPG, PNG, or WebP image.
4. Add a short title; place, year, and one sentence are optional.
5. Choose **放进我的展厅**. The private image becomes one personal light point and opens inside the 3D room.
6. Scroll or drag to walk, tap a hanging work to select it, then choose **打开这个瞬间**.
7. Return to **MY GALLERY** and choose **ADD A MOMENT** to build a larger personal exhibition.
8. Only use a separate **request public publishing** action when you want the work reviewed for the public globe.

It supports four working modes:

- `strategy` — define the smallest viral loop and safety boundary.
- `prompt` — produce an implementation brief for another builder.
- `implementation` — inspect and surgically change a real project, then verify the route.
- `audit` — diagnose why an existing particle effect is watched but not played or shared.

## Package

```text
.
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
    ├── moderation.md
│   ├── viral-loop.md
│   └── beginner-playbook.md
└── templates/
    └── personal-gallery/
```

`SKILL.md` is the source of truth. The references define the public-growth and moderation boundaries; the template is an implementation starting point, not a hosted application.

## Safety contract

Uploads may receive a private preview and on-device poster immediately. Moderation starts only when the user explicitly requests public publishing, and only approved published records may appear in public queries, public media, downloadable public clips, deep links, or friend-continuation flows. This Skill is product and implementation guidance, not legal advice; verify current moderation-provider capabilities and applicable obligations before launch.

## License

[MIT](LICENSE)
