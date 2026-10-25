# El Viejo del Lago · Visión del juego completo

Documento de referencia para después de la demo. La demo actual es sólo del **modo Historia** (ver `PROMPT_CLAUDE_CODE.md`).

## Menú principal

| Modo | Qué es |
|---|---|
| **Historia** | Anselmo solo: la radio, las estaciones, los capítulos y el bote para buscar recursos. Es lo primero que se construye. |
| **Solitario** | Supervivencia por oleadas sin historia. Sólo Anselmo, sin bots. |
| **Multijugador** | Modo horda cooperativo de 4 jugadores. Partida privada con amigos o partida pública. |

## Multijugador: modo horda cooperativo

- No es contra otros jugadores: los 4 jugadores cooperan contra oleadas de zombis.
- La partida empieza en una cabaña **sin recursos**. Entre todos la reconstruyen, la refuerzan y ven cuántas oleadas sobreviven.
- **No hay bote** en este modo. Los recursos salen del mapa: bosque, lago y lo que se consiga entre oleadas.
- **Partida privada:** con amigos, mediante un código de invitación.
- **Partida pública:** busca jugadores y completa con **bots de IA** los lugares que falten (al principio habrá poca gente). La IA de los bots se diseña más adelante.

### Roles

Todos los roles pelean igual (mismas armas básicas y misma resistencia). Cada uno tiene **habilidades extra**:

| Rol | Habilidades extra |
|---|---|
| **Médico** | Va a curar a los compañeros caídos en el campo mientras los demás lo cubren. Cura más rápido y rinde más los vendajes. |
| **Cazador** | Experto con arco y flechas y con el rifle de francotirador. Más daño y precisión a distancia. |
| **Constructor** | Construye muros de madera y torres de vigilancia, y repara las estructuras más rápido. |
| **Cuarto rol** | Por definir. |

### Estructuras

- **Muros de madera** alrededor de la cabaña, construidos por el constructor. Los zombis los golpean hasta romperlos.
- **Torres de vigilancia**: cualquier jugador puede subir a disparar desde arriba. Si los zombis las dañan, el constructor las repara.
- Barricadas en puertas y ventanas de la cabaña, como en el modo Historia.

### Ideas pendientes de decidir

- **Cuarto rol.** Opciones: armero o mecánico (fabrica y mejora armas, munición y trampas) o recolector (corta leña y junta recursos más rápido y carga más).
- **Cajas de suministro entre oleadas**, por ejemplo un helicóptero que deja caer provisiones lejos de la cabaña. Obligan a salir de la base con riesgo y compensan que no haya bote.
- **Revivir:** al caer, el jugador queda en el suelo unos segundos y cualquiera lo puede levantar; el médico lo hace más rápido y con más vida.
- **Tabla de clasificación** de oleadas sobrevividas y un **reto semanal** con la misma cabaña y las mismas condiciones para todos.
- **Oleadas especiales** cada cierto número: zombi gigante, noche de niebla, llegada del invierno.
- **Estaciones:** en Historia y Solitario avanzan por días de juego. En Multijugador podrían ser un calendario compartido por el servidor.

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
