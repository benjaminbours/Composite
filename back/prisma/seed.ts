import { Role, LevelStatus } from '@prisma/client';
import { prismaClient } from 'test/prismaClient';
import * as argon2 from 'argon2';

const persistentUsers = [
  {
    name: 'elboursico',
    email: 'boursbenjamin@gmail.com',
    // deepcode ignore NoHardcodedPasswords: it's test credentials, so it's fine
    password: 'testpassword',
    role: Role.USER,
  },
];

const persistentLevels = [
  {
    name: 'test level',
    data: [
      {
        name: 'end_level',
        type: 'end_level',
        properties: {
          transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { _x: 0, _y: 0, _z: 0, _order: 'XYZ', isEuler: true },
          },
        },
      },
    ],
    status: LevelStatus.PUBLISHED,
    authorId: 1,
    lightStartPosition: [-0.8, 0],
    shadowStartPosition: [0.8, 0],
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

  for (const level of persistentLevels) {
    await prismaClient.level.create({
      data: {
        ...level,
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
