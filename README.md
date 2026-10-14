# BŪR FEST ¡El Parche! · Web + webapp

Propuesta de web oficial para **BŪR FEST**, el festival de hamburguesas en sitio más grande de Colombia ([@burfest.col](https://www.instagram.com/burfest.col/)), pensada para la edición de **Bogotá, noviembre de 2026**. Reemplaza el Linktree.

> Estado: **propuesta / demo funcional.** Las marcas, precios de los pases, horarios y aliados son contenido de ejemplo. Todo se edita en `js/data.js`.

## Qué incluye

| Sección | Qué hace |
|---|---|
| **Hero** | Identidad del IG (cielo, toldo rosado, contorno negro), cuenta regresiva y Bogotá ilustrada. |
| **¿Qué es BŪR FEST?** | Pitch, cifras clave (16 marcas, 3 días, ingreso $0) y cómo funciona en 4 pasos. |
| **Ediciones** | Bogotá (próxima) y Medellín (EAFIT, 16 al 18 de octubre de 2026). Se agregan ciudades desde `data.js`. |
| **Marcas** | Hamburguesas por edición con filtros, búsqueda, favoritas, ficha con calificación de 1 a 5 ★ y botón para compartir. |
| **Ranking en vivo** | Top 5 según los votos del público. |
| **Boletas** | Ingreso **gratis con registro** y QR, más pases pagos opcionales (Fast Pass y Combo). Checkout con Tarjeta, PSE, Nequi o Daviplata. |
| **Sorteo** | "Esta boleta no se compra, se gana", con los pasos de la dinámica en IG. |
| **Ubicación y horarios** | Mapa, "Cómo llegar" (Google Maps) y "Agregar al calendario" (.ics). |
| **Preinscripción** | Formulario para hamburgueserías con validación y aviso de la Ley 1581. |
| **Aliados** | Muro de patrocinadores y CTA "Quiero ser aliado". |
| **Mi BŪR FEST** | La webapp: mis boletas con QR (funciona sin señal), mi ruta de hamburguesas y mis votos. |
| **`links.html`** | Reemplazo del Linktree con la marca, para la bio de Instagram. |

**Webapp (PWA):** se instala en el celular desde el navegador, sin pasar por App Store ni Play Store. Funciona sin conexión (service worker), tiene barra de navegación inferior tipo app y accesos directos.

## Cómo verla

Sitio estático, sin build:

```bash
npx serve .        # o: python3 -m http.server 8080
```

Para publicarla gratis: Netlify, Vercel o GitHub Pages (basta con arrastrar la carpeta).

## Fase 2: producción (lo que falta para operar de verdad)

1. **Pasarela de pagos:** Wompi (Bancolombia), Mercado Pago o ePayco para los pases pagos, con PSE, Nequi y Daviplata.
2. **Backend:** Supabase o Firebase para registros, boletas, votos reales (1 voto por boleta y por hamburguesa) y preinscripciones. El formulario ya soporta `formEndpoint` en `data.js` (sirve, por ejemplo, Google Apps Script con Google Sheets).
3. **Correo con la boleta:** envío automático del QR (Resend o SendGrid).
4. **App de taquilla:** escáner de QR para validar entradas en la puerta.
5. **Panel de administración:** para que el equipo cargue marcas, fotos, horarios y aliados sin tocar código.
6. **Dominio:** `burfest.co` o similar, y en la bio de IG `burfest.co/links`.
7. **Analítica:** Meta Pixel y GA4 para medir conversiones de las pautas.

## Estructura

```
index.html            Página principal (one-page + webapp)
links.html            Reemplazo del Linktree
css/styles.css        Estilos (identidad BŪR FEST)
js/data.js            ← CONTENIDO EDITABLE
js/app.js             Lógica
js/vendor/qrcode.js   Generador de QR (MIT, Kazuhiko Arase)
manifest.webmanifest  Configuración PWA
sw.js                 Service worker (modo sin conexión)
icons/                Íconos de la app
```

> El logo de la web es una recreación en texto. Para producción hay que reemplazarlo por el SVG o PNG oficial de la marca.
