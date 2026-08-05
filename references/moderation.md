# UGC Moderation and Publication Flow

Use this reference whenever user-supplied images or text can enter a public particle world, share page, poster, or video.

## State Model

```text
draft
  -> uploading
  -> private_preview
  -> auto_reviewing
       -> approved -> published
       -> manual_review -> approved -> published
       -> manual_review -> rejected
       -> rejected
```

Only `published` records may appear in public queries, public media storage, share artifacts, deep links, or friend continuation.

## Server Pipeline

1. Authenticate or assign a rate-limited temporary upload identity.
2. Validate size, detected MIME type, dimensions, and pixel count.
3. Decode and re-encode the image; strip EXIF and location metadata.
4. Save the original or normalized input in private quarantine.
5. Moderate the image and associated title, note, and tags.
6. Apply the platform's versioned decision policy.
7. Route ambiguous results to human review.
8. On approval, create a sanitized public derivative.
9. Create the public point and unlock export and sharing.
10. Retain a minimal audit record and delete quarantined data according to policy.

Do not trust client-side moderation or client-provided category labels.

## Decision Lanes

### Reject

- explicit pornography or sexual acts;
- suspected sexual exploitation of minors;
- graphic gore, dismemberment, or severe injury close-ups;
- direct violent threats or instructions in accompanying text;
- other content prohibited by the current public policy.

### Manual Review

- classical or artistic nudity;
- figure drawing and sculpture;
- historical war, martyrdom, or religious violence;
- medical, documentary, journalistic, or educational imagery;
- performance art and ambiguous staged injury;
- uncertain age, context, or source rights.

### Approve

- clearly safe personal, travel, family, pet, object, landscape, and ordinary artwork images;
- verified curated assets passing a separate provenance workflow.

User-declared context is evidence for review, never an automatic bypass.

## Uploader Experience

Private preview:

`正在检查这张图片。这个光点暂时只有你能看见。`

Approved:

`你的光点已经进入艺术史。现在可以生成视频并分享。`

Manual review:

`这张图片需要进一步确认。审核完成后会通知你。`

Rejected:

`图片不符合公共展示规范。你可以更换图片或申请复核。`

Do not promise a review time until real staffing and service levels exist. Do not reveal classifier thresholds or detailed evasion-enabling signals to the client.

## Required Record Fields

```ts
type ModerationStatus =
  | "uploading"
  | "private_preview"
  | "auto_reviewing"
  | "manual_review"
  | "approved"
  | "rejected"
  | "published";

type ModerationRecord = {
  status: ModerationStatus;
  reasonCode?: string;
  policyVersion: string;
  provider?: string;
  reviewedAt?: string;
  reviewerId?: string;
  appealStatus?: "none" | "submitted" | "resolved";
};
```

Keep raw provider output private. Store only what is required for decision audit, appeals, abuse control, and legal obligations.

## Operational Controls

- upload and publication rate limits;
- repeat-abuse and account controls;
- user report action on every public point;
- reviewer queue with safe thumbnails and restricted original access;
- policy versioning and decision audit;
- appeal and re-review path;
- deletion and retention policy;
- incident escalation for suspected illegal content;
- privacy notice covering moderation providers and image processing;
- separate public and quarantine storage credentials.

Before a broad launch, verify current moderation-provider capabilities and applicable reporting, privacy, child-safety, and platform obligations with qualified counsel. A single automated classifier is not a complete safety program.
