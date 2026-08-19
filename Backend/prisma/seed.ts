import { prisma } from '../src/config/prisma';
import { seedDatabase } from '../src/services/seed.service';

async function main() {
  console.log('🌱 Iniciando proceso de Seed de Base de Datos (Admin, Ejercicios, Rutinas y Usuarios)...');
  const result = await seedDatabase({ count: 50 });
  console.log('✅ Base de datos poblada exitosamente:');
  console.log(`   - Total Usuarios: ${result.users}`);
  console.log(`   - Total Ejercicios: ${result.exercises}`);
  console.log(`   - Total Rutinas: ${result.routines}`);
  console.log(`   - Total Restricciones Médicas: ${result.restrictions}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Error ejecutando seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
