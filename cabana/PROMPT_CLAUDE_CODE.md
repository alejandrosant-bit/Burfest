# Prompt para Claude Code (sesión local en el PC)

Copia todo lo que está debajo de la línea y pégalo en Claude Code, abierto en una carpeta vacía donde quieras el proyecto.

---

Vas a construir conmigo la demo jugable de un juego de supervivencia zombi en **Godot 4** (GDScript) con modelos hechos en **Blender** mediante scripts de Python. Trabajas en mi PC: puedes ejecutar Godot y Blender por línea de comandos.

## Reglas de trabajo (léelas primero)

**Ahorro de tokens:**
- Respuestas cortas. Nada de repetir código que ya escribiste ni de pegar archivos completos en el chat; resume qué cambió.
- No releas archivos que acabas de escribir. Lee sólo las partes que necesitas.
- Agrupa cambios relacionados en una sola tanda de ediciones.
- No expliques teoría salvo que te lo pida.

**Confirmar antes de actuar:**
- Antes de cada fase, muéstrame un plan de 5 a 10 líneas y espera mi "dale".
- Pídeme permiso antes de instalar algo, borrar archivos o descargar recursos.
- Antes de decirme que algo funciona, verifícalo de verdad (ver "Verificación"). Si algo falla, dímelo con el error real; no lo escondas.

**Verificación en cada fase:**
1. Importa y valida el proyecto sin abrir ventana: `godot --headless --path . --import`, y después `godot --headless --path . --quit-after 300`. Revisa que la salida no tenga `ERROR` ni `SCRIPT ERROR`.
2. Captura de pantalla automática: crea una escena o bandera de depuración (`--screenshot`) que arranque el juego, espere unos segundos, guarde una captura en `res://_capturas/fase_N.png` y se cierre. Mira la imagen tú mismo y compárala con la dirección de arte antes de reportar.
3. Para Blender, valida que cada script corra sin errores con `blender --background --python tools/blender/<script>.py` y que el `.glb` exista.

## Paso 0: entorno

- Encuentra los ejecutables de Godot 4 y Blender y dime sus versiones. Si falta alguno, dime cómo instalarlo; no lo instales tú sin permiso.
- Crea el proyecto Godot con renderizador Forward+ para PC. Más adelante, para el celular, se cambiará a Mobile.
- Inicializa git con un `.gitignore` para Godot (`.godot/`, `_capturas/`).
- Detente y repórtame.

## El juego

**Título provisional:** "El Viejo del Lago".

**Premisa:** Anselmo, un aldeano viejo y amargado, vive solo en una cabaña en mitad del bosque, junto a un lago. En la ciudad estalla un apocalipsis zombi y los zombis empiezan a llegar hasta su cabaña. Tiene que sobrevivir oleada tras oleada, reforzar la cabaña, mejorar sus armas y conseguir comida. Agua tiene ilimitada en el lago, pero debe hervirla. Detrás de la cabaña hay un muelle con un bote para buscar recursos en otros lugares.

**Ciclo de juego:**
- **Día (unos 4 minutos):** explorar el mapa, cortar leña, pescar, sacar agua, reparar y construir barricadas, salir en bote.
- **Atardecer:** aviso de oleada ("Se acercan...").
- **Noche (unos 3 minutos):** oleada de zombis. Sobrevivir defendiendo la cabaña.
- La demo dura **3 días**. Al final, pantalla de "Fin de la demo" con estadísticas.

**Sistemas de la demo:**
- **Necesidades:** salud, hambre, sed, calor y energía (barras en la interfaz). El frío baja la salud si el calor llega a 0. La chimenea calienta dentro de la cabaña.
- **Agua:** sacar agua del lago da "agua sucia". Hervirla en la chimenea da "agua potable". Beber agua sucia tiene riesgo de enfermarse.
- **Comida:** pescar en el muelle (minijuego simple de un botón con tiempo), latas conseguidas en el bote, cocinar en la chimenea.
- **Leña:** cortar árboles marcados con el hacha. Hace ruido.
- **Ruido:** cortar, martillar y disparar generan ruido; los zombis cercanos van hacia la fuente. Muestra el ruido como un círculo tenue en el suelo.
- **Construcción y refuerzo:** tablas en puertas y ventanas (con durabilidad, los zombis las golpean hasta romperlas), trampas sencillas de estacas, reparar con tablas y clavos.
- **Armas:** hacha (cuerpo a cuerpo), escopeta (pocas balas, mucho ruido). Mejoras en un banco de trabajo con chatarra: más daño, más durabilidad.
- **Inventario** en cuadrícula con barra rápida de 5 espacios. **Fabricación** en el banco de trabajo y **cocina** en la chimenea.
- **Bote:** en el muelle se abre un menú de expedición con 3 destinos (gasolinera, cabaña vecina, campamento abandonado). Cada uno tiene riesgo, duración en horas del día y botín aleatorio, más un evento de texto con decisión (por ejemplo: "Oyes algo en el baño. ¿Abres la puerta?"). En la demo no hay niveles fuera del mapa; todo se resuelve en el menú.
- **El lago se congela:** cada día el hielo avanza desde las orillas (se ve en el agua). En el día 3 el bote ya no puede salir y algunos zombis llegan cruzando el hielo por detrás.
- **Radio:** en la cabaña, al interactuar, suenan boletines de emergencia con texto en pantalla (uno por día) que cuentan cómo cayó la ciudad. Anselmo responde con un comentario gruñón.
- **Zombis:** dos tipos en la demo. "Caminante": lento, aguanta golpes. "Corredor": rápido, débil, aparece desde la segunda noche. Usan navegación con NavigationAgent3D, golpean barricadas y persiguen ruido y al jugador.
- **Interior y exterior, la casa "se abre" (vista de maqueta):** al entrar a la cabaña, en una transición suave de unos 0,4 s:
  - El techo desaparece.
  - Las dos paredes que dan hacia la cámara bajan hasta quedar como un zócalo de unos 30 cm, con el borde superior de la madera visible.
  - Las dos paredes del fondo quedan completas.
  - Desde arriba se ve todo el cuarto con el jugador adentro.

  Al salir, todo vuelve a cerrarse. El interior se ilumina con luz naranja cálida que contrasta con el azul frío de afuera, y esa luz se derrama por la puerta y las ventanas sobre la nieve. Los zombis que se acercan se siguen viendo afuera.
- **Guardado:** opcional en la demo. Si sobra tiempo, guardar al empezar cada día.

**Mapa (pequeño y a mano):**
- Un claro de unos 60 × 60 m rodeado de bosque denso que hace de límite.
- Cabaña de madera de dos ambientes (sala con chimenea y radio; cuarto con cama y banco de trabajo) y un porche con escalones. Interior según la referencia:
  - Piso de tablas oscuras y paredes de madera cálida.
  - Estufa de leña de hierro con una tetera encima (ahí se hierve el agua y se cocina).
  - Mesa de madera con una silla.
  - Radio vieja sobre un mueble y un reloj de pared.
  - Abrigo colgado en un perchero, un cuadro o tapete en la pared, una ventana y una puerta trasera hacia el lago.
- Postes de luz con cables que llegan a la cabaña. Se pueden cortar en una noche: la casa se queda sin luz eléctrica y sólo alumbra la estufa.
- Camioneta vieja roja abandonada con nieve encima (de ahí sale chatarra), un columpio de llanta colgado de un árbol, leñera, letrina.
- Detrás de la cabaña: lago con muelle de madera y un bote de remos.
- Sendero de entrada desde el bosque por donde llegan los zombis desde la ciudad (al fondo, un resplandor naranja de incendio en el horizonte).

## Dirección de arte (sigue las imágenes de referencia que te daré)

- **Low-poly de sombreado plano**, pocos polígonos y siluetas claras. Árboles desnudos de ramas angulosas y pinos de capas.
- **Iluminación en dos tonos (*toon*)** con shader propio: luz y sombra en dos bandas nítidas, sombras largas de luna, color de sombra azul marino (no negro).
- **Paleta nocturna:**

  | Elemento | Color |
  |---|---|
  | Cielo / niebla | `#1E2A4A` |
  | Nieve iluminada | `#C9D6F0` |
  | Nieve en sombra | `#5B6C9E` |
  | Sombras profundas | `#2B3666` |
  | Madera | `#5A4636` |
  | Luz cálida de ventanas y chimenea | `#FFB347` |
  | Acento (bufanda de Anselmo, camioneta) | `#D6452F` |

- **Luces:** DirectionalLight3D de luna fría y suave. OmniLight3D naranja en ventanas, chimenea y faroles, que derraman luz cálida sobre la nieve.
- **Ambiente:**
  - Niebla de profundidad suave, *bloom* leve en las luces cálidas y *tonemap* fílmico.
  - Nieve cayendo con GPUParticles3D.
  - Huellas que quedan en la nieve detrás del jugador y los zombis (decals o malla en el suelo, que se desvanecen con el tiempo).
- **Día:** la misma dirección de arte con cielo gris azulado claro, nieve blanca y sombras celestes. Haz la transición día/noche animando la luz y el entorno.
- **Cámara:** perspectiva alta en tres cuartos, unos 55° hacia abajo, FOV bajo (unos 35°). Sigue al jugador con suavidad, sin rotación libre en la demo, con zoom limitado con la rueda del ratón.
- **Personaje:** Anselmo, figura robusta de abrigo oscuro, gorro y bufanda roja. Zombis con ropa de ciudad desteñida y piel gris verdosa, en el mismo estilo.

## Interfaz (terminada en la demo)

- Estilo limpio, plano y legible, con la paleta del juego; fuente libre con licencia OFL de Google Fonts.
- **HUD:**
  - Las cinco barras de necesidades, abajo a la izquierda.
  - Barra rápida, abajo al centro.
  - Reloj del día y número de noche, arriba al centro.
  - Munición y arma actual, abajo a la derecha.
  - Aviso grande de "NOCHE 1 · SE ACERCAN".
- **Pantallas:** inventario y fabricación, cocina, expedición en bote, radio con texto, pausa con opciones (volumen y calidad), menú principal con la cabaña de fondo, muerte y fin de demo.
- **Pensada para el celular desde ya:**
  - Todo escala con anclajes.
  - Botones grandes.
  - Acciones mapeadas en el Input Map (`move`, `attack`, `interact`, `build`, `inventory`).
  - Una capa de controles táctiles (joystick y botones) que se activa sólo en pantallas táctiles.

## Arquitectura

```
res://
  autoload/      GameState.gd (día, hora, oleada, necesidades), Events.gd (señales globales), Audio.gd
  scenes/        main_menu, world (mapa), cabin, player, zombie, ui/
  scripts/       sistemas: needs, inventory, crafting, building, noise, waves, boat_expedition, ice, radio
  data/          recursos .tres: items, recetas, destinos del bote, boletines de radio
  assets/models/ .glb exportados desde Blender
  assets/audio/  sonidos
  shaders/       toon.gdshader, snow, water_ice
tools/blender/   un script de Python por modelo o kit (cabin.py, trees.py, truck.py, dock_boat.py, props.py, characters.py)
```

- Usa GDScript con tipos estáticos. Los datos van en recursos `.tres`, no quemados en el código.
- **Modelos de Blender:**
  - Genéralos con scripts de Python en `tools/blender/` y expórtalos a glTF (`.glb`) en `assets/models/`, en metros, con +Y arriba.
  - Usa las convenciones de importación de Godot en los nombres de objeto: sufijo `-col` o `-colonly` para colisiones y `-navmesh` donde aplique.
  - Personajes: malla *low-poly* con esqueleto simple (cadera, columna, cabeza, brazos y piernas) y animaciones básicas hechas por script (idle, caminar, correr, golpear, morir). Si eso se complica, propón usar Mixamo.
- **Sonido:** usa marcadores silenciosos con nombres claros y dime qué sonidos conseguir. Fuentes recomendadas: Freesound (revisar licencia) y jsfxr para sonidos de interfaz.

## Fases (detente al final de cada una, muéstrame la captura y espera mi visto bueno)

1. **Bloqueo:** mapa con formas simples, cámara, movimiento del jugador, colisiones, entrar y salir de la cabaña con el techo que se desvanece.
2. **Arte del mundo:** modelos de Blender (cabaña, árboles, camioneta, muelle, bote), shader de dos tonos, luz de luna y ventanas, nieve, huellas, niebla y *bloom*. La captura debe parecerse a las referencias.
3. **Supervivencia:** necesidades, inventario, leña, agua y hervir, pesca, cocina, ciclo día/noche.
4. **Zombis y oleadas:** los dos tipos, navegación, ruido, barricadas con durabilidad, hacha, escopeta y mejoras.
5. **Bote, hielo y radio:** menú de expediciones con eventos, lago que se congela, boletines.
6. **Interfaz y pulido:** todas las pantallas terminadas, menú principal, fin de demo, controles táctiles, ajuste de dificultad para que los 3 días se puedan ganar pero con tensión.

**Al terminar**, dame:
- Cómo exportar el ejecutable para Windows.
- Una lista corta de lo que falta para pasarlo al celular.
- Los sonidos y la música que debo conseguir.

Empieza por el **Paso 0**. Cuando te lo pida, te mando las imágenes de referencia.
