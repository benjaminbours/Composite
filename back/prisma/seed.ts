import { Role } from '@prisma/client';
import { prismaClient } from 'test/prismaClient';
import * as argon2 from 'argon2';

const persistentUsers = [
  {
    name: 'elboursico',
    email: 'boursbenjamin@gmail.com',
    password: 'testpassword',
    role: Role.USER,
  },
];

async function main() {
  for (const user of persistentUsers) {
    const hash = await argon2.hash(user.password);
    await prismaClient.user.create({
      data: {
        ...user,
        password: hash,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
