import z from 'zod';

export enum QuestionType {
  SingleChoice = 'singleChoice',
  MultiChoice = 'multiChoice',
  Text = 'text',
}

export const AnswerOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const NextQuestionAnswerOptionSchema = AnswerOptionSchema.extend({
  nextQuestionId: z.string().optional(),
});

export const BaseQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(QuestionType),
  text: z.string(),
  required: z.boolean().nullish().default(false),
});

export const SingleChoiceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.SingleChoice),
  required: z.literal(true),
  options: z.array(NextQuestionAnswerOptionSchema),
});

export const MultiChoiceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.MultiChoice),
  options: z.array(AnswerOptionSchema),
  nextQuestionId: z.string().nullish(),
  minSelect: z.number(),
  maxSelect: z.number(),
});

export const TextQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.Text),
  nextQuestionId: z.string().nullish(),
});

export const QuestionSchema = z.discriminatedUnion('type', [
  SingleChoiceQuestionSchema,
  MultiChoiceQuestionSchema,
  TextQuestionSchema,
]);

export const SurveySchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.number(),
  startQuestionId: z.string(),
  questions: z.array(QuestionSchema),
});

export type Survey = z.infer<typeof SurveySchema>;
export type SingleChoiceQuestion = z.infer<typeof SingleChoiceQuestionSchema>;
export type MultiChoiceQuestion = z.infer<typeof MultiChoiceQuestionSchema>;
export type TextQuestion = z.infer<typeof TextQuestionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type AnswerOption = z.infer<typeof AnswerOptionSchema>;
export type NextQuestionAnswerOption = z.infer<
  typeof NextQuestionAnswerOptionSchema
>;
