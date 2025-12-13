import { QuestionType } from 'src/app/survey/survey.schema';
import z from 'zod';

export const BaseSubmittedAnswerSchema = z.object({
  type: z.enum(QuestionType),
  submittedAt: z.date(),
});

export const SubmittedSingleChoiceAnswerSchema =
  BaseSubmittedAnswerSchema.extend({
    type: z.literal(QuestionType.SingleChoice),
    optionId: z.string().nonempty(),
    label: z.string().nonempty(),
  });

export const SubmittedMultiChoiceAnswerSchema =
  BaseSubmittedAnswerSchema.extend({
    type: z.literal(QuestionType.MultiChoice),
    choices: z.array(z.object({ optionId: z.string(), label: z.string() })),
  });

export const SubmittedTextAnswerSchema = BaseSubmittedAnswerSchema.extend({
  type: z.literal(QuestionType.Text),
  text: z.string().nonempty(),
});

export const SubmittedAnswerSchema = z.discriminatedUnion('type', [
  SubmittedSingleChoiceAnswerSchema,
  SubmittedMultiChoiceAnswerSchema,
  SubmittedTextAnswerSchema,
]);

export const SubmittedQuestionAnswerSchema = z.object({
  questionId: z.string().nonempty(),
  questionText: z.string().nonempty(),
  answer: SubmittedAnswerSchema.nullish(),
});

export const GetSessionResponseSchema = z.object({
  sessionId: z.string().nonempty(),
  surveyId: z.string().nonempty(),
  isCompleted: z.boolean(),
  nextQuestionId: z.string().nullish(),
  answers: z.array(SubmittedQuestionAnswerSchema),
});

export type SubmittedSingleChoiceAnswer = z.infer<
  typeof SubmittedSingleChoiceAnswerSchema
>;
export type SubmittedMultiChoiceAnswer = z.infer<
  typeof SubmittedMultiChoiceAnswerSchema
>;
export type SubmittedTextAnswer = z.infer<typeof SubmittedTextAnswerSchema>;
export type SubmittedAnswer = z.infer<typeof SubmittedAnswerSchema>;
export type SubmittedQuestionAnswer = z.infer<
  typeof SubmittedQuestionAnswerSchema
>;
export type GetSessionResponse = z.infer<typeof GetSessionResponseSchema>;
