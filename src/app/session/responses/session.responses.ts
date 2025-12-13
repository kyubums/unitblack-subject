import z from 'zod';
import { SessionSchema } from '../session.schema';

export const CreateSessionResponseSchema = SessionSchema;
export type CreateSessionResponse = z.infer<typeof CreateSessionResponseSchema>;
