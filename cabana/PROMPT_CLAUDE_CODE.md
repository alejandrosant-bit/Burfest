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
- La demo son **los últimos 3 días del otoño y la primera noche de invierno**. En el día 3 cae la primera nevada y el lago empieza a congelarse; la demo termina al sobrevivir la primera noche nevada, con la pantalla de "Fin de la demo" y estadísticas.

**Las cuatro estaciones, por días de juego:**
- Cada estación dura **5 días de juego**, en orden: otoño → invierno → primavera → verano → otoño... Con días de unos 7 minutos (día más noche), una estación son unos 35 minutos y un año unas 2 h 20 min de juego.
- Se calcula con el día de juego: `estacion = floor(dia / 5) % 4`. Se guarda con la partida; no depende del reloj del sistema.
- La partida empieza a **finales de otoño** (en el día 2 contando desde 0, así quedan 3 días de otoño antes del invierno), para que el primer objetivo sea prepararse para el invierno. La dificultad de las oleadas sube con cada estación y con cada año.
- El cambio de estación ocurre al amanecer del día que corresponde, con una transición suave de unos 60 s (cambian la luz, la vegetación, el suelo y las partículas) y un aviso: "Llega el invierno".
- Configura todo en un recurso `SeasonData.tres` por estación, nunca quemado en el código: paleta, luces, partículas, duración del día y de la noche, multiplicadores de necesidades, estado del lago, botín, tipos y cantidad de zombis.
- **Menú de depuración (F1, sólo en modo desarrollo):** forzar estación, saltar días y ver la transición, para probar sin jugar horas.

| | Invierno | Primavera | Verano | Otoño |
|---|---|---|---|---|
| **Mundo** | Nieve, árboles desnudos, nieve cayendo | Nieve derritiéndose y charcos, brotes verdes, lluvia | Pasto verde, árboles frondosos, luciérnagas de noche | Hojas naranjas y rojas cayendo, niebla espesa |
| **Lago** | Congelado: el bote no sale, pero se puede cruzar el hielo a pie a un destino de la otra orilla (más peligroso). Pesca por un hueco en el hielo. | Deshielo: el bote vuelve a salir, con hielo flotando | Navegable, pesca buena | Navegable, más niebla en las expediciones |
| **Necesidades** | El calor baja rápido; la estufa es vital | La lluvia moja y baja el calor; barro | La sed sube el doble; el calor casi no importa | El calor baja de noche |
| **Día / noche** | Día corto, noche larga | Equilibrado | Día largo, noche corta | Noches cada vez más largas |
| **Huellas** | En la nieve | En el barro | Ninguna | Sobre la hojarasca |
| **Zombis** | Más lentos por el frío; algunos llegan por el hielo | Normales | Más rápidos y más numerosos | Aparecen de entre la niebla |
| **Recursos** | Leña indispensable | Hongos y plantas silvestres | Bayas, más peces | Prepararse: secar carne y pescado, juntar leña para el invierno |

**Sistemas de la demo:**
- **Necesidades:** salud, hambre, sed, calor y energía (barras en la interfaz). El frío baja la salud si el calor llega a 0. La chimenea calienta dentro de la cabaña.
- **Salud y curación:** tras 8 s sin recibir daño, la vida se regenera sola al 1 % por segundo, pero **sólo hasta el 60 %**. Si recibe daño, la regeneración se corta y el contador se reinicia. Para pasar del 60 % hacen falta **vendajes**: se fabrican en el banco de trabajo con tela y salen en las expediciones del bote. Deja estos valores en un recurso de datos para poder ajustarlos.
- **Agua:** sacar agua del lago da "agua sucia". Hervirla en la chimenea da "agua potable". Beber agua sucia tiene riesgo de enfermarse.
- **Comida:** pescar en el muelle (minijuego simple de un botón con tiempo), latas conseguidas en el bote, cocinar en la chimenea.
- **Leña:** cortar árboles marcados con el hacha. Hace ruido.
- **Ruido:** cortar, martillar y disparar generan ruido; los zombis cercanos van hacia la fuente. Muestra el ruido como un círculo tenue en el suelo.
- **Construcción y refuerzo:** tablas en puertas y ventanas (con durabilidad, los zombis las golpean hasta romperlas), trampas sencillas de estacas, reparar con tablas y clavos.
- **Armas:** hacha (cuerpo a cuerpo), escopeta (pocas balas, mucho ruido). Mejoras en un banco de trabajo con chatarra: más daño, más durabilidad.
- **Inventario** en cuadrícula con barra rápida de 5 espacios. **Fabricación** en el banco de trabajo y **cocina** en la chimenea.
- **Bote:** en el muelle se abre un menú de expedición con 3 destinos (gasolinera, cabaña vecina, campamento abandonado). Cada uno tiene riesgo, duración en horas del día y botín aleatorio, más un evento de texto con decisión (por ejemplo: "Oyes algo en el baño. ¿Abres la puerta?"). En la demo no hay niveles fuera del mapa; todo se resuelve en el menú.
- **El lago según la estación:** ver la tabla de estaciones. Al pasar a invierno, el hielo avanza desde las orillas en la transición.
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
- Camioneta vieja roja abandonada (con nieve encima en invierno; de ahí sale chatarra), un columpio de llanta colgado de un árbol, leñera, letrina.
- Detrás de la cabaña: lago con muelle de madera y un bote de remos.
- Sendero de entrada desde el bosque por donde llegan los zombis desde la ciudad (al fondo, un resplandor naranja de incendio en el horizonte).

## Dirección de arte (sigue las imágenes de referencia que te daré)

- **Low-poly de sombreado plano**, pocos polígonos y siluetas claras. Árboles desnudos de ramas angulosas y pinos de capas.
- **Iluminación en dos tonos (*toon*)** con shader propio: luz y sombra en dos bandas nítidas, sombras largas de luna, color de sombra azul marino (no negro).
- **Paleta de invierno de noche (la de las referencias).** Cada estación tiene su propia paleta en el mismo estilo plano: primavera de verdes suaves y grises de lluvia, verano de verdes intensos con noches azul violeta, otoño de naranjas y ocres con niebla. La luz cálida de la cabaña y el rojo de la bufanda se mantienen en todas.

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
  - Partículas con GPUParticles3D según la estación: nieve, lluvia, luciérnagas u hojas.
  - Huellas detrás del jugador y los zombis según la estación (decals o malla en el suelo, que se desvanecen con el tiempo).
  - El suelo y los árboles cambian por estación con variantes de material o modelos alternos exportados desde Blender (por ejemplo `tree_bare.glb` y `tree_leaves.glb`).
- **Día:** la misma dirección de arte con cielo gris azulado claro, nieve blanca y sombras celestes. Haz la transición día/noche animando la luz y el entorno.
- **Cámara:** perspectiva alta en tres cuartos, unos 55° hacia abajo, FOV bajo (unos 35°). Sigue al jugador con suavidad, sin rotación libre en la demo, con zoom limitado con la rueda del ratón.
- **Personaje:** Anselmo, figura robusta de abrigo oscuro, gorro y bufanda roja. Zombis con ropa de ciudad desteñida y piel gris verdosa, en el mismo estilo.

## Animación (que se sienta fluida)

- **Origen de las animaciones:** usa **Mixamo** (gratis, en la opción "In Place") como base para caminar, correr, idle, golpear con el hacha, disparar, recargar, morir y las caminatas y ataques de zombi. No inventes animaciones de personaje con keyframes por script: quedan rígidas. Si falta alguna, avísame y la hacemos en Cascadeur o en Blender a mano.
- **Un solo esqueleto humanoide** para Anselmo y los zombis. Usa el reasignado (*retargeting*) de Godot (BoneMap con SkeletonProfileHumanoid) para compartir animaciones.
- **AnimationTree, no AnimationPlayer suelto:**
  - **Locomoción** con BlendSpace2D según la velocidad y la dirección relativa a donde mira (idle, caminar, correr y caminar de lado al apuntar).
  - **Máquina de estados** con fundidos cortos de 0,1 a 0,2 s entre estados.
  - **Capas de cuerpo:** las piernas siguen caminando mientras el torso hace otra acción (golpear, apuntar, recargar, beber, martillar). Usa un Blend2 con filtro de huesos de cintura para arriba.
- **Movimiento suave:**
  - Aceleración y frenado con curvas, no velocidad instantánea.
  - Giro del personaje con interpolación (slerp).
  - Leve inclinación al girar corriendo.
  - Activa la **interpolación de física** del proyecto para que no haya tirones en monitores de más de 60 Hz. La cámara se suaviza en `_process`.
- **Detalles procedurales:**
  - La cabeza mira hacia el objetivo o el zombi más cercano.
  - Pies con IK sobre la nieve y los escalones del porche si da tiempo.
  - La **bufanda roja** con huesos de resorte para que se mueva al correr y con el viento (SpringBoneSimulator3D si la versión de Godot lo tiene; si no, un script simple de resorte).
  - Zombis que caen como muñeco de trapo (*ragdoll*) al morir, con PhysicalBoneSimulator3D.
- **Sensación de golpe (*game feel*):** congelar la imagen 40 a 60 ms al conectar un hachazo, sacudida corta de cámara, destello en el zombi golpeado, retroceso del arma y partículas de nieve o astillas. Esto hace que el combate se sienta fluido aunque las animaciones sean simples.
- **Rendimiento con muchos zombis:** los zombis lejanos o fuera de pantalla actualizan la animación con menos frecuencia (VisibleOnScreenNotifier3D). Meta: 60 fps estables con 30 zombis en pantalla.

## Interfaz (terminada en la demo)

- Estilo limpio, plano y legible, con la paleta del juego; fuente libre con licencia OFL de Google Fonts.
- **HUD:**
  - Las cinco barras de necesidades, abajo a la izquierda.
  - Barra rápida, abajo al centro.
  - Reloj del día y número de noche, arriba al centro, con un ícono de la estación y cuántos días faltan para la siguiente ("Invierno en 2 días").
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
5. **Estaciones, bote y radio:** las cuatro estaciones por días de juego con sus `SeasonData`, transición entre ellas, menú de depuración, expediciones en bote (y a pie por el hielo en invierno) y boletines. Muéstrame una captura del mismo encuadre en cada estación.
6. **Interfaz y pulido:** todas las pantallas terminadas, menú principal, fin de demo, controles táctiles, ajuste de dificultad para que los 3 días se puedan ganar pero con tensión.

**Al terminar**, dame:
- Cómo exportar el ejecutable para Windows.
- Una lista corta de lo que falta para pasarlo al celular.
- Los sonidos y la música que debo conseguir.

Empieza por el **Paso 0**. Cuando te lo pida, te mando las imágenes de referencia.
