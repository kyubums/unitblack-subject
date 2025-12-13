import z from 'zod';
import { QuestionSchema, QuestionType } from '../survey/survey.schema';

export const BaseAnswerSchema = z.object({
  type: z.enum(QuestionType),
});

export const SingleChoiceAnswerSchema = BaseAnswerSchema.extend({
  type: z.literal(QuestionType.SingleChoice),
  optionId: z.string(),
  label: z.string(),
});

export const MultiChoiceAnswerSchema = BaseAnswerSchema.extend({
  type: z.literal(QuestionType.MultiChoice),
  choices: z.array(z.object({ optionId: z.string(), label: z.string() })),
});

export const TextAnswerSchema = BaseAnswerSchema.extend({
  type: z.literal(QuestionType.Text),
  text: z.string(),
});

export const AnswerSchema = z.discriminatedUnion('type', [
  SingleChoiceAnswerSchema,
  MultiChoiceAnswerSchema,
  TextAnswerSchema,
]);

export const QuestionAnswerSchema = z.object({
  questionId: z.string(),
  questionSnapshot: QuestionSchema,
  answer: AnswerSchema.nullable(),
  submittedAt: z.date(),
});

export const SessionSchema = z.object({
  id: z.number(),
  uuid: z.uuid(),
  sessionToken: z.string(),
  surveyId: z.string(),
  isCompleted: z.boolean(),
  nextQuestionId: z.string().nullable(),
});

export const NewSessionSchema = SessionSchema.omit({
  id: true,
  uuid: true,
});

export const DetailSessionSchema = SessionSchema.extend({
  answers: z.array(QuestionAnswerSchema),
});

export type SingleChoiceAnswer = z.infer<typeof SingleChoiceAnswerSchema>;
export type MultiChoiceAnswer = z.infer<typeof MultiChoiceAnswerSchema>;
export type TextAnswer = z.infer<typeof TextAnswerSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type BaseAnswer = z.infer<typeof BaseAnswerSchema>;
export type QuestionAnswer = z.infer<typeof QuestionAnswerSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type NewSession = z.infer<typeof NewSessionSchema>;
export type DetailSession = z.infer<typeof DetailSessionSchema>;
