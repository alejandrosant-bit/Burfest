// Guion de la demo. Todos los textos visibles están aquí para poder editarlos sin tocar la lógica.

export const CARDS = {
  aula: 'UNIVERSIDAD  ·  MARZO DE 1998  ·  4:30 P. M.',
};

export const LINES = {
  aula_profesor: [
    ['Profesor', '...y por eso la Constitución del 91 no es sólo un papel. Es un acuerdo entre todos nosotros.'],
    ['Profesor', 'Para el jueves: capítulo cuatro. Y sí, jóvenes... entra en el parcial.'],
  ],
  aula_invitacion: [
    ['Andrés', '¿Almorzamos en la cafetería? Me muero de hambre.'],
    ['Mateo', 'Obvio. Apenas suene el timbre.'],
  ],
  aula_salida: [
    ['Andrés', 'Te guardo puesto en la cafetería. ¡No te demores!'],
  ],
  pasillo_companero: [
    ['Camilo', '¡Rivas! ¿Vas pa\' la cafetería? Hoy hay sancocho.'],
    ['Mateo', 'Pa\' allá voy.'],
  ],
  pasillo_camara: [
    ['Mateo', '(¿Eso es una cámara? ...¿Desde cuándo hay cámaras acá?)'],
  ],
  pasillo_telefono: [
    ['Mateo', 'Sin monedas. Más tarde llamo a mi mamá.'],
  ],
  pasillo_mural: [
    ['Mateo', 'Semana Cultural... El concierto es el viernes. Ojalá no llueva.'],
  ],
  pasillo_tablero: [
    ['Mateo', '"Se busca compañero de apartamento"... otra vez.'],
  ],
  cafeteria_llegada: [
    ['Andrés', '¡Mateo! ¡Acá! Te guardé puesto.'],
  ],
  cafeteria_charla: [
    ['Andrés', 'Oye, ¿has visto al man de Sistemas? El callado. El de la chaqueta negra.'],
    ['Mateo', '¿El que se sienta solo, allá atrás?'],
    ['Andrés', 'Ese. Hoy en la fila no le quitaba los ojos de encima a nadie. Me dio escalofrío.'],
    ['Mateo', 'Tú ves fantasmas en todo, Andrés.'],
    ['Andrés', 'Te lo juro. Tenía cara de que...'],
  ],
  cafeteria_esconde: [['Andrés', '¡ESCÓNDETE, MATEO!']],
  cafeteria_respira: [['Mateo', 'No respires... no respires...']],
  cafeteria_suplica: [['Mateo', 'Por favor... no...']],
  cafeteria_tirador: [['Tirador', '...Tú no. A ti te necesitan vivo.']],
  cafeteria_grito: [['Andrés', '¡¡MATEO!!']],
  hospital_despertar: [['Mateo', '¿Dónde... estoy?']],
  hospital_chaqueta: [
    ['Mateo', 'Mi chaqueta... la que tenía ese día.'],
    ['Mateo', '...Y una mancha que prefiero no mirar.'],
  ],
  hospital_calendario: [['Mateo', '¿Octubre? ...No. No puede ser.']],
  hospital_tv: [['Mateo', 'Nada. Sólo estática.']],
  hospital_ventana: [
    ['Mateo', '...'],
    ['Mateo', '¿Dónde está todo el mundo?'],
  ],
};

export const INTERTITLE = [
  '14 de marzo de 1998.',
  'Un estudiante armado irrumpió en la universidad.',
  'Mateo Rivas sobrevivió, pero recibió un golpe severo en la cabeza.',
  'Esa misma noche entró en coma.',
  '...',
  'Nadie sabe cuánto tiempo estuvo dormido.',
];

export const OBJECTIVES = {
  aula: 'Sal al pasillo',
  pasillo: 'Ve a la cafetería',
  cafeteria_sentarse: 'Siéntate con Andrés',
  cafeteria_esconderse: 'Escóndete detrás de la barra',
  hospital: 'Mira a tu alrededor',
};
