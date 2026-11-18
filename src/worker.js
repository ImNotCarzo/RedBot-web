export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Reenviar /api y /api/* (incluyendo /api/oauth/callback, /api/auth/*, /api/tickets/*) al bot
    const isApi = url.pathname === "/api" || url.pathname.startsWith("/api/");

    if (isApi && env.REDBOT_API_URL) {
      const base = env.REDBOT_API_URL.replace(/\/+$/, "");
      const target = `${base}${url.pathname}${url.search}`;

      const headers = new Headers(request.headers);
      const clientIp = request.headers.get("CF-Connecting-IP");
      if (clientIp) {
        headers.set("X-Forwarded-For", clientIp);
      }

      const isUserAuthRoute =
        url.pathname === "/api/tickets" ||
        url.pathname.startsWith("/api/tickets/") ||
        url.pathname.startsWith("/api/auth/") ||
        url.pathname.startsWith("/api/dashboard/");

      // Solo inyectar REDBOT_API_KEY en endpoints públicos/de datos, nunca en rutas de sesión de usuario
      if (env.REDBOT_API_KEY && !isUserAuthRoute && !headers.has("Authorization")) {
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
