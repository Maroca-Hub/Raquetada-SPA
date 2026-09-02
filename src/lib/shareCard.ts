import { getFontEmbedCSS, toBlob } from "html-to-image";

/**
 * Rasterizes a DOM node to a PNG and hands it to the OS share sheet
 * (WhatsApp / Instagram / etc.) via the Web Share API. Falls back to a
 * file download when sharing files isn't supported (most desktops).
 */
export async function shareNodeAsImage(
  node: HTMLElement,
  opts: { fileName: string; title?: string; text?: string; url?: string },
): Promise<"shared" | "downloaded"> {
  // Web fonts (Montserrat, Material Symbols) must be loaded before capture,
  // otherwise the first render drops glyphs.
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }

  // html-to-image chokes on cross-origin <img> it can't inline (the player
  // photo is served by the API on another origin): when the fetch is blocked
  // the raster bails halfway and the card loses its gradient / glow / accent
  // bar. Capture a detached clone instead and inline every image up front so
  // the rest of the styling always renders.
  const clone = node.cloneNode(true) as HTMLElement;
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    "position:fixed;left:-10000px;top:0;pointer-events:none";
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    await inlineImages(clone);

    // Embed @font-face rules (Montserrat, Material Symbols) up front so the
    // rasterized clone keeps its icon glyphs and display font.
    let fontEmbedCSS: string | undefined;
    try {
      fontEmbedCSS = await getFontEmbedCSS(clone);
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
    await toBlob(clone, options);
    const blob = await toBlob(clone, options);
    if (!blob) throw new Error("falha ao renderizar o card");

    const file = new File([blob], opts.fileName, { type: "image/png" });

    const canShareFiles =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] });

    if (canShareFiles) {
      try {
        await navigator.share({
          files: [file],
          title: opts.title,
          text: opts.text,
          url: opts.url,
        });
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
  } finally {
    holder.remove();
  }
}

/**
 * Swaps every <img> in the tree for an inline data URL. If an image can't be
 * fetched, it's replaced by the first letter of its alt text (matching the
 * Avatar fallback) so it can never corrupt the raster.
 */
async function inlineImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith("data:")) {
        await safeDecode(img);
        return;
      }

      const dataUrl = await fetchAsDataUrl(src);
      if (dataUrl) {
        img.removeAttribute("crossorigin");
        img.src = dataUrl;
        await safeDecode(img);
        return;
      }

      const parent = img.parentElement;
      const initial = (img.alt.trim().charAt(0) || "?").toUpperCase();
      img.remove();
      if (parent && !parent.textContent?.trim()) parent.textContent = initial;
    }),
  );
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  const attempts: RequestInit[] = [
    { mode: "cors", cache: "no-cache" },
    { mode: "cors", cache: "no-cache", credentials: "include" },
  ];
  for (const init of attempts) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) continue;
      const blob = await res.blob();
      return await blobToDataUrl(blob);
    } catch {
      /* try the next strategy */
    }
  }
  return null;
}

function blobToDataUrl(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

async function safeDecode(img: HTMLImageElement): Promise<void> {
  try {
    await img.decode?.();
  } catch {
    /* a broken image shouldn't block the capture */
  }
}
