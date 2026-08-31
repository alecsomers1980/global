/** Longest edge of a stored product photo. Enough for the 1600px hero slot. */
export const MAX_DIMENSION = 1600;

export function resizedTo(
  width: number,
  height: number,
  max: number = MAX_DIMENSION
): { width: number; height: number } {
  if (width <= max && height <= max) return { width, height };
  const scale = max / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Shrink a photo in the browser before it is uploaded.
 *
 * A photo straight off a phone is 3-8MB, which is both slower than the shop
 * should ever load and larger than a server action will accept. Resizing here
 * rather than on the server means the big file never crosses the wire at all.
 *
 * Falls back to the original file on any failure — the server still caps the
 * size, and an unresized-but-valid upload is a far better outcome than an
 * upload button that does nothing.
 */
export async function shrinkForUpload(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = resizedTo(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85)
    );
    // toBlob hands back null when the browser cannot encode webp.
    if (!blob) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp",
    });
  } catch {
    return file;
  }
}
