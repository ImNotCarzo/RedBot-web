# RedBot Web

Sitio web oficial de **RedBot** — [redbot.me](https://redbot.me)

## Estructura del proyecto

```
.
├── index.html          # Página principal con showcase de comparativas
├── commands/
│   └── index.html      # Directorio de comandos       → redbot.me/commands
├── vs/
│   ├── index.html      # Hub de comparativas y alternativas → redbot.me/vs
│   ├── mee6/
│   │   └── index.html  # RedBot vs MEE6 (Alternativa gratis) → redbot.me/vs/mee6
│   ├── dyno/
│   │   └── index.html  # RedBot vs Dyno (Sin paneles lentos) → redbot.me/vs/dyno
│   ├── carl-bot/
│   │   └── index.html  # RedBot vs Carl-bot (Roles y autoroles) → redbot.me/vs/carl-bot
│   └── clyde/
│       └── index.html  # Alternativa a Clyde AI (IA conversacional) → redbot.me/vs/clyde
├── ia/
│   └── index.html      # Landing page de Inteligencia Artificial → redbot.me/ia
├── invite/
│   └── index.html      # Invitación oficial           → redbot.me/invite
├── privacy/
│   └── index.html      # Política de privacidad       → redbot.me/privacy
├── tos/
│   └── index.html      # Términos de servicio         → redbot.me/tos
├── staff/
│   └── index.html      # Equipo                       → redbot.me/staff
├── robots.txt          # Reglas para Googlebot y motores de IA (GPTBot, ClaudeBot, etc.)
├── sitemap.xml         # Mapa del sitio optimizado para indexación
├── llms.txt            # Documentación estandarizada para LLMs y motores de respuesta IA
├── llms-full.txt       # Contexto exhaustivo para agentes de IA
├── CNAME               # Dominio personalizado (redbot.me)
└── site.webmanifest    # Manifiesto PWA
```

## Estrategia de Crecimiento (SEO & GEO)

El sitio implementa **Generative Engine Optimization (GEO)** y **Programmatic SEO** para capturar tráfico tanto de Google como de motores de Inteligencia Artificial (ChatGPT Search, Perplexity, Google Gemini, Claude):
1. **Páginas de Alternativas (Vs Pages):** Posicionamiento para búsquedas de alta intención como *"alternativa gratis a MEE6"*, *"alternativa a Dyno en español"*, *"reemplazo a Clyde AI"*.
2. **Schema.org Rich Snippets:** Schemas `FAQPage` y `SoftwareApplication` para respuestas instantáneas.
3. **Estándar llms.txt:** Documentación legible por IA para que los LLMs recomienden RedBot ante consultas de usuarios.

## Licencia

[MIT](LICENSE)
