import { useId, useState, type FormEvent } from "react";
import "./personal-gallery-starter.css";

export type PersonalMomentDraft = {
  file: File;
  title: string;
  note: string;
  place: string;
  year: string;
};

type PersonalMomentUploadProps = {
  onSavePrivate: (draft: PersonalMomentDraft) => void | Promise<void>;
  onCancel?: () => void;
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function PersonalMomentUpload({
  onSavePrivate,
  onCancel,
}: PersonalMomentUploadProps) {
  const formId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("请选择一张图片。");
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("仅支持 JPG、PNG 或 WebP。");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("图片不能超过 8 MB。");
      return;
    }

    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await onSavePrivate({
        file,
        title: String(form.get("title") ?? "").trim(),
        note: String(form.get("note") ?? "").trim(),
        place: String(form.get("place") ?? "").trim(),
        year: String(form.get("year") ?? "").trim(),
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存失败，请重试。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="personal-moment-upload" onSubmit={submit}>
      <header>
        <small>PRIVATE MOMENT</small>
        <h1>把一个瞬间放进地球</h1>
        <p>先在当前设备生成私人展厅；这里不会自动公开或启动审核。</p>
      </header>

      <label className="personal-moment-file" htmlFor={`${formId}-file`}>
        <input
          id={`${formId}-file`}
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            setFile(event.currentTarget.files?.[0] ?? null);
            setError("");
          }}
        />
        <span>{file ? file.name : "选择一张 JPG、PNG 或 WebP"}</span>
        <b>＋</b>
      </label>

      <label>
        <span>给这个瞬间一个名字</span>
        <input name="title" maxLength={36} required placeholder="例如：风停下来的时候" />
      </label>

      <label>
        <span>留下一句话</span>
        <textarea name="note" maxLength={120} rows={3} placeholder="可选，写下它为什么值得留下" />
      </label>

      <div className="personal-moment-row">
        <label>
          <span>地点</span>
          <input name="place" maxLength={36} placeholder="可选，例如：冰岛" />
        </label>
        <label>
          <span>年份</span>
          <input name="year" inputMode="numeric" maxLength={4} placeholder="2026" />
        </label>
      </div>

      {error ? <p className="personal-moment-error" role="alert">{error}</p> : null}

      <footer>
        {onCancel ? (
          <button type="button" className="is-secondary" onClick={onCancel}>
            返回展厅
          </button>
        ) : null}
        <button type="submit" disabled={saving}>
          {saving ? "正在放入…" : "放进我的展厅"}
        </button>
      </footer>
    </form>
  );
}
