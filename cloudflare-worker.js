/**
 * Manga & Comic Tradutor — Cloudflare Worker
 * Busca a página pública de um capítulo e identifica imagens candidatas.
 * Não contorna login, paywall, CAPTCHA ou bloqueios do site de origem.
 */
const ALLOWED_ORIGIN = "https://contapvoleii-design.github.io";

function cors(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" }
  });
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractImages(html, pageUrl) {
  const found = new Set();
  const patterns = [
    /<img\b[^>]*>/gi,
    /<source\b[^>]*>/gi,
    /<meta\b[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/gi
  ];
  for (const pattern of patterns) {
    for (const tag of html.match(pattern) || []) {
      const attrs = [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)];
      const values = {};
      for (const m of attrs) values[m[1].toLowerCase()] = decodeEntities(m[2] || m[3] || m[4] || "");
      const candidates = [
        values.src, values["data-src"], values["data-lazy-src"],
        values["data-original"], values["data-url"], values.srcset,
        values["data-srcset"], values.content
      ].filter(Boolean);
      for (const candidate of candidates) {
        const first = candidate.split(",")[0].trim().split(/\s+/)[0];
        if (!first || first.startsWith("data:")) continue;
        try {
          const absolute = new URL(first, pageUrl);
          if (absolute.protocol === "https:" || absolute.protocol === "http:") {
            if (!/\.svg(?:$|\?)/i.test(absolute.pathname)) found.add(absolute.href);
          }
        } catch {}
      }
    }
  }
  return [...found].slice(0, 80);
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== "GET") return json({ error: "Método não permitido." }, 405, origin);

    const requestUrl = new URL(request.url);
    const chapter = requestUrl.searchParams.get("url");
    if (!chapter) return json({ error: "Informe o link do capítulo no parâmetro url." }, 400, origin);

    let target;
    try { target = new URL(chapter); }
    catch { return json({ error: "Link inválido." }, 400, origin); }
    if (!["http:", "https:"].includes(target.protocol)) {
      return json({ error: "Somente links HTTP ou HTTPS são aceitos." }, 400, origin);
    }

    try {
      const response = await fetch(target.href, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MangaComicTradutor/1.0)",
          "Accept": "text/html,application/xhtml+xml"
        },
        redirect: "follow"
      });
      if (!response.ok) return json({ error: "O site de origem respondeu com HTTP " + response.status + "." }, 502, origin);
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return json({ error: "O link não retornou uma página HTML." }, 415, origin);
      const html = await response.text();
      if (html.length > 5_000_000) return json({ error: "A página é grande demais para processar." }, 413, origin);
      const images = extractImages(html, response.url || target.href);
      return json({
        pageTitle: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || target.hostname).replace(/<[^>]+>/g, "").trim().slice(0, 180),
        pageUrl: response.url || target.href,
        images,
        count: images.length,
        note: "Somente imagens públicas encontradas no HTML. Alguns sites carregam páginas por JavaScript ou exigem acesso autorizado."
      }, 200, origin);
    } catch {
      return json({ error: "Não foi possível acessar esse site. Ele pode bloquear solicitações externas." }, 502, origin);
    }
  }
};
