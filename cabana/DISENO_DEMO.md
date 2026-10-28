# Old Man Winter · Diseño de la demo v0.1

Fuente común para los dos PCs. Si algo aquí contradice a `VISION.md`, manda este documento para la demo.

- **Meta:** demo jugable en Steam en **3 a 4 meses**.
- **Equipo:** un desarrollador más un colaborador, con dos PCs (ver "Flujo de trabajo").
- **Motor y herramientas:** Godot 4 (GDScript) y Blender. Todo se modela en Blender; Mixamo sólo da el esqueleto y las animaciones base.
- **Idiomas:** inglés y español desde el primer día.

## Alcance

| Entra en la v0.1 | Queda para después |
|---|---|
| Introducción (TV, radio, helicópteros, "3 días después") | Facciones y NPC hostiles con IA |
| Los **primeros 5 días del invierno** | Primavera, verano y otoño jugables (sólo quedan sus datos preparados) |
| Cabaña, bosque y sendero, muelle y lago helado | Bote navegable y mapa del lago gigante (llega con el deshielo) |
| 2 zonas de expedición a pie por el hielo: **gasolinera** e **Isla Marbreich** (puesto de rescate abandonado) | Ciudades grandes, más pueblos |
| Compañero: **perro** | Compañero persona |
| Radio de onda corta con misiones | Supervivientes en persona |
| Brasas y tienda de muestra | Pagos reales, multijugador, Solitario |

## Ciclo de juego

- **Muerte permanente como parte de la historia (modo Historia):** si Anselmo muere, la partida se pierde y **despierta otra vez en su sillón: el invierno se repite** (ver `HISTORIA.md`). Sólo hay un guardado automático al amanecer, para poder salir del juego, y se borra al morir.
- **Lo que sobrevive entre partidas** (en el perfil del jugador, no en la partida): las Brasas, una marca tallada por cada invierno vivido, notas nuevas con la letra de Anselmo que aparecen en la cabaña y cambios en las fotos de Clara. El contenido de cada nota sale de una lista en datos, según cuántas veces se ha muerto.
- **Día:** registrar la cabaña, cortar leña, picar piedra, cazar, pescar en el hueco del hielo, construir, expediciones. Hay zombis sueltos y, rara vez, una horda de día.
- **Noche:** la oleada principal. Usar el generador atrae una horda más grande.
- **Duración:** en invierno, día de unos 3 minutos y noche de unos 4 (el invierno es la estación de noches largas). Todo se ajusta en datos.
- **Ritmo:** siempre hay algo que hacer. Eventos al azar de día, tareas del día con recompensa, recoger es automático, fabricar toma segundos.
- **Final de la demo:** al sobrevivir la quinta noche, la locutora dice "Anselmo, apaga la radio antes de dormir. Siempre se te olvida" (él nunca le ha hablado) y aparece "Fin de la demo" con estadísticas.

## Estaciones (el invierno primero)

- El juego empieza en **el invierno más crudo, largo y brutal**: es la estación más difícil y funciona como bautizo de fuego.
- **Orden:** invierno → primavera (deshielo, se abre el bote) → verano → otoño → invierno.
- **Duración:** invierno de **10 días**; las demás, de **5 días** cada una.
- Todo va en un recurso `SeasonData.tres` por estación: paleta, luces, partículas, duración del día y la noche, multiplicadores, estado del lago, botín y zombis.
- **En invierno:**
  - El lago está congelado: se cruza a pie hacia las zonas de expedición, y se pesca por un hueco en el hielo.
  - Los zombis son más lentos por el frío.
  - Nieve y huellas en todo el mapa.
- **Menú de depuración (F1, sólo en desarrollo):** forzar estación, saltar días, inmortalidad para probar.

## Supervivencia realista pero accesible

| Sistema | Regla |
|---|---|
| **Temperatura** | Indicador de abrigo. A 0 %: empeora la puntería y se duplica el consumo de resistencia. Se recupera con la estufa, refugio o bebidas calientes. |
| **Hambre y sed** | El agua del lago se hierve en la estufa. Con hambre o sed **no se regenera la resistencia**, pero no se pierde salud de golpe. |
| **Salud** | Se regenera sola tras 8 s sin daño, al 1 % por segundo, **sólo hasta el 60 %**. Para llegar al 100 %: vendas o medicina. |
| **Sangrado** | Las mordeduras causan sangrado temporal (pierde salud poco a poco) hasta que se venda o pasa el efecto. |
| **Resistencia (*stamina*)** | La gastan correr, atacar, empujar y bloquear. |

Todos los valores van en recursos de datos para ajustarlos al probar.

## La cabaña (centro del juego)

- **Al empezar, la cabaña está casi vacía de equipo.** Hay que registrar con `E` gavetas de la cocina, armarios, el taller y el cobertizo para encontrar lo básico.
- **Estaciones de trabajo dentro de la casa:**

  | Estación | Para qué |
  |---|---|
  | Estufa de leña con tetera | Calor, hervir agua, cocinar, bebidas calientes |
  | Banco de trabajo | Fabricar y mejorar armas, vendas, trampas |
  | Cama | Dormir y guardar (no con zombis cerca) |
  | Radio de onda corta | Boletines y misiones |
  | Despensa | Almacén |
  | **Panel de herramientas** | Pared con siluetas pintadas que se va llenando a medida que Anselmo encuentra herramientas (martillo, sierra, llave...). Cada herramienta desbloquea recetas. |
  | Mesa con mapa | Diario de misiones y zonas de expedición |
  | Sillón y TV vieja | Introducción |

- **Construcción libre con cuadrícula (*snap grid*):** barricadas en puertas y ventanas, muros de madera, trampas simples, estantes.
- **Electricidad o método rústico:**
  - **A oscuras o con fuego:** seguro.
  - **Generador de gasolina:** ilumina la casa, carga la radio y deja usar más estaciones, pero **su ruido atrae hordas nocturnas más grandes**. El jugador decide.
- **Regla de la estufa:** mientras la estufa arde, los zombis no cruzan la puerta de la cabaña (golpean barricadas y ventanas, pero no entran). Si se apaga de noche, entran. Es una regla de la historia y el centro de la tensión nocturna: la leña es vida. Hay que probar el balance en el prototipo.
- **La casa "se abre" (vista de maqueta):** al entrar desaparece el techo y bajan las paredes que dan a la cámara. Es igual en los edificios de las zonas de expedición.

## Compañero: Nevado, el perro

- **Comportamiento:**
  - Sigue a Anselmo.
  - Ladra cuando se acercan zombis, también fuera de la pantalla, con un ícono de dirección.
  - Muerde para distraer a un zombi unos segundos.
  - Se le puede ordenar "quieto" o "ven".
- **En la v0.1 no muere:** si lo hieren, se retira cojeando a la cabaña y vuelve al día siguiente. Esto mantiene el alcance chico y evita castigos injustos.

## Combate cuerpo a cuerpo

| Categoría | Ejemplos | Uso |
|---|---|---|
| **Corta o improvisada** | Cuchillo, machete, tubo | Ataques rápidos, poca resistencia |
| **Pesada o contundente** | Hacha de talar, bate con clavos, pico | Mucho daño, derriba o desmiembra, pero tarda más en recuperarse |

- **Acciones:** ataque ligero, ataque pesado, **empujón o patada** (control de multitudes, gasta resistencia) y **bloqueo** (absorbe un golpe con buen tiempo).
- **Armas de fuego:** sólo la **escopeta** de la introducción, con muy pocos cartuchos y mucho ruido. Es el último recurso.
- **Sensación de golpe:** pausa de impacto de 50 ms al conectar, sacudida de cámara en golpes pesados, partículas de sangre o nieve, sonido seco.
- Las armas se desgastan y se reparan en el banco de trabajo.

## Radio de onda corta y misiones

- En la cabaña (y con un **walkie-talkie** que se encuentra después, también fuera de ella) se sintoniza a una **locutora misteriosa** que transmite desde un lugar desconocido, al que no se puede ir.
- Sus boletines cuentan lo que pasa y reportan emergencias, por ejemplo "Suministros médicos abandonados en Isla Marbreich". Cada uno **marca automáticamente una ubicación en el Diario de Misiones**.
- La radio **sólo capta a la locutora cerca del agua o del hielo**; lejos del lago, sólo estática (regla de la historia).
- Ver `HISTORIA.md` para el contenido.

## Zonas (escenas independientes)

| Zona | Qué hay |
|---|---|
| **Cabaña** (centro) | Base, estaciones, construcción |
| **Bosque y sendero** | Caza, tala, piedra, recolección; por aquí llegan los zombis |
| **Muelle y lago helado** | Pesca por el hueco del hielo; salida a pie hacia las expediciones |
| **Gasolinera** (expedición) | Combustible para el generador, comida, piezas |
| **Isla Marbreich** (expedición, por misión de radio) | Puesto de rescate abandonado, con camillas y café servido: vendas, medicina y el cartel de "SE BUSCA" con la foto arrancada |

- En las expediciones hay **libros y manuales** que suben las ramas de habilidad (Medicina, Caza, Construcción, Armería) y **notas** que insinúan el misterio del lago (ver `HISTORIA.md`). Nunca se habla de virus: no hay apocalipsis, es el lago.
- Ir y volver de una expedición toma tiempo del día; hay que volver antes de la noche.

## Cinemáticas

- **Todas se hacen dentro de Godot, con los mismos modelos del juego** (no videos pregrabados ni generados con IA): mismo estilo, archivos livianos, subtítulos traducibles y se pueden saltar.
- **Herramientas:** un `AnimationPlayer` por escena que mueve la cámara, las luces, los personajes, el sonido y los subtítulos en una línea de tiempo; las actuaciones especiales (sentarse, levantarse, asomarse, llorar) se animan en Blender sobre la base de Mixamo.
- **La emoción se cuenta con cámara, luz y sonido**, no con caras detalladas: planos cercanos, silencios, la luz de la estufa, la estática.
- **En la demo:** la introducción y el cierre de la quinta noche. **En el juego completo:** la noche más larga, los finales "El regreso" y "Otro invierno", y escenas cortas por acto.
- La historia se cuenta sobre todo jugando (radio, notas, sucesos), así que las cinemáticas son pocas y cortas.

## Lo paranormal (en la demo)

- **Sucesos al azar** (más de noche y con cada invierno repetido), definidos en datos: la silla de Rosa movida, el tocadiscos que suena solo, texto en el vidrio empañado, huellas descalzas del lago a la puerta, una figura sobre el hielo, la cabaña en ruinas en la TV, el perro ladrándole a un rincón vacío.
- **Beber agua sin hervir:** además del riesgo de enfermarse, provoca **visiones** de unos segundos (los zombis se ven como personas, la cabaña aparece abandonada, se oye la voz de Rosa).
- **El reloj de la cabaña** se para a las 3:12.
- Ver la lista completa y las reglas en `HISTORIA.md`.

## Economía

- Las **Brasas** se ganan al sobrevivir noches, completar tareas y misiones, y matar zombis.
- En el menú principal hay una **Tienda** con artículos de muestra marcados "Próximamente". No hay compras con dinero real en la demo.

## Interfaz

- **HUD:**
  - Barras de salud, resistencia, temperatura, hambre y sed, con ícono de sangrado.
  - Barra rápida de armas y objetos.
  - Reloj con día, noche e ícono de la estación.
  - Indicador del perro.
- **Pantallas:**
  - Inventario, fabricación, cocina, panel de herramientas.
  - Diario de misiones y mapa de expediciones.
  - Radio con texto.
  - Pausa y opciones (idioma, volumen, calidad).
  - Menú principal con Historia (activo), Solitario y Multijugador ("Próximamente"), y Tienda.
  - Muerte (con estadísticas de la partida) y fin de demo.
- Todo con textos traducibles (`tr()`), escalable y con controles pensados para mando y, más adelante, pantalla táctil.

## Rendimiento (lo manda el PC 1)

- El juego debe correr a **60 fps en el PC 1** (Vega 8, 8 GB de RAM) con el renderizador **Mobile**.
- **Presupuestos de arte:**

  | Elemento | Límite |
  |---|---|
  | Anselmo | hasta 4.000 triángulos |
  | Zombi | hasta 2.500 triángulos |
  | Perro | hasta 2.000 triángulos |
  | Objeto pequeño | 50 a 600 triángulos |
  | Cabaña completa con interior | hasta 15.000 triángulos |
  | Escena visible | hasta 150.000 triángulos y unas 300 llamadas de dibujo |

- **Texturas:** casi todo usa **una sola textura de paleta (atlas)** de 256 × 256 con los colores del juego; los modelos asignan color por UV. Texturas aparte sólo si es imprescindible, de 512 px como máximo.
- Geometría **modular** (kits tipo Lego) para paredes, techos, cercas y edificios.

## Flujo de trabajo con dos PCs

> **Por ahora se trabaja con un solo PC (el PC 1) para todo.** Esa sesión de Claude Code hace también el trabajo de arte siguiendo `PROMPT_PC2_BLENDER.md`, por tandas: primero los modelos que pide una fase, luego su integración en Godot, sin abrir Blender y Godot a la vez. Las carpetas, las ramas (`arte/...` y `codigo/...`) y `docs/ASSETS.md` se usan igual desde ya, para que cuando se sume el compañero sólo haya que pasarle el prompt del PC 2 y las tareas pendientes de la lista.

| | PC 1 · Programación | PC 2 · Arte |
|---|---|---|
| Equipo | Vega 8, 8 GB | PC potente |
| Herramientas | Godot 4 | Blender (con Claude Code) |
| Trabaja en | `scenes/`, `scripts/`, `autoload/`, `data/`, `shaders/`, `ui/`, `localization/` | `tools/blender/`, `assets/models/`, `assets/textures/`, `assets/animations/` |
| Ramas de git | `codigo/<tema>` | `arte/<tema>` |

- **Cada PC sólo toca sus carpetas.** Los cambios llegan a `main` por pull request.
- **Lista de modelos compartida:** `docs/ASSETS.md`.
  - El PC 1 pide cada modelo con nombre, medidas, presupuesto y si necesita colisión o animación.
  - El PC 2 lo marca como "en proceso" y luego "entregado", con la ruta del `.glb`.
- Mientras un modelo no llega, el PC 1 usa **cajas provisionales con el mismo nombre y tamaño**, para poder reemplazarlas sin tocar el código.
- Formato de intercambio: **`.glb`** en metros, +Y arriba, con las convenciones de nombres de Godot (`-col`, `-colonly`, `-navmesh`).

## Calendario orientativo (3 a 4 meses)

| Mes | PC 1 · Programación | PC 2 · Arte |
|---|---|---|
| 1 | Proyecto, cámara, movimiento, cabaña provisional, casa que se abre, combate básico | Paleta atlas, kit modular de la cabaña, Anselmo y zombi en pose T, primeras animaciones |
| 2 | Supervivencia, registrar la cabaña, construcción en cuadrícula, zombis, oleadas, perro | Interior completo, bosque, lago helado, armas, perro, resto de animaciones |
| 3 | Radio, misiones, expediciones, generador, panel de herramientas, introducción | Gasolinera, Isla Marbreich, objetos de búsqueda, íconos renderizados |
| 4 | Interfaz completa, idiomas, balance, rendimiento, demo para Steam | Pulido visual, material para la página de Steam (capturas y tráiler) |
