# EN VIVO · Demo para navegador

Thriller psicológico en tercera persona. Colombia, 1998. La vida de Mateo Rivas es un *reality show* grabado en secreto.

Demo jugable de punta a punta: **aula → pasillo → cafetería (el ataque) → intertítulo → hospital (el despertar) → plano de vigilancia final**. Dura unos 7 a 9 minutos.

## Cómo jugarla

Es un sitio estático, sin instalación ni build. Hay que servir la carpeta por HTTP, porque los módulos de JavaScript no cargan con `file://`:

```bash
# desde la raíz del repositorio
python3 -m http.server 8080
# abrir http://localhost:8080/en-vivo/
```

Para compartirla, basta con publicar el repositorio en GitHub Pages, Netlify o Vercel. La demo queda en `/en-vivo/`.

| Control | Acción |
|---|---|
| WASD / flechas | Moverse |
| Shift | Correr |
| Ratón | Cámara (clic en la pantalla para capturar el ratón) |
| E | Interactuar y adelantar diálogos |
| Esc / P | Pausa (calidad, modo demo, volver al menú) |
| F9 | Activar o desactivar el modo demo |

También funciona con un mando de Xbox o PlayStation.

**Modo demo (se juega solo):** en el menú, "Modo demo". Mateo camina solo, interactúa, la cámara se acomoda y al terminar vuelve a empezar. Sirve para presentarla a inversionistas en una pantalla sin tocar nada.

**Calidad (Bajo / Medio / Alto):** se cambia desde el menú o la pausa y se recuerda. "Bajo" apaga sombras y halo y baja la resolución interna; es el recomendado para gráficas integradas como la Radeon Vega 8. "Alto" suma oclusión ambiental (GTAO), sombras de 2048 px y antialiasing ×4; es para GPU dedicada.

### Atajos para desarrollo

Parámetros de la URL:

- `?escena=cafeteria`: salta directo a una escena (`aula`, `pasillo`, `cafeteria`, `hospital`).
- `&demo=1`: arranca en modo demo.
- `&calidad=bajo`: fuerza una calidad.
- `&vel=3`: acelera el tiempo de juego (para revisar el flujo rápido).

En la consola del navegador, `EN_VIVO` expone el estado del juego (escena, jugador, cámara, posproceso).

## Qué tiene

- **Cámara** detrás del hombro con colisión, planos cinematográficos con fundido entre planos, cámara en mano, temblor en los disparos y barras de cine.
- **Cinemáticas integradas** al juego, con secuencias escritas como guion (`async/await`) en cada escena.
- **Personajes** articulados con animación procedural: caminar, correr, sentarse en el pupitre, agacharse temblando, acostarse, apuntar, gesticular al hablar, parpadear, seguir con la mirada.
- **Momento de tensión jugable:** esconderse detrás de la barra con tiempo límite. Si el jugador no llega, la historia sigue igual.
- **Cámaras ocultas con LED rojo** en todos los escenarios. Algunas siguen al jugador. Si el jugador mira una, aparece "● REC".
- **Gradación de película de 1998:** sombras frías, luces cálidas, halo, grano, viñeta y aberración cromática. Hay un modo CCTV para el final y desenfoque para el desmayo.
- **Audio 100 % sintetizado por código:** disparos, gritos, timbre, murmullo, ventiladores, monitor cardíaco, latido, pitido de oídos, máquina de escribir y jingle. El sonido se "ahoga" (paso bajo y reverberación) en el golpe y el desmayo.
- **Todo generado por código:** texturas (terrazo, madera, yeso, telas, afiches, tablero, mural, calendario), utilería de los 90 y exteriores. No hay que descargar ningún recurso.

## Estructura

```
en-vivo/
  index.html            Página, interfaz (HTML) y mapa de importación
  css/envivo.css        Estilo de la interfaz
  js/main.js            Bucle, carga de escenas, pausa, calidad y modo demo
  js/script.js          ← GUION: todos los diálogos, intertítulos y objetivos
  js/player.js          Jugador: estados, movimiento, colisión, interacción y piloto automático
  js/core/              Reloj de juego, entrada, interfaz, audio, cámara y posproceso
  js/world/build.js     Constructor de escenarios: texturas, materiales, cuartos, luces, haces y polvo
  js/world/characters.js  Personajes, poses y vestuario
  js/world/props.js     Utilería: pupitres, tablero, teléfono público, TV de tubo, cama de hospital...
  js/world/objects.js   Interactuables, zonas, cámaras ocultas, ventiladores y estática
  js/scenes/            Una escena por archivo: construcción y dirección (cinemática + juego)
  js/vendor/three/      Three.js r160 (MIT), incluido para que funcione sin internet
  docs/TRASPASO.md      Resumen del documento de diseño original
```

Para cambiar un diálogo basta con editar `js/script.js`.

## Lo que falta para llegar a nivel *The Last of Us*

La parte técnica está resuelta: cámara, cinemáticas, iluminación, gradación, audio y flujo. Lo que separa esta demo de un AAA son los **recursos de arte**, que no se pueden generar por código:

1. **Personajes reales.** Hoy son maniquíes articulados. Hace falta Mateo, Andrés, el tirador y el profesor con caras, pelo con tarjetas (*hair cards*), ropa y piel de calidad: Character Creator 4, escaneos o Tripo3D con exportación. Se cargan como `.glb` con `GLTFLoader` en lugar de `buildBody()` en `characters.js`.
2. **Captura de movimiento.** Las animaciones de Mixamo que ya tienen (y las que faltan: pistola, golpe, agachado con miedo) reemplazan la animación procedural con `AnimationMixer`.
3. **Voces.** Actores de doblaje colombianos para los diálogos.
4. **Modelos de utilería y texturas escaneadas.** Los modelos de Poly Haven (CC0) de la lista del documento de traspaso reemplazan las primitivas de `props.js`.
5. **Iluminación precalculada.** Hornear *lightmaps* en Blender para cada escenario multiplica el realismo sin costo de rendimiento.
6. **Música y diseño sonoro** con grabaciones reales.

Si el objetivo final es PC con calidad AAA, esta demo sirve como prototipo de dirección (ritmo, planos y guion). El paso siguiente es llevarla a Unity o Unreal con esos recursos.
