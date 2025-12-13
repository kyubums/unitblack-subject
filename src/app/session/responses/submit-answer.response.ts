import z from 'zod';

const SubmitAnswerResponseSchema = z.object({
  nextQuestionId: z.string().nullable(),
  completed: z.boolean(),
  submittedAt: z.date(),
});

export type SubmitAnswerResponse = z.infer<typeof SubmitAnswerResponseSchema>;
