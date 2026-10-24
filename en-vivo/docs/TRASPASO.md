# EN VIVO — Documento de traspaso (resumen)

Documento original de diseño entregado al empezar la versión para navegador. Resume la historia, el tono y la demo escena por escena.

## Concepto

- Aventura narrativa y thriller psicológico en tercera persona, cámara libre detrás del hombro.
- Referencia de tono: *The Last of Us* (realismo, cinemáticas integradas, actuación contenida, violencia con peso y sin morbo).
- Gancho: la vida del protagonista es un *reality show* grabado en secreto. Cámaras ocultas con LED rojo en todos los escenarios.
- Colombia, 1998. Universidad pública y ciudad latinoamericana de los 90.

## Historia de la demo

**Acto 1 (marzo de 1998):** aula a las 4:30 p. m. (Andrés invita a almorzar) → pasillo (Semana Cultural 1998, teléfono público, primera cámara oculta) → cafetería (Andrés guarda puesto, habla del estudiante callado de Sistemas) → el ataque (esconderse detrás de la barra) → el tirador ("...Tú no. A ti te necesitan vivo.") → golpe, desmayo e intertítulo.

**Acto 2 (octubre de 1998):** Mateo despierta en el hospital 7 meses después, encuentra su chaqueta con una mancha, ve la ciudad vacía por la ventana. Final: plano de vigilancia "● REC · CAM 07 · HAB 312 · 14-10-1998", jingle de TV y "EN VIVO — CONTINUARÁ...".

**Giro pendiente:** todo, incluido el tiroteo, fue parte del programa.

## Personajes

| Personaje | Descripción |
|---|---|
| Mateo Rivas | 20 años, pelo castaño despeinado, chaqueta de jean, buzo gris con capucha, camisa a cuadros vinotinto, pantalón de pana café, tenis gastados. |
| Andrés | Mejor amigo, piel morena, pelo rizado corto, ropa de bloques de color (naranja, amarillo, azul). |
| El tirador | Estudiante de Sistemas, callado, todo de negro. Rifle de cerrojo y pistola. Sabe de las cámaras. |
| Profesor | Mayor, pelo gris, camisa azul claro. |

## Recursos previstos para la versión de producción

- Animaciones de Mixamo ya descargadas: Breathing Idle, Walking, Fast Run, Run Forward, Talking, Sit To Stand, Standing Up, Laying Sleeping, Falling Back Death, Firing Rifle, Stepping Backward.
- Faltan: Pistol Idle/Walk, Pistol Whip, Scared Crouch, Terrified, Running Scared, sentado en pupitre.
- Poly Haven (CC0): SchoolDesk_01, SchoolChair_01, metal_office_desk, old_bed_frame, wheelchair_01, side_table_01, medical_box, service_pistol, bolt_action_rifle_7_62, potted_plant_01, korean_public_payphone_01, plastic_monobloc_chair_01, wall_clock, ceramic_vase_01, painted_wooden_nightstand; texturas (Terrazzo) y HDRIs.
- Mateo en alta resolución generado en Tripo3D (exportar en FBX con preset para Mixamo).

## Lecciones del prototipo en Godot

- El cuello de botella del realismo son los recursos (personajes, ropa, pelo, captura de movimiento), no el motor.
- GPU del desarrollador: Radeon Vega 8 integrada. Por eso esta demo tiene calidad "Bajo" y rendimiento como prioridad.
- Funcionó: escenas como módulos, gestor global de interfaz y efectos, LOD de personajes por distancia y gente de relleno.
