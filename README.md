# RedBot Web

Sitio web oficial de **RedBot** — [redbot.me](https://redbot.me)

## Estructura del proyecto

```
.
├── index.html          # Página principal
├── privacy/
│   └── index.html      # Política de privacidad  → redbot.me/privacy
├── tos/
│   └── index.html      # Términos de servicio    → redbot.me/tos
├── staff/
│   └── index.html      # Equipo                  → redbot.me/staff
├── CNAME               # Dominio personalizado (redbot.me)
└── site.webmanifest    # Manifiesto PWA
```

## Desarrollo local

No requiere ninguna dependencia ni herramienta de compilación. Basta con abrir
cualquier archivo HTML directamente en el navegador, o usar un servidor local
simple:

```bash
# Python 3
python -m http.server 8080
# Luego visita http://localhost:8080
```

## Despliegue (cómo ver los cambios en el sitio web)

El sitio se publica automáticamente mediante **GitHub Pages** desde la rama
`main`.

Cuando se hace un **merge a `main`**, GitHub Pages detecta el cambio y
redesplega el sitio en pocos minutos. No hay ningún paso manual adicional.

### Flujo de trabajo

```
1. Crea una rama con tus cambios (o usa la rama del PR actual)
2. Abre un Pull Request hacia `main`
3. Revisa y haz merge del PR
4. GitHub Actions ejecuta "pages build and deployment" automáticamente
5. El sitio en https://redbot.me se actualiza en ~1 minuto
```

Puedes ver el estado del último despliegue en la pestaña
[Actions](https://github.com/ImNotCarzo/RedBot-web/actions/workflows/pages/pages-build-deployment)
del repositorio.

## Licencia

[MIT](LICENSE)
