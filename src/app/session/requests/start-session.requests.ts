import z from 'zod';

export const StartSessionRequestSchema = z
  .object({
    surveyId: z.string().nonempty(),
  })
  .required();

export type StartSessionRequest = z.infer<typeof StartSessionRequestSchema>;
