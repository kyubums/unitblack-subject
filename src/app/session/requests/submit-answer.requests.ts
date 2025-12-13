import z from 'zod';

export const SubmittingAnswerSchema = z.object({
  optionId: z.string().optional(),
  optionIds: z.array(z.string()).optional(),
  text: z.string().optional(),
});

export const SubmitAnswerRequestSchema = z.object({
  questionId: z.string().nonempty(),
  answer: SubmittingAnswerSchema.nullable(),
});

export type SubmittingAnswer = z.infer<typeof SubmittingAnswerSchema>;
export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;
