# Prompt para Claude Code · PC 2 (arte en Blender)

Copia todo lo que está debajo de la línea y pégalo en Claude Code, abierto en la carpeta del repositorio `old-man-winter` en el PC 2.

---

Vas a hacer conmigo **todo el arte 3D de la demo v0.1 de *Old Man Winter*** en **Blender**: modelos, kits modulares y animaciones, exportados a `.glb` para Godot 4. Trabajas en mi PC y puedes ejecutar Blender por línea de comandos (`blender --background --python ...`). Otro PC (el PC 1, con una gráfica integrada Vega 8 y 8 GB de RAM) programa el juego en Godot e integra lo que entregues.

**Antes de nada, lee:** `docs/DISENO_DEMO.md` (alcance, presupuestos de rendimiento y flujo entre PCs), `docs/ASSETS.md` (lista de modelos pedidos) y `docs/HISTORIA.md` (para los detalles de la cabaña y las zonas).

## Reglas de trabajo

**Ahorro de tokens:**
- Respuestas cortas, sin pegar scripts completos ni repetir código.
- No releas lo que acabas de escribir.
- Agrupa cambios relacionados.

**Confirmar antes de actuar:**
- Antes de cada tanda de modelos, muéstrame un plan corto y espera mi "dale".
- Pídeme permiso antes de instalar complementos, borrar archivos o descargar recursos.

**Verificación de cada modelo:**
1. El script corre sin errores en `--background` y el `.glb` existe.
2. **Reporte de cada modelo:** triángulos, materiales, medidas en metros y si cumple el presupuesto de `docs/DISENO_DEMO.md`. Si no lo cumple, no lo entregues.
3. **Render de vista previa** en PNG con la cámara del juego (perspectiva alta en tres cuartos, unos 55°, FOV de unos 35°) y la iluminación de dos tonos de la referencia, en `previews/<nombre>.png`. Míralo tú mismo, compáralo con las imágenes de referencia y muéstramelo.

## Git y coordinación con el PC 1

- Trabaja en ramas `arte/<tema>`; une a `main` por pull request cuando yo apruebe. Git LFS para `*.blend`, `*.glb`, `*.fbx`, `*.png`.
- **Tus carpetas:** `tools/blender/`, `assets/models/`, `assets/textures/`, `assets/animations/`, `previews/`. **No toques** el código de Godot.
- **`docs/ASSETS.md` es la lista de pedidos.** Toma los modelos en estado `pedido`, márcalos `en proceso` y al terminar `entregado`, con la ruta del `.glb`. Si un pedido es ambiguo, pregúntame en vez de inventar.
- Haz `git pull` de `main` antes de cada tanda para ver pedidos nuevos.

## Dirección de arte (te mandaré las imágenes de referencia)

- ***Low-poly* de sombreado plano**, siluetas claras y pocos polígonos. Árboles desnudos de ramas angulosas, pinos de capas, nieve acumulada en techos, autos y ramas.
- **Paleta de invierno de noche:**

  | Elemento | Color |
  |---|---|
  | Cielo / niebla | `#1E2A4A` |
  | Nieve iluminada | `#C9D6F0` |
  | Nieve en sombra | `#5B6C9E` |
  | Sombras profundas | `#2B3666` |
  | Madera | `#5A4636` |
  | Luz cálida de ventanas y estufa | `#FFB347` |
  | Acento (bufanda de Anselmo, camioneta) | `#D6452F` |

- **Textura de paleta (atlas):** crea una sola textura de 256 × 256 (`assets/textures/palette_atlas.png`) con bloques de color de la paleta y sus variantes (madera clara y oscura, metal, ropa, piel, hojas para otras estaciones). **Todos los modelos usan ese único material** y asignan color moviendo las UV a su bloque. Texturas aparte sólo si son imprescindibles, de 512 px como máximo.
- **Kits modulares tipo Lego**, con medidas en cuadrícula de 1 m:
  - Paredes de troncos (lisa, con ventana, con puerta, esquina, zócalo bajo para la casa que se abre).
  - Techo, piso de tablas, porche, cerca.
  - Paredes y fachadas para la gasolinera.
  - Cada pieza es un objeto separado, con el origen en su base, para armar escenarios en Godot.
- **Techo y paredes separables en la cabaña y los edificios:** el techo y cada pared van como objetos aparte (por ejemplo `cabin_roof`, `cabin_wall_front`, `cabin_wall_front_low`), porque Godot los oculta o cambia al entrar ("la casa se abre").

## Lista de la demo (completa la que pida `docs/ASSETS.md`)

- **Cabaña:**
  - Kit modular.
  - Interior: estufa de leña con tetera, banco de trabajo, cama, radio de onda corta, despensa, **panel de herramientas con siluetas pintadas** (y cada herramienta como objeto aparte para colgarla), mesa con mapa, sillón, TV vieja, gavetas y armarios con puertas que se abren, fotos enmarcadas, carta de despido enmarcada.
  - Generador de gasolina.
- **Exterior:** pinos y árboles desnudos (con variantes con hojas para otras estaciones), rocas para picar, leñera, camioneta roja con nieve, columpio de llanta, postes de luz con cables, muelle de madera, bote varado, hueco de pesca en el hielo, cercas.
- **Expediciones:** gasolinera (kit y utilería: surtidores, góndolas, caja registradora, auto abandonado); puesto de rescate de Isla Marbreich (camillas, cajas de suministros, tablero con cartel de "SE BUSCA", carpa).
- **Armas:** cuchillo, machete, tubo, hacha de talar, bate con clavos, pico, escopeta, revólver, rifle de caza, arco, flechas, cartuchos y balas (como objetos), casquillos.
- **Diario de Anselmo:** libreta de cuero gastada, abierta y cerrada, con hojas sueltas y recortes asomando.
- **Objetos:** comida, agua, vendas, libros, manuales, notas, walkie-talkie, herramientas, materiales.
- **Personajes en 3D con calidad de cinemática:** se ven desde arriba al jugar, pero en las cinemáticas hay planos cercanos, así que los personajes principales llevan:
  - **Cara expresiva:** ojos y párpados (parpadeo), cejas, boca con formas para hablar (*shape keys*: A, E, O, M/B, F) y expresiones (enojo, tristeza, miedo, llanto, sonrisa).
  - **Manos con dedos** y un poco más de detalle en ropa y pelo, siempre en estilo *low-poly*.
  - **Dentro del presupuesto** de `docs/DISENO_DEMO.md`; Godot genera automáticamente versiones más simples (LOD) para la vista de juego.
  - Mixamo no anima la cara: después de traer el esqueleto, agrega en Blender los huesos de ojos y mandíbula y las *shape keys* de la cara, y anima las expresiones de las cinemáticas a mano.
- **Personajes (pose T, *low-poly*):**
  - **Anselmo:** viejo robusto, abrigo oscuro, gorro y bufanda roja.
  - **Zombi caminante ("los Ahogados")**: piel pálida azulada y amoratada, ropa de distintas épocas (de 1962, de pescador, de rescatista, de soldado) siempre mojada y con escarcha, con 2 o 3 variantes. Nada de ropa de ciudad moderna: no vienen de ninguna ciudad.
  - **Zombi corredor** (más delgado, encorvado hacia adelante), **zombi hinchado** (enorme, inflado por el agua) y **zombi del hielo** (escarcha y carámbanos), con el mismo esqueleto humanoide.
  - **Rosa** (mujer de unos 40 años, abrigo y bufanda roja) y **Clara niña** (10 años, gorro de lana con nieve), con cara expresiva, para el final y las apariciones; Rosa también en versión semitransparente o en silueta.
  - **Aparición de Rosa:** figura de mujer con abrigo y bufanda roja, semitransparente o en silueta, para los sucesos paranormales.
  - **Nevado, el perro:** mestizo mediano, blanco y lanudo (más una versión cachorro para el final).
  - Para el perro, el esqueleto se hace con Rigify (cuadrúpedo), no con Mixamo.

## Animación

- **Humanos (Anselmo y zombis):**
  1. Exporta la malla en pose T a FBX.
  2. **Yo** la subo a Mixamo para el esqueleto automático y descargo las animaciones base (FBX, 30 fps, "In Place"); dime exactamente cuáles y con qué nombre de archivo.
  3. Tú las importas y les aplicas la **capa de personalidad** por script:
     - **Anselmo:** encorvado, pasos pesados, leve cojera, gesto de fastidio.
     - **Zombis:** arrastran un pie, se tambalean, espasmos.
  4. Muéstrame cada animación junto a la original de Mixamo antes de entregarla.
- **Nombres** (un `.glb` por personaje, con todas sus acciones):
  - **Anselmo:**
    - Locomoción: `Idle`, `Walk`, `Run`.
    - Combate cuerpo a cuerpo: `Atk_Light`, `Atk_Heavy`, `Push`, `Block_Hit`.
    - Disparo: `Aim_Pistol`, `Fire_Pistol`, `Reload_Pistol`, `Aim_Rifle`, `Fire_Rifle`, `Reload_Rifle`, `Fire_Shotgun`, `Reload_Shotgun`, `Draw_Bow`, `Fire_Bow`, y caminar apuntando (`Walk_Aim`).
    - Recibir daño: `Hit_React`, `Death`.
    - Tareas: `Search` (registrar), `Chop`, `Hammer`, `Drink`, `Eat`.
    - Introducción: `Sit_Idle`, `Stand_Up`, `Peek_Window`, `Shout`.
  - **Zombi:** `Idle`, `Walk`, `Attack_1`, `Attack_2`, `Hit_Barricade`, `Hit_React`, `Stagger` (por empujón), `Death`.
  - **Perro:** `Idle`, `Walk`, `Run`, `Bark`, `Bite`, `Limp`, `Sit`.
- En ciclo las que lo requieran, sin desplazamiento de la raíz, 30 fps. La bufanda de Anselmo con 2 o 3 huesos propios para que Godot la mueva con resortes.

## Exportación

- `.glb` en `assets/models/<categoría>/<nombre>.glb`, en metros, +Y arriba, transformaciones aplicadas, origen en la base del objeto.
- Convenciones de Godot en los nombres: sufijo `-col` (colisión con malla visible), `-colonly` (sólo colisión simplificada), `-navmesh`. Colisiones siempre simplificadas (cajas o cilindros).
- **Íconos de objetos:** renderiza cada objeto del inventario con la misma luz y ángulo, en PNG de 128 px con fondo transparente, en `assets/textures/icons/`.

Empieza por: la textura de paleta, el kit modular de la cabaña y un render de la cabaña armada de noche con la casa abierta y cerrada, para aprobar el estilo antes de seguir.
