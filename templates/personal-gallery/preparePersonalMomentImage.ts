const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PreparedPersonalMomentImage = {
  blob: Blob;
  previewUrl: string;
  originalName: string;
  width: number;
  height: number;
};

export async function preparePersonalMomentImage(
  file: File,
): Promise<PreparedPersonalMomentImage> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("请使用 JPG、PNG 或 WebP 图片");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("图片需小于 8 MB");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    bitmap.close();
    throw new Error("当前浏览器无法处理这张图片");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result
        ? resolve(result)
        : reject(new Error("图片处理失败，请重试")),
      outputType,
      outputType === "image/png" ? undefined : 0.86,
    );
  });

  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
    originalName: file.name,
    width,
    height,
  };
}
