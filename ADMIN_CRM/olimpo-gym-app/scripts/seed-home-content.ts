/**
 * Seed: Contenido motivacional para el feed de la app
 * Run: npx tsx scripts/seed-home-content.ts
 *
 * Inserta tips, artículos y frases motivacionales globales (gymId = null)
 * Solo inserta si no existe ya un ítem con el mismo título.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { homeContent } from "../src/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── Contenido ────────────────────────────────────────────────────────────────

const CONTENT: Array<{
  type: "video" | "article" | "tip" | "image";
  title: string;
  body?: string;
  url?: string;
  imageUrl?: string;
  sortOrder: number;
}> = [

  // ─── TIPS MOTIVACIONALES ─────────────────────────────────────────────────

  {
    type: "tip",
    title: "La constancia vence al talento",
    body: "No importa si hoy no eres el más fuerte del gimnasio. El que viene todos los días, aunque sea poco, supera al que tiene talento pero no aparece. Tu mayor competencia eres tú del ayer.",
    sortOrder: 1,
  },
  {
    type: "tip",
    title: "El músculo se construye mientras descansas",
    body: "Entrenar es el estímulo, pero el crecimiento real ocurre durante el sueño y el descanso. Duerme 7-9 horas, permite la recuperación. El descanso no es pereza — es parte del entrenamiento.",
    sortOrder: 2,
  },
  {
    type: "tip",
    title: "Hidratación: el secreto que nadie practica",
    body: "Tu músculo es 75% agua. Deshidratado al 2% pierdes hasta un 20% de fuerza. Bebe mínimo 2.5 litros al día, más si entrenas fuerte. El agua es el suplemento más barato y efectivo que existe.",
    sortOrder: 3,
  },
  {
    type: "tip",
    title: "La proteína es el ladrillo del músculo",
    body: "Para construir masa muscular apunta a consumir 1.6–2g de proteína por kilo de peso corporal al día. Huevos, pollo, atún, frijoles y leche son tus aliados. No necesitas suplementos caros para empezar.",
    sortOrder: 4,
  },
  {
    type: "tip",
    title: "La técnica primero, el peso después",
    body: "Un ejercicio mal ejecutado con mucho peso no construye músculo — construye lesiones. Domina la técnica con un peso que puedas controlar en todo momento. El peso vendrá solo con el tiempo.",
    sortOrder: 5,
  },
  {
    type: "tip",
    title: "Come antes de entrenar",
    body: "Entrenar en ayunas puede funcionar para cardio ligero, pero para ganar fuerza necesitas energía disponible. Come 1-2 horas antes: carbohidratos + proteína. Un plátano con huevos es suficiente.",
    sortOrder: 6,
  },
  {
    type: "tip",
    title: "No saltes el calentamiento",
    body: "5 minutos de calentamiento preparan tus articulaciones, aumentan el flujo sanguíneo y reducen lesiones hasta un 50%. No es tiempo perdido — es inversión en longevidad atlética.",
    sortOrder: 7,
  },
  {
    type: "tip",
    title: "La progresión es la clave",
    body: "El principio más importante del entrenamiento: hacer más que la semana pasada. Un kilo más, una repetición más, un segundo de descanso menos. La progresión constante es lo que genera cambios reales.",
    sortOrder: 8,
  },
  {
    type: "tip",
    title: "Cuida tus rodillas al sentarte",
    body: "En sentadillas y prensa: las rodillas deben seguir la dirección de tus pies, nunca colapsar hacia adentro. Activa el glúteo y empuja con los talones. Tus rodillas te lo agradecerán en 20 años.",
    sortOrder: 9,
  },
  {
    type: "tip",
    title: "El dolor muscular bueno vs. el malo",
    body: "El DOMS (dolor muscular a las 24-48 horas) es normal y señal de adaptación. Pero el dolor agudo durante el ejercicio o en articulaciones es señal de parar. Aprende a distinguir ambos.",
    sortOrder: 10,
  },
  {
    type: "tip",
    title: "Los carbohidratos no son el enemigo",
    body: "Los carbohidratos son el combustible preferido del músculo. El arroz, avena, yuca, plátano y pan integral son tus amigos si los consumes en el momento correcto. Evita procesados y azúcares simples en exceso.",
    sortOrder: 11,
  },
  {
    type: "tip",
    title: "Registra tu entrenamiento",
    body: "Los que anotan sus pesos y repeticiones progresan hasta 3 veces más rápido que los que no. Tu registro es tu brújula. Usa la sección de rutinas de esta app para llevar tu historial.",
    sortOrder: 12,
  },
  {
    type: "tip",
    title: "La espalda recta es sagrada",
    body: "En remo, peso muerto, sentadilla y cualquier movimiento de carga: espalda neutra. No arqueada ni redondeada. Una lesión de espalda puede sacarte del gimnasio por meses. Vale la pena aprenderlo bien.",
    sortOrder: 13,
  },
  {
    type: "tip",
    title: "Respira durante el ejercicio",
    body: "Exhala en el esfuerzo (al levantar, empujar, jalar), inhala en la fase excéntrica (al bajar, ceder). No aguantes la respiración en ejercicios de alta intensidad — aumenta la presión arterial peligrosamente.",
    sortOrder: 14,
  },
  {
    type: "tip",
    title: "Los estiramientos finales importan",
    body: "Estirar después de entrenar aumenta la flexibilidad, reduce el riesgo de lesión y acelera la recuperación. Solo 7 minutos de estiramientos al finalizar marcan una diferencia enorme a largo plazo.",
    sortOrder: 15,
  },

  // ─── ARTÍCULOS ────────────────────────────────────────────────────────────

  {
    type: "article",
    title: "¿Cuánto tiempo se tarda en ver resultados?",
    body: "En las primeras 2-4 semanas: el sistema nervioso mejora la coordinación muscular — ves más fuerza pero no cambios físicos visibles. Semanas 4-8: el músculo empieza a crecer, ropa que antes ajustaba comienza a quedar mejor. Meses 3-6: cambios visibles para otros. El resultado más rápido viene de entrenar 3-4 veces por semana, comer suficiente proteína y dormir bien. No hay atajo, pero sí hay un camino claro.",
    sortOrder: 20,
  },
  {
    type: "article",
    title: "¿Por qué el peso en la báscula miente?",
    body: "El músculo pesa más que la grasa por volumen. Puedes estar bajando grasa y subiendo músculo al mismo tiempo — la báscula no se mueve pero tu cuerpo está cambiando radicalmente. Mejor mide tu cintura, toma fotos cada mes y fíjate cómo te queda la ropa. La báscula es solo un dato más, no la verdad absoluta.",
    sortOrder: 21,
  },
  {
    type: "article",
    title: "Cardio vs. Pesas: ¿Cuál es mejor para bajar de peso?",
    body: "El cardio quema calorías durante la sesión. Las pesas queman calorías durante Y DESPUÉS de la sesión (efecto afterburn). Además, más músculo = mayor metabolismo basal = quemas más calorías en reposo. La combinación de ambos es ideal, pero si solo puedes elegir uno para bajar de peso a largo plazo: las pesas ganan. El músculo es tu mejor aliado metabólico.",
    sortOrder: 22,
  },
  {
    type: "article",
    title: "Cómo comer bien sin gastar mucho",
    body: "Guatemala tiene alimentos increíblemente nutritivos a bajo costo: huevos (proteína completa, económica), frijoles negros (proteína + fibra), avena (carbohidrato de calidad), plátano (energía rápida), pollo (proteína magra), leche (proteína + calcio). Con Q50 diarios bien invertidos en estos alimentos puedes tener una dieta de atleta. No necesitas proteína en polvo para empezar a ver resultados.",
    sortOrder: 23,
  },
  {
    type: "article",
    title: "El sueño: el suplemento gratis que todos ignoran",
    body: "Durante el sueño profundo el cuerpo libera hormona de crecimiento, repara fibras musculares dañadas durante el entrenamiento y consolida la memoria motora (cómo ejecutar los ejercicios). Dormir menos de 6 horas reduce la producción de testosterona hasta un 15% y aumenta el cortisol (hormona del estrés que destruye músculo). Duerme 7-9 horas: es el mejor suplemento que existe y es completamente gratis.",
    sortOrder: 24,
  },
  {
    type: "article",
    title: "¿Cuántas veces a la semana debo entrenar?",
    body: "Principiante (0-6 meses): 3 días a la semana es ideal. Permite suficiente recuperación. Intermedio (6 meses - 2 años): 4 días. Avanzado (2+ años): 5-6 días con planificación inteligente de grupos musculares. Lo más importante: la consistencia en el tiempo supera cualquier frecuencia. Tres días cada semana por un año es infinitamente mejor que seis días dos semanas y luego abandonar.",
    sortOrder: 25,
  },
  {
    type: "article",
    title: "Por qué los espejos del gimnasio no mienten (pero tampoco dicen todo)",
    body: "El espejo muestra congestión muscular (la 'bomba' después de entrenar), iluminación y postura — todo eso suma a verte mejor de lo que realmente estás. Las fotos con luz natural, sin bombear, en la mañana en ayunas, son la medición más honesta de tu progreso. Úsalas como referencia real y toma una cada 4 semanas en las mismas condiciones.",
    sortOrder: 26,
  },
  {
    type: "article",
    title: "La verdad sobre los suplementos",
    body: "El 90% de los suplementos en el mercado son innecesarios si tu dieta es correcta. Los únicos con evidencia científica sólida: Creatina monohidratada (fuerza y volumen, económica), Proteína en polvo (conveniente si no alcanzas proteína con comida), Vitamina D (si no te expones al sol). Todo lo demás son principalmente marketing. Primero domina la alimentación básica, luego evalúa suplementos.",
    sortOrder: 27,
  },
  {
    type: "article",
    title: "Cómo recuperarte más rápido entre sesiones",
    body: "1. Proteína post-entreno dentro de los 30-60 minutos (huevos, pollo, leche). 2. Carbohidratos para reponer glucógeno muscular. 3. Agua y electrolitos (especialmente si sudaste mucho). 4. Sueño de calidad esa noche. 5. Foam roller o masaje suave en músculos doloridos. 6. Cardio suave (caminar) el día siguiente activa el flujo sanguíneo sin añadir fatiga. La recuperación ES el entrenamiento.",
    sortOrder: 28,
  },
  {
    type: "article",
    title: "Mentalidad de atleta: cómo mantener la motivación",
    body: "La motivación es una emoción — viene y va. Los atletas exitosos no esperan estar motivados para ir al gym, van por hábito y disciplina. Truco: baja el umbral. No 'voy a entrenar duro 1 hora', sino 'voy a ponerme la ropa y llegar'. Una vez que estás ahí, el 90% de las veces terminas entrenando bien. El primer paso es el más difícil. Hazlo automático.",
    sortOrder: 29,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nSeeding home content...\n");

  // Fetch existing titles to avoid duplicates
  const existing = await db.select({ title: homeContent.title }).from(homeContent);
  const existingTitles = new Set(existing.map((e) => e.title));

  let created = 0;
  let skipped = 0;

  for (const item of CONTENT) {
    if (existingTitles.has(item.title)) {
      console.log(`  ~ Existe: "${item.title}" — omitiendo`);
      skipped++;
      continue;
    }

    await db.insert(homeContent).values({
      gymId: null, // Global — visible para todos los miembros
      type: item.type,
      title: item.title,
      body: item.body ?? null,
      url: item.url ?? null,
      imageUrl: item.imageUrl ?? null,
      published: true,
      sortOrder: item.sortOrder,
    });

    const icon = item.type === "tip" ? "💡" : item.type === "article" ? "📄" : item.type === "video" ? "🎬" : "🖼️";
    console.log(`  + ${icon} [${item.type}] "${item.title}"`);
    created++;
  }

  console.log(`\n✔ Seed completado: ${created} creados, ${skipped} omitidos.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
