import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from './src/config/prisma';

export async function createAdmin() {
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@adaptive-exercise.local' },
    update: {
      password: adminPassword,
      role: Role.SUPER,
      status: true,
    },
    create: {
      first_name: 'Super',
      last_name: 'Admin',
      email: 'admin@adaptive-exercise.local',
      phone_number: '0000000000',
      password: adminPassword,
      birth_date: new Date('1990-01-01'),
      role: Role.SUPER,
      status: true,
    },
  });

  console.log('✅ Usuario Administrador (SUPER) configurado exitosamente:');
  console.log(`   - Email: ${admin.email}`);
  console.log('   - Password: Admin123!');
  console.log(`   - Rol: ${admin.role}`);
  return admin;
}

if (require.main === module) {
  createAdmin()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Error creando administrador:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
