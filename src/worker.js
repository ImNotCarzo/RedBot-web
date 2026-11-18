const PUBLIC_KEY_ROUTES = new Set(["/api/stats", "/api/commands"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Reenviar /api y /api/* (incluyendo /api/oauth/callback, /api/auth/*, /api/tickets/*) al bot
    const isApi = url.pathname === "/api" || url.pathname.startsWith("/api/");

    if (isApi) {
      const rawApiUrl = env.REDBOT_API_URL || "https://redbot.hidenplay.net";
      if (!rawApiUrl) {
        return new Response(JSON.stringify({ error: "API backend not configured" }), {
          status: 503,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      const base = rawApiUrl.replace(/\/+$/, "");
      const target = `${base}${url.pathname}${url.search}`;

      const headers = new Headers(request.headers);
      const clientIp = request.headers.get("CF-Connecting-IP");
      if (clientIp) {
        headers.set("X-Forwarded-For", clientIp);
      } else {
        headers.delete("X-Forwarded-For");
      }

      const normalizedPath = url.pathname.replace(/\/+$/, "") || "/api";
      // Solo inyectar REDBOT_API_KEY en endpoints públicos de datos explícitamente permitidos
      if (
        env.REDBOT_API_KEY &&
        PUBLIC_KEY_ROUTES.has(normalizedPath) &&
        !headers.has("Authorization")
      ) {
        headers.set("Authorization", `Bearer ${env.REDBOT_API_KEY}`);
      }
      headers.delete("host");

      try {
        const res = await fetch(target, {
          method: request.method,
          headers,
          body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
          redirect: "manual",
        });

        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      } catch {
        return new Response(JSON.stringify({ error: "Upstream unavailable" }), {
          status: 502,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
    }

    // Todo lo demás sirve los archivos estáticos (HTML/CSS/JS)
    return env.ASSETS.fetch(request);
  },
};
