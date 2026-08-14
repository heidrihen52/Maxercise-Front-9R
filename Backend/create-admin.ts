import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@adaptive-exercise.local';
  const password = process.argv[3] || 'Admin123!';

  console.log(`Intentando crear/actualizar usuario administrador con email: ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: Role.SUPER,
    },
    create: {
      first_name: 'Super',
      last_name: 'Admin',
      email,
      phone_number: '0000000000',
      password: hashedPassword,
      birth_date: new Date('1990-01-01'),
      role: Role.SUPER,
    },
  });

  console.log('¡Usuario administrador creado/actualizado con éxito!', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    first_name: admin.first_name,
    last_name: admin.last_name,
  });
}

main()
  .catch((e) => {
    console.error('Error al crear el usuario administrador:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
