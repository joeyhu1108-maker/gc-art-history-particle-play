import { useEffect, useRef, useState } from "react";
import { HangingGallery, type HangingGalleryItem } from "./HangingGallery";
import {
  PersonalMomentUpload,
  type PersonalMomentDraft,
} from "./PersonalMomentUpload";
import "./personal-gallery-starter.css";

type PersonalMoment = HangingGalleryItem & {
  note: string;
  place: string;
  year: string;
};

type View = "upload" | "gallery" | "detail";

function usePrefersReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduceMotion;
}

function createMoment(draft: PersonalMomentDraft): PersonalMoment {
  const year = draft.year || String(new Date().getFullYear());
  return {
    id: crypto.randomUUID(),
    title: draft.title,
    date: [draft.place, year].filter(Boolean).join(" · "),
    imageUrl: URL.createObjectURL(draft.file),
    note: draft.note,
    place: draft.place,
    year,
  };
}

export function PersonalGalleryStarter() {
  const reduceMotion = usePrefersReducedMotion();
  const [moments, setMoments] = useState<PersonalMoment[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [view, setView] = useState<View>("upload");
  const objectUrls = useRef(new Set<string>());

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current.clear();
    },
    [],
  );

  const savePrivate = (draft: PersonalMomentDraft) => {
    const moment = createMoment(draft);
    objectUrls.current.add(moment.imageUrl);
    setMoments((current) => [...current, moment]);
    setSelectedId(moment.id);
    setView("gallery");
  };

  const selectedMoment = moments.find((moment) => moment.id === selectedId);

  return (
    <main className="personal-gallery-starter">
      {view === "upload" ? (
        <PersonalMomentUpload
          onSavePrivate={savePrivate}
          onCancel={moments.length ? () => setView("gallery") : undefined}
        />
      ) : null}

      {view === "gallery" && moments.length ? (
        <section className="personal-gallery-stage">
          <button
            className="personal-gallery-add"
            type="button"
            onClick={() => setView("upload")}
          >
            <span>ADD A MOMENT</span>
            <small>再放一个光点</small>
          </button>
          <HangingGallery
            items={moments}
            active={view === "gallery"}
            reduceMotion={reduceMotion}
            initialItemId={selectedId}
            openLabel="打开这个瞬间"
            onOpen={(id) => {
              setSelectedId(id);
              setView("detail");
            }}
          />
        </section>
      ) : null}

      {view === "detail" && selectedMoment ? (
        <article className="personal-moment-detail">
          <button type="button" onClick={() => setView("gallery")}>
            ← 回到我的数字展厅
          </button>
          <img src={selectedMoment.imageUrl} alt="" />
          <small>{selectedMoment.date}</small>
          <h2>{selectedMoment.title}</h2>
          {selectedMoment.note ? <p>{selectedMoment.note}</p> : null}
          <em>PRIVATE · NOT PUBLIC</em>
        </article>
      ) : null}
    </main>
  );
}
