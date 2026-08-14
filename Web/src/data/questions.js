const questions = [
  {
    id: 'personal',
    title: 'Cuéntanos sobre ti',
    subtitle: 'Información personal para personalizar tu experiencia',
    fields: [
      {
        id: 'gender',
        label: '¿Cuál es tu género?',
        why: 'Tu género nos ayuda a personalizar las rutinas, la distribución muscular recomendada y los tips de entrenamiento específicos para tu fisiología.',
        type: 'single',
        options: [
          // Male: man training in gym
          { value: 'male', label: 'Hombre', image: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=300&q=80' },
          // Female: woman doing fitness
          { value: 'female', label: 'Mujer', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&q=80' },
          // Other: diverse person exercising
          { value: 'other', label: 'Prefiero no decir', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80' },
        ],
      },
      {
        id: 'age',
        label: '¿Cuál es tu rango de edad?',
        why: 'La edad influye directamente en la recuperación muscular, la intensidad de entrenamiento recomendada y qué ejercicios son seguros para tus articulaciones y sistema cardiovascular. Por ejemplo, personas mayores de 45 años necesitan más énfasis en movilidad y recuperación.',
        type: 'single',
        options: [
          // Teen: young runner
          { value: '15-20', label: '15 - 20', image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=300&q=80' },
          // 20s: young adult lifting
          { value: '21-30', label: '21 - 30', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
          // 30s-40s: mature adult workout
          { value: '31-45', label: '31 - 45', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=80' },
          // 50s: older adult active stretching
          { value: '46-60', label: '46 - 60', image: 'https://images.unsplash.com/photo-1571388208497-71bedc46fc4a?w=300&q=80' },
          // 60+: active senior / yoga
          { value: '60+', label: '60+', image: 'https://images.unsplash.com/photo-1584697964400-2af6a2f6204c?w=300&q=80' },
        ],
      },
      {
        id: 'goal',
        label: '¿Cuál es tu objetivo principal?',
        why: 'Tu objetivo define el tipo de rutinas que recibirás: pérdida de peso prioriza cardio e intervalos, ganar músculo prioriza fuerza e hipertrofia, flexibilidad prioriza estiramiento y movilidad.',
        type: 'single',
        options: [
          // Lose weight: cardio
          { value: 'lose_weight', label: 'Perder peso', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80' },
          // Gain muscle: weights
          { value: 'gain_muscle', label: 'Ganar músculo', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&q=80' },
          // Stay fit: jogging / active
          { value: 'stay_fit', label: 'Mantenerme en forma', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=80' },
          // Flexibility: stretch
          { value: 'flexibility', label: 'Mejorar flexibilidad', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80' },
          // Health: wellness
          { value: 'health', label: 'Mejorar salud general', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'bodyType',
    title: 'Tu tipo de cuerpo',
    subtitle: 'Conocer tu somatotipo nos ayuda a recomendarte mejor',
    fields: [
      {
        id: 'bodyType',
        label: '¿Con cuál somatotipo te identificas más?',
        why: 'El somatotipo ayuda a calibrar el balance entre ejercicios de fuerza, cardio y dieta. Un ectomorfo necesita más volumen y calorías; un endomorfo, más cardio y déficit calórico; un mesomorfo, puede avanzar con programas equilibrados.',
        type: 'single',
        options: [
          // Ectomorph: lean slim person
          { value: 'ectomorph', label: 'Ectomorfo', description: 'Delgado, dificultad para ganar masa', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&q=80' },
          // Mesomorph: athletic physique
          { value: 'mesomorph', label: 'Mesomorfo', description: 'Atlético, músculos bien definidos', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=80' },
          // Endomorph: sturdier build
          { value: 'endomorph', label: 'Endomorfo', description: 'Mayor tendencia a acumular grasa', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80' },
          // Mixed: general training
          { value: 'mixed', label: 'No sé / Mixto', description: 'No me identifico con ninguno claramente', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'fitnessLevel',
    title: 'Tu nivel de condición física',
    subtitle: 'Sé honesto para que podamos recomendarte correctamente',
    fields: [
      {
        id: 'fitnessLevel',
        label: '¿Cómo describes tu condición física actual?',
        why: 'Tu nivel actual determina la dificultad base de los ejercicios recomendados. Un principiante iniciando con rutinas avanzadas puede sufrir lesiones. Ser honesto aquí garantiza un progreso seguro y progresivo.',
        type: 'single',
        options: [
          // Beginner: light jogging / starting
          { value: 'beginner', label: 'Principiante', description: 'Nunca o casi nunca hago ejercicio', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=80' },
          // Intermediate: regular exercise
          { value: 'intermediate', label: 'Intermedio', description: 'Ejercito regularmente pero sin estructura', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80' },
          // Advanced: heavy lifter
          { value: 'advanced', label: 'Avanzado', description: 'Entrenamiento constante y estructurado', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
        ],
      },
      {
        id: 'daysPerWeek',
        label: '¿Cuántos días a la semana puedes entrenar?',
        why: 'La frecuencia semanal define la estructura de tu plan: con 1-2 días se prioriza cuerpo completo; con 5-6 días se puede hacer división muscular avanzada (push/pull/legs). Es importante ser realista con tu disponibilidad.',
        type: 'single',
        options: [
          // 1-2 days: relaxed walking
          { value: '1-2', label: '1-2 días', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=80' },
          // 3-4 days: consistent gym
          { value: '3-4', label: '3-4 días', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=300&q=80' },
          // 5-6 days: intense workout
          { value: '5-6', label: '5-6 días', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80' },
          // Every day: full performance
          { value: '7', label: 'Todos los días', image: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'health',
    title: 'Tu salud importa',
    subtitle: 'Selecciona todas las condiciones o lesiones que apliquen',
    fields: [
      {
        id: 'restrictions',
        label: '¿Tienes alguna condición física o lesión?',
        why: 'Esta información es vital para excluir automáticamente ejercicios que puedan agravar lesiones o condiciones existentes. Por ejemplo, squats pesados se excluyen si tienes lesión de rodilla; los ejercicios de alto impacto si tienes condición cardiaca.',
        type: 'multi',
        options: [
          // Knee injury: close up knee
          { value: 'lesión_rodilla', label: 'Lesión de rodilla', image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=300&q=80' },
          // Back injury: back pain
          { value: 'lesión_espalda', label: 'Lesión de espalda', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&q=80' },
          // Shoulder injury: shoulder pain
          { value: 'lesión_hombro', label: 'Lesión de hombro', image: 'https://images.unsplash.com/photo-158100937042-c552e485697a?w=300&q=80' },
          // Wrist injury: wrist pain
          { value: 'lesión_muñeca', label: 'Lesión de muñeca', image: 'https://images.unsplash.com/photo-1617350337552-ca1e5c0ddf43?w=300&q=80' },
          // Neck injury: neck massage / therapy
          { value: 'lesión_cuello', label: 'Lesión de cuello / cervical', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&q=80' },
          // Cardiac: ECG / heart doctor checkup
          { value: 'condición_cardiaca', label: 'Condición cardiaca', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&q=80' },
          // Hypertension: blood pressure check
          { value: 'hipertensión', label: 'Hipertensión', image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&q=80' },
          // Hernia: back checkup / pain
          { value: 'hernia', label: 'Hernia', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&q=80' },
          // Obesity: waist measure
          { value: 'obesidad', label: 'Obesidad', image: 'https://images.unsplash.com/photo-1505250469613-27bac2f000ff?w=300&q=80' },
          // Asthma: inhaler
          { value: 'asma', label: 'Asma', image: 'https://images.unsplash.com/photo-1559039626-d3ee6e7d6ab6?w=300&q=80' },
          // Pregnancy: prenatal yoga
          { value: 'embarazo', label: 'Embarazo', image: 'https://images.unsplash.com/photo-1590102873895-ee720210d795?w=300&q=80' },
          // No restrictions: healthy fit training
          { value: 'ninguna', label: 'Sin restricciones', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80' },
        ],
      },
    ],
  },
  {
    id: 'equipment',
    title: 'Tu equipo disponible',
    subtitle: 'Marca todo el equipo al que tienes acceso',
    fields: [
      {
        id: 'equipment',
        label: '¿Con qué equipo cuentas?',
        why: 'Solo te mostraremos ejercicios que puedes realizar con el equipo que tienes disponible. Esto evita frustraciones y asegura que cada rutina sea 100% ejecutable para ti hoy mismo.',
        type: 'multi',
        options: [
          // Full gym: gym machines
          { value: 'gym_full', label: 'Gimnasio completo', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80' },
          // Dumbbells: close up dumbbells
          { value: 'dumbbells', label: 'Mancuernas', image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=300&q=80' },
          // Barbell: barbell rack
          { value: 'barbell', label: 'Barra y discos', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&q=80' },
          // Kettlebell: kettlebells rack
          { value: 'kettlebell', label: 'Kettlebell', image: 'https://images.unsplash.com/photo-1538388149343-8d9de4a9667c?w=300&q=80' },
          // Resistance bands: bands training
          { value: 'resistance_bands', label: 'Bandas elásticas', image: 'https://images.unsplash.com/photo-1591258739009-c8928a3f87c3?w=300&q=80' },
          // Pull-up bar: doing pull ups
          { value: 'pullup_bar', label: 'Barra de dominadas', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=300&q=80' },
          // Cardio machine: cycling machine
          { value: 'cardio_machine', label: 'Máquinas de cardio', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=300&q=80' },
          // No equipment: push up bodyweight
          { value: 'none', label: 'Sin equipo (peso corporal)', image: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=300&q=80' },
        ],
      },
    ],
  },
];

export default questions;
