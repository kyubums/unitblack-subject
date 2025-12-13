import z from 'zod';
import { SessionSchema } from '../session.schema';

export const StartSessionResponseSchema = SessionSchema;
export type StartSessionResponse = z.infer<typeof StartSessionResponseSchema>;
