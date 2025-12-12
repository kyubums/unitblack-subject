export class Session {
  id: string;
  sessionToken: string;
  surveyId: string;
  isCompleted: boolean;
  nextQuestionId: string;
  answers: QuestionAnswer[];
}

export abstract class QuestionAnswer {
  questionId: string;
  questionText: string;
}

export class NormalQuestionAnswer extends QuestionAnswer {
  answer: OptionedAnswer | TextAnswer;
}

export class MultipleChoiceQuestionAnswer extends QuestionAnswer {
  answers: OptionedAnswer[];
}

export abstract class Answer {
  type: string;
  submittedAt: string;
}

export class OptionedAnswer extends Answer {
  optionId: string;
  label: string;
}

export class TextAnswer extends Answer {
  text: string;
}
