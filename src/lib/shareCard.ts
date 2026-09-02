import { getFontEmbedCSS, toBlob } from "html-to-image";

/**
 * Rasterizes a DOM node to a PNG and hands it to the OS share sheet
 * (WhatsApp / Instagram / etc.) via the Web Share API. Falls back to a
 * file download when sharing files isn't supported (most desktops).
 */
export async function shareNodeAsImage(
  node: HTMLElement,
  opts: { fileName: string; title?: string; text?: string },
): Promise<"shared" | "downloaded"> {
  // Web fonts (Montserrat, Material Symbols) must be loaded before capture,
  // otherwise the first render drops glyphs.
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }

  // Embed @font-face rules (Montserrat, Material Symbols) up front so the
  // rasterized clone keeps its icon glyphs and display font.
  let fontEmbedCSS: string | undefined;
  try {
    fontEmbedCSS = await getFontEmbedCSS(node);
  } catch {
    /* best effort */
  }

  const options = {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#0e0e0e",
    fontEmbedCSS,
  };

  // First pass primes the loader; the second is the one we keep.
  await toBlob(node, options);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error("falha ao renderizar o card");

  const file = new File([blob], opts.fileName, { type: "image/png" });

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({ files: [file], title: opts.title, text: opts.text });
      return "shared";
    } catch (err) {
      // User dismissed the share sheet — not an error.
      if ((err as Error).name === "AbortError") return "shared";
      // Anything else: fall through to download.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
