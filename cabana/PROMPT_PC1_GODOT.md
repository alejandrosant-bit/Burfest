# Prompt para Claude Code · PC 1 (programación en Godot)

Copia todo lo que está debajo de la línea y pégalo en Claude Code, abierto en la carpeta del repositorio `old-man-winter` en el PC 1.

---

Vas a programar conmigo la **demo v0.1 de *Old Man Winter***, un juego de supervivencia zombi *low-poly* con cámara alta, en **Godot 4** (GDScript con tipos estáticos). Trabajas en mi PC y puedes ejecutar Godot por línea de comandos. Los modelos 3D los hace otro PC con Blender; tú los integras.

**Antes de nada, lee:** `docs/DISENO_DEMO.md` (manda para todo lo de la demo), `docs/HISTORIA.md`, `docs/BIBLIA_SECRETA.md` (la verdad completa: úsala para que todo sea coherente, pero ningún texto del juego debe revelar más de lo que indica `HISTORIA.md`) y `docs/VISION.md` (contexto del juego completo; no implementes lo que no esté en el diseño de la demo).

## Reglas de trabajo

**Ahorro de tokens:**
- Respuestas cortas. No pegues archivos completos ni repitas código; resume qué cambió.
- No releas archivos que acabas de escribir. Lee sólo lo necesario.
- Agrupa cambios relacionados. No expliques teoría salvo que te lo pida.

**Confirmar antes de actuar:**
- Antes de cada fase, muéstrame un plan de 5 a 10 líneas y espera mi "dale".
- Pídeme permiso antes de instalar algo, borrar archivos o descargar recursos.
- No digas que algo funciona sin verificarlo. Si falla, muéstrame el error real.

**Verificación en cada fase:**
1. `godot --headless --path . --import` y luego `godot --headless --path . --quit-after 300`; la salida no debe tener `ERROR` ni `SCRIPT ERROR`.
2. **Captura automática:** una bandera de depuración (`--screenshot`) que arranca el juego, espera unos segundos, guarda `res://_capturas/fase_N.png` y cierra. Mira la imagen y compárala con la dirección de arte antes de reportar.
3. **Rendimiento:** mide los fps en este PC en la escena más cargada de la fase y dímelos.

## Por ahora, un solo PC

Mientras mi compañero no se sume, **también haces el arte en Blender en este mismo PC**: lee y sigue `docs/PROMPT_PC2_BLENDER.md` para todo lo de modelos y animaciones. Trabaja por tandas (modelos de la fase, luego integración), usa Blender sin ventana (`--background`) siempre que puedas y no tengas Blender y Godot abiertos a la vez. Mantén igual las ramas `arte/...` y `codigo/...` y la lista `docs/ASSETS.md`, para poder delegar después.

## Este PC

- Gráfica **AMD Radeon Vega 8 integrada y 8 GB de RAM**. Renderizador **Mobile**. Meta: **60 fps estables** aquí.
- Cierra lo que no uses. Si un modelo del PC 2 se pasa del presupuesto de `docs/DISENO_DEMO.md`, avísame en vez de aceptarlo.

## Git y coordinación con el PC 2

- Trabaja en ramas `codigo/<tema>` y une a `main` sólo cuando yo apruebe la fase. Git LFS para `*.glb`, `*.png`, `*.wav`, `*.ogg`.
- **Tus carpetas:** `scenes/`, `scripts/`, `autoload/`, `data/`, `shaders/`, `ui/`, `localization/`, `docs/`. **No toques** `tools/blender/`, `assets/models/`, `assets/textures/` ni `assets/animations/` (son del PC 2).
- **Pide modelos en `docs/ASSETS.md`**, una fila por modelo: nombre del archivo, descripción, medidas en metros, presupuesto de triángulos, si lleva colisión y qué animaciones necesita. Estado: `pedido` → (el PC 2 lo pasa a `en proceso` → `entregado`).
- Mientras no llega un modelo, usa una **caja provisional con el mismo nombre y tamaño**, en una escena envolvente (`scenes/props/<nombre>.tscn`), para cambiarla después sin tocar código.
- Antes de cada fase, haz `git pull` de `main` para recibir lo que entregó el PC 2.

## Arquitectura

```
res://
  autoload/      GameState (día, hora, estación, partida), Events (señales), Audio, Settings
  scenes/        main_menu, intro, cabin, forest, lake, exp_gas_station, exp_marbreich, player, dog, zombie, props/, ui/
  scripts/       sistemas: needs, health, stamina, inventory, search, crafting, tool_panel, building_grid,
                 power, combat, noise, waves, radio, missions, expeditions, skills, seasons, pacing, currency
  data/          recursos .tres: items, armas, recetas, herramientas, SeasonData, PacingData, boletines, misiones, zonas
  shaders/       toon (dos tonos), snow, ice
  localization/  textos.csv (keys,en,es)
```

- **Los datos van en recursos `.tres`**, nunca quemados en el código (valores de supervivencia, armas, oleadas, estaciones, ritmo).
- **Textos sólo con `tr("CLAVE")`**; idioma inicial según el sistema, selector en opciones; fuente OFL con tildes, ñ, ¿ y ¡.
- **Preparado para el futuro** (sin implementarlo): la lógica separada de lo visual, cada jugador es una entidad con identificador, las acciones son comandos (`golpear`, `construir`, `reparar`, `curar`), habilidades en cuatro ramas (Medicina, Caza, Construcción, Armería).
- **Zonas como escenas independientes** con transición y carga; el estado del jugador y de la cabaña persiste entre zonas.
- **Muerte permanente:** guardado automático sólo al amanecer, que se borra al morir.

## Cámara, movimiento y sensación

- Cámara en perspectiva alta en tres cuartos (unos 55° hacia abajo, FOV de unos 35°), seguimiento suave, zoom limitado con la rueda.
- **La casa "se abre":** al entrar, el techo desaparece y las paredes que dan a la cámara bajan a un zócalo en unos 0,4 s; al salir, todo vuelve. Igual en los edificios de las expediciones.
- Movimiento con aceleración y frenado, giro con interpolación, **interpolación de física** activada.
- **AnimationTree:** BlendSpace2D de locomoción, máquina de estados con fundidos de 0,1 a 0,2 s y **capas de cuerpo** (las piernas caminan mientras el torso ataca, bloquea o bebe).
- **Sensación de golpe:** pausa de impacto de 50 ms, sacudida de cámara en golpes pesados, partículas de sangre o nieve, sonido seco.

## Fases (detente al final de cada una con captura y fps)

0. **Entorno:**
   - Versión de Godot.
   - Proyecto Mobile, estructura de carpetas, `.gitignore`, Git LFS y `docs/ASSETS.md` con la primera tanda de pedidos al PC 2: cabaña modular, Anselmo, zombi caminante, perro, árboles, armas iniciales.
1. **Base jugable:**
   - Cámara, movimiento y colisiones.
   - Cabaña provisional con la casa que se abre.
   - Cambio de zona cabaña ↔ bosque ↔ lago.
2. **Combate:** ataque ligero y pesado, empujón, bloqueo, resistencia, armas cortas y pesadas con desgaste, sensación de golpe y zombi caminante básico.
3. **Supervivencia:**
   - Temperatura, hambre y sed, salud al 60 % con vendas, sangrado.
   - Estufa (hervir agua, cocinar, bebidas calientes).
   - Ciclo de día y noche.
   - Muerte permanente.
4. **La cabaña:**
   - Registrar gavetas y armarios con `E`.
   - Banco de trabajo y fabricación.
   - Panel de herramientas con siluetas.
   - Construcción con cuadrícula.
   - Generador frente al método rústico.
   - Cama y guardado.
5. **Amenaza:** oleadas nocturnas, zombis sueltos y horda rara de día, ruido, barricadas con durabilidad y el perro.
6. **Historia y expediciones:**
   - Introducción completa (ver `docs/HISTORIA.md`).
   - Radio de onda corta con boletines y Diario de Misiones.
   - Walkie-talkie.
   - Expediciones a la gasolinera y a Isla Marbreich con libros, manuales y notas.
   - Ramas de habilidad.
7. **Estaciones y economía:** `SeasonData` (invierno jugable, las demás preparadas), menú de depuración F1, Brasas y tienda de muestra.
8. **Interfaz y cierre:**
   - Todas las pantallas en inglés y en español (captura de cada una en los dos idiomas).
   - Balance de los 5 días.
   - Rendimiento final y exportación a Windows para la demo de Steam.

Empieza por la **fase 0**.
