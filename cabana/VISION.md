# Old Man Winter · Visión del juego completo

Juego en **inglés y español** desde el primer día.

Documento de referencia para después de la demo. La demo actual es sólo del **modo Historia** (ver `PROMPT_CLAUDE_CODE.md`).

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
- **Estaciones en Multijugador:** en Historia y Solitario cambian cada 5 días de juego (decidido). En Multijugador podrían seguir ese mismo ritmo o ser un calendario compartido por el servidor.

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
