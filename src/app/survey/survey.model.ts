export interface Survey {
  id: string;
  title: string;
  version: number;
  startQuestionId: string;
  questions: Question[];
}

export abstract class Question {
  id: string;
  type: string;
  text: string;
  required: boolean;
}

export class SingleChoiceQuestion extends Question {
  declare required: true;
  options: NextQuestionAnswerOption[];
}

export class MultiChoiceQuestion extends Question {
  options: AnswerOption[];
  nextQuestionId: string;
}

export class TextQuestion extends Question {
  nextQuestionId: string;
}

export class AnswerOption {
  id: string;
  label: string;
}

export class NextQuestionAnswerOption extends AnswerOption {
  nextQuestionId: string;
}
