import z from 'zod';

export const CreateSessionRequestSchema = z
  .object({
    surveyId: z.string().nonempty(),
  })
  .required();

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;
