import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Paramtype,
} from '@nestjs/common';
import z, { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodSchema,
    private paramType: Paramtype,
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== this.paramType) {
      return value;
    }

    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(z.treeifyError(error).errors.join('\n'));
      }

      throw new BadRequestException('Validation failed');
    }
  }
}
