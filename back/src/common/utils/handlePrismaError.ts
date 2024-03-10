import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(e: any): Promise<any> {
  console.error(e);
  if (e instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException(
      'Incorrect payload. Prisma validation failed',
    );
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case 'P2025':
        throw new NotFoundException();
      case 'P2000':
        throw new BadRequestException(
          `Value is too long for the field: ${e.meta?.field_name}`,
        );
      case 'P2002':
        throw new ConflictException('Unique constraint violation');
      case 'P2003':
        throw new BadRequestException(
          `Foreign key constraint failed on the field: ${e.meta?.field_name}`,
        );
      case 'P2025':
        throw new BadRequestException((e.meta as any).cause);
      default:
        throw e;
    }
  }

  throw e;
}
