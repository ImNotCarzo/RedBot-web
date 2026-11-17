export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Reenviar /api y /api/* (incluyendo /api/oauth/callback, /api/auth/*, /api/tickets/*) al bot
    const isApi = url.pathname === "/api" || url.pathname.startsWith("/api/");

    if (isApi && env.REDBOT_API_URL) {
      const base = env.REDBOT_API_URL.replace(/\/+$/, "");
      const target = `${base}${url.pathname}${url.search}`;

      const headers = new Headers(request.headers);
      // Solo inyectar REDBOT_API_KEY si el cliente no envía ya su propio Bearer token (sesión del dashboard)
      if (env.REDBOT_API_KEY && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${env.REDBOT_API_KEY}`);
      }
      headers.delete("host");

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
    }

    // Todo lo demás sirve los archivos estáticos (HTML/CSS/JS)
    return env.ASSETS.fetch(request);
  },
};
