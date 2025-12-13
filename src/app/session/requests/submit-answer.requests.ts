import z from 'zod';

export const SubmittedAnswerSchema = z.object({
  optionId: z.string().optional(),
  optionIds: z.array(z.string()).optional(),
  text: z.string().optional(),
});

export const SubmitAnswerRequestSchema = z.object({
  questionId: z.string().nonempty(),
  answer: SubmittedAnswerSchema.nullable(),
});

export type SubmittedAnswer = z.infer<typeof SubmittedAnswerSchema>;
export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;
