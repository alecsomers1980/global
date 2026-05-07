const ALLOWED_TAGS = new Set([
  "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "b", "i",
  "a", "blockquote", "br", "hr", "code", "pre", "span",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
  span: new Set(["class"]),
};

const URL_SAFE = /^(https?:|mailto:|tel:|\/|#)/i;

export function sanitizeArticleHtml(input: string): string {
  if (!input) return "";

  let html = input.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<\?[\s\S]*?\?>/g, "");

  const out: string[] = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt < 0) {
      out.push(escapeText(html.slice(i)));
      break;
    }
    if (lt > i) out.push(escapeText(html.slice(i, lt)));

    const gt = findTagEnd(html, lt);
    if (gt < 0) {
      out.push(escapeText(html.slice(lt)));
      break;
    }

    const raw = html.slice(lt, gt + 1);
    const isClosing = raw[1] === "/";
    const tagMatch = raw.match(/^<\/?\s*([a-zA-Z][a-zA-Z0-9]*)/);
    const name = tagMatch?.[1]?.toLowerCase();

    if (!name || !ALLOWED_TAGS.has(name)) {
      i = gt + 1;
      continue;
    }

    if (isClosing) {
      out.push(`</${name}>`);
      i = gt + 1;
      continue;
    }

    const selfClosing = raw.endsWith("/>");
    const attrSrc = raw.replace(/^<\s*[a-zA-Z][a-zA-Z0-9]*/, "").replace(/\/?>$/, "");
    const safeAttrs = parseAttrs(attrSrc, name);
    out.push(`<${name}${safeAttrs}${selfClosing && (name === "br" || name === "hr") ? " /" : ""}>`);
    i = gt + 1;
  }

  return out.join("");
}

function findTagEnd(html: string, start: number): number {
  let inDQ = false, inSQ = false;
  for (let j = start + 1; j < html.length; j++) {
    const c = html[j];
    if (!inDQ && c === "'") inSQ = !inSQ;
    else if (!inSQ && c === '"') inDQ = !inDQ;
    else if (!inDQ && !inSQ && c === ">") return j;
  }
  return -1;
}

function parseAttrs(src: string, tag: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return "";
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const name = m[1].toLowerCase();
    if (!allowed.has(name)) continue;
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    if (name === "href") {
      if (!URL_SAFE.test(value)) continue;
    }
    if (name === "target") {
      parts.push(`target="${escapeAttr(value)}"`);
      continue;
    }
    parts.push(`${name}="${escapeAttr(value)}"`);
  }
  if (tag === "a" && parts.some((p) => p.startsWith("target="))) {
    if (!parts.some((p) => p.startsWith("rel="))) {
      parts.push('rel="noopener noreferrer nofollow"');
    }
  }
  return parts.length ? " " + parts.join(" ") : "";
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
