# Old Man Winter · Visión del juego completo

Juego en **inglés y español** desde el primer día.

Documento de referencia para el juego completo. Lo que entra en la **demo v0.1** está en `DISENO_DEMO.md`, que manda si algo no coincide.

**Decisiones generales:** el juego empieza en **invierno** (la estación más larga y difícil, 10 días; las demás duran 5); el modo Historia tiene **muerte permanente**; el compañero de Anselmo es un **perro**.

## Menú principal

| Modo | Qué es |
|---|---|
| **Historia** | Anselmo solo: la radio, las estaciones, los capítulos y el bote para buscar recursos. Es lo primero que se construye. |
| **Solitario** | Supervivencia por oleadas sin historia. Sólo Anselmo, sin bots. Las oleadas están **ajustadas a lo que puede responder una sola persona**: menos zombis por oleada, ataques por un solo frente a la vez al principio y más tiempo entre oleadas para reparar. Anselmo desarrolla **todas las habilidades a la vez** (ver "Habilidades"). |
| **Multijugador** | Modo horda cooperativo de 4 jugadores. Partida privada con amigos o partida pública. |

## Multijugador: modo horda cooperativo

- No es contra otros jugadores: los 4 jugadores cooperan contra oleadas de zombis.
- La partida empieza en una cabaña **sin recursos**. Entre todos la reconstruyen, la refuerzan y ven cuántas oleadas sobreviven.
- **No hay bote** en este modo. Los recursos salen del mapa (bosque, lago) y de un **helicóptero que deja caer cajas de suministro entre oleadas**, lejos de la cabaña. Hay que salir de la base a buscarlas con riesgo, y el ruido de la caída atrae zombis.
- **Partida privada:** con amigos, mediante un código de invitación.
- **Partida pública:** busca jugadores y completa con **bots de IA** los lugares que falten (al principio habrá poca gente). La IA de los bots se diseña más adelante.

### Roles

Todos los roles pelean igual (mismas armas básicas y misma resistencia). Cada uno tiene **habilidades extra**:

| Rol | Habilidades extra |
|---|---|
| **Médico** | Va a curar a los compañeros caídos en el campo mientras los demás lo cubren. Cura más rápido y rinde más los vendajes. |
| **Cazador** | Experto con arco y flechas y con el rifle de francotirador. Más daño y precisión a distancia. |
| **Constructor** | Construye muros de madera, torres de vigilancia y **trampas** (estacas, alambre, fosos), y repara las estructuras más rápido. |
| **Armero** | **Mejora las armas** (daño, cargador, durabilidad) y **fabrica munición** (balas, cartuchos y flechas para el cazador). |

### Habilidades: Solitario frente a Multijugador

Las mismas cuatro ramas de habilidad existen en los dos modos (Medicina, Caza, Construcción y Armería), con barras de experiencia que suben al hacer cada acción: curar, disparar a distancia, construir o reparar, etc.

| | Solitario | Multijugador |
|---|---|---|
| Ramas | Anselmo sube **todas** a la vez, según lo que haga | Cada jugador elige **una** al empezar la partida |
| Progreso | Barras de experiencia por rama; cada nivel desbloquea mejoras (curar más rápido, más daño con arco, muros más resistentes...) | El rol elegido arranca con sus habilidades extra y sube de nivel en la partida |
| Equilibrio | Al cubrir todo solo, cada rama sube más lento que en multijugador | Los roles se complementan; nadie lo hace todo |

### Si un jugador se desconecta

Regla de diseño: **los roles dan ventaja, no exclusividad.** Nadie debe quedar bloqueado porque falte un rol.

1. **Todos pueden hacer lo básico de cada rol; el rol lo hace mejor:**

   | Acción | Cualquier jugador | El especialista |
   |---|---|---|
   | Curar | Vendaje simple, lento, cura poco | Rápido, cura más, puede curar en el campo y fabrica vendajes |
   | Construir y reparar | Reparar despacio, poner barricadas simples | Muros, torres y trampas; repara rápido |
   | Munición | Fabricar munición básica y flechas simples en el banco, despacio y con más material | Más rápido, más barato, munición mejorada y mejoras de armas |
   | Disparar a distancia | Arco y rifle con precisión normal | Más daño y precisión, francotirador |

2. **Un bot toma su lugar al instante**, con el mismo rol, nivel e inventario. Si el jugador vuelve dentro de un tiempo (propuesta: 5 minutos), recupera su personaje. Si no vuelve, el bot sigue hasta el final y puede entrar otra persona a reemplazarlo.
3. **Nada se pierde:** las armas mejoradas por el armero, las estructuras del constructor y los vendajes ya fabricados siguen existiendo. Si el personaje sale de la partida sin bot, su inventario queda en un cofre de la cabaña.
4. **Las oleadas se recalculan** con la cantidad de jugadores activos (personas más bots) para que la partida siga siendo justa.
5. **Cambiar de rol entre oleadas:** en una mesa de la cabaña, un jugador puede pasarse al rol que quedó libre, empezando en nivel bajo.

### Salud y curación

Estas reglas valen en **todos los modos** (Historia, Solitario y Multijugador). En Historia y Solitario, Anselmo fabrica sus propios vendajes con su rama de Medicina y también los encuentra en expediciones o cajas.

- **Regeneración natural:** cuando un jugador deja de recibir daño durante unos segundos (propuesta: 8 s), recupera vida poco a poco (propuesta: 1 % por segundo). Si lo vuelven a golpear, la regeneración se corta y el contador vuelve a empezar.
- **Vendajes:** curan mucho más y de inmediato. Se consiguen de dos formas:
  - Los **fabrica y entrega el médico** (los suyos curan más).
  - Salen en las **cajas de suministro del helicóptero**.
- **Límite de la regeneración (decidido):** la regeneración natural sólo llega hasta el **60 %** de la vida. Para llenarla del todo hacen falta vendajes.

### Estructuras

- **Muros de madera** alrededor de la cabaña, construidos por el constructor. Los zombis los golpean hasta romperlos.
- **Torres de vigilancia**: cualquier jugador puede subir a disparar desde arriba. Si los zombis las dañan, el constructor las repara.
- Barricadas en puertas y ventanas de la cabaña, como en el modo Historia.

### Ideas pendientes de decidir

- **Revivir:** al caer, el jugador queda en el suelo unos segundos y cualquiera lo puede levantar; el médico lo hace más rápido y con más vida.
- **Tabla de clasificación** de oleadas sobrevividas y un **reto semanal** con la misma cabaña y las mismas condiciones para todos.
- **Oleadas especiales** cada cierto número: zombi gigante, noche de niebla, llegada del invierno.
- **Estaciones en Multijugador:** en Historia y Solitario el invierno dura 10 días y las demás estaciones 5 (decidido). En Multijugador podrían seguir ese mismo ritmo o ser un calendario compartido por el servidor.

## Historia

Ver `HISTORIA.md` (historia completa de misterio paranormal, estilo *From* y *Dark*: no hay apocalipsis, es una maldición del lago) y `BIBLIA_SECRETA.md` (la verdad, sólo para el equipo). Los lugares del lago gigante (pueblos, la represa, el pueblo hundido) son ecos vacíos del bolsillo del lago.

## Exploración en bote (fase posterior a la demo)

En la demo, el bote es sólo un menú de expediciones. En el juego completo se vuelve un **mapa explorable**:

1. **El lago es gigante y es el mapa del mundo.** Desde el muelle de la cabaña, el bote sale a navegar y se ve el lago enorme desde arriba, como un mapa: en sus orillas e islas aparecen ciudades, pueblos y lugares, con niebla sobre los que aún no se han descubierto.
2. El jugador elige a dónde ir entre los lugares que tenga desbloqueados según su nivel. Durante la travesía pueden aparecer **eventos aleatorios en el agua**: un bote a la deriva con botín, supervivientes pidiendo ayuda, saqueadores, una tormenta. Al llegar, pantalla de carga.
3. Cada destino es un **nivel jugable** con dificultad propia: pueblos, ciudades y lugares específicos (gasolinera, hospital, base militar, puerto, supermercado...). Los más difíciles tienen más zombis, zombis especiales y mejor botín.
4. Se entra a buscar recursos y se vuelve en el bote a la cabaña antes de que caiga la noche (o se arriesga a quedarse).

**Botín por rareza:**

| Rareza | Ejemplos |
|---|---|
| Normal | Materiales de construcción, comida, munición común |
| Rara | Armas mejores, piezas para mejoras, medicinas |
| Especial | Armas con efectos (fuego, perforación), herramientas avanzadas |
| Legendaria | Armas únicas con nombre e historia, muy escasas, en los lugares más difíciles |

**Supervivientes:** en los destinos aparecen otros sobrevivientes:
- **Buenos:** se puede comerciar con ellos, darles ayuda a cambio de recompensas o misiones, o invitarlos a la zona de la cabaña en el futuro.
- **Malos:** saqueadores que roban, tienden emboscadas o pelean por el botín.

Cada encuentro trae decisiones con consecuencias.

## Economía y tienda

### Dos monedas (Brasas decidido; el nombre de la premium es provisional)

| Moneda | Cómo se consigue | Para qué |
|---|---|---|
| **Brasas** (moneda del juego) | Jugando: sobrevivir oleadas y noches, tareas del día, retos semanales, logros | Desbloquear personajes, aspectos básicos, mejoras permanentes pequeñas, mejoras temporales |
| **Copos** (moneda premium) | Comprada con dinero real; un poco también con logros o pase de temporada | Aspectos exclusivos, personajes antes de tiempo, pase de temporada, decoraciones de la cabaña |

### Qué hay en la tienda

- **Aspectos:** ropa y accesorios para Anselmo y los demás personajes, armas, la cabaña (techo, luces, decoración), huellas, el bote.
- **Otros personajes** jugables en Solitario y Multijugador, cada uno con su estilo y una pequeña ventaja propia que no rompa el equilibrio.
- **Habilidades especiales y mejoras temporales:** por ejemplo, "+10 % de velocidad al reparar durante una partida", "cada vendaje cura más esta noche", "empezar con 5 tablas extra".
- **Pase de temporada** por estación del año, con una ruta gratis y una de pago.

### Reglas para no dañar el juego (recomendadas)

1. **Lo que da ventaja se consigue con Brasas jugando.** Con dinero real se compran sobre todo aspectos y comodidad. Si una habilidad o mejora temporal se vende por Copos, también debe poder ganarse con Brasas.
2. **En Multijugador público y en la tabla de clasificación**, las mejoras temporales compradas no cuentan, o hay una tabla aparte. Si no, ganan los que pagan y los demás se van.
3. **Sin cajas sorpresa pagadas** (botín al azar con dinero real): en varios países están reguladas o prohibidas y las plataformas exigen mostrar probabilidades. Todo se compra sabiendo qué se recibe.
4. **El modo Historia no se monetiza por dentro.** En PC, el juego tiene precio de compra con aspectos opcionales. En el celular puede ser gratis para jugar, con la tienda.
5. **Precios claros** y sin trucos de presión ("oferta que termina en 5 minutos"). El jugador sabe cuánto gasta en dinero real.

### Requisitos técnicos (cuando llegue el momento)

- Los pagos con dinero real deben pasar por **Steam** en PC y por **Google Play Billing / App Store** en el celular. Las plataformas lo exigen y cobran comisión.
- Las compras y las monedas se guardan y validan en un **servidor**, no sólo en el equipo del jugador (si no, se pueden piratear).
- La tienda real llega con el multijugador. En la demo sólo se gana Brasas y se ve la tienda con artículos de muestra marcados "Próximamente".

## Plataformas y precio

- **Primero PC (Steam)**, con la demo para Windows. Después el celular.
- **Precio decidido:**
  - **PC (Steam): US$ 7,99**, con los precios regionales que sugiere Steam. Incluye todos los modos, sin anuncios, y un **paquete de bienvenida** (aspecto exclusivo de Anselmo y Brasas iniciales) para que quien pagó sienta la diferencia frente al celular.
  - **Celular: gratis para jugar.** Se sostiene con la tienda (aspectos, personajes, pase de temporada, Copos) y, opcionalmente, con **anuncios con recompensa** que el jugador elige ver (por ejemplo, ver un anuncio para duplicar las Brasas de la noche). Nunca anuncios obligatorios en medio de la partida.
  - En celular, la tienda puede vender más comodidad que en PC, pero siguen valiendo las reglas: nada de cajas sorpresa pagadas y la tabla de clasificación sin ventajas compradas.
- **Demo gratis en Steam** y participación en un **Steam Next Fest** para juntar listas de deseados antes del lanzamiento.

## Orden de desarrollo

1. Demo del modo Historia (en curso).
2. Modo Historia completo.
3. Modo Solitario (oleadas con Anselmo).
4. Multijugador privado con amigos.
5. Partidas públicas con bots, tabla de clasificación y retos semanales.
6. Versión para celular.

## Reglas técnicas desde la demo (para no rehacer después)

- La lógica del juego (necesidades, inventario, estructuras, zombis, oleadas) vive separada de lo visual.
- Nada de código que asuma un solo jugador: cada jugador es una entidad con un identificador.
- Las acciones del jugador son comandos ("golpear", "construir muro", "reparar", "curar"), para poder enviarlos por la red más adelante.
- Estructuras y oleadas definidas como datos (recursos `.tres`), no quemadas en el código.
