import { createItemRetriever } from 'src/app/common/item-retriever';
import {
  MultiChoiceQuestion,
  QuestionType,
  SingleChoiceQuestion,
  TextQuestion,
} from 'src/app/survey/survey.schema';
import {
  SubmittedAnswer,
  SubmittedMultiChoiceAnswer,
  SubmittedQuestionAnswer,
  SubmittedSingleChoiceAnswer,
  SubmittedTextAnswer,
  type GetSessionResponse,
} from '../responses/get-session.response';
import {
  MultiChoiceAnswer,
  QuestionAnswer,
  SingleChoiceAnswer,
  TextAnswer,
  type DetailSession,
} from '../session.schema';

export function mapDetailSessionToGetSessionResponse(
  detailSession: DetailSession,
): GetSessionResponse {
  const submittedAnswers: SubmittedQuestionAnswer[] = detailSession.answers.map(
    (questionAnswer) => mapToSubmittedQuestionAnswer(questionAnswer),
  );
  return {
    sessionId: detailSession.uuid,
    surveyId: detailSession.surveyId,
    isCompleted: detailSession.isCompleted,
    nextQuestionId: detailSession.nextQuestionId,
    answers: submittedAnswers,
  };
}

function mapToSubmittedQuestionAnswer(
  questionAnswer: QuestionAnswer,
): SubmittedQuestionAnswer {
  const answer = mapToSubmittedAnswer(questionAnswer);
  return {
    questionId: questionAnswer.questionId,
    questionText: questionAnswer.questionSnapshot.text,
    answer,
  };
}

function mapToSubmittedAnswer(
  questionAnswer: QuestionAnswer,
): SubmittedAnswer | null {
  const answer = questionAnswer.answer;
  if (!answer) {
    return null;
  }

  switch (questionAnswer.questionSnapshot.type) {
    case QuestionType.SingleChoice:
      return mapToSubmittedSingleChoiceAnswer({
        ...questionAnswer,
        questionSnapshot:
          questionAnswer.questionSnapshot as SingleChoiceQuestion,
        answer: answer as SingleChoiceAnswer,
      });
    case QuestionType.MultiChoice:
      return mapToSubmittedMultiChoiceAnswer({
        ...questionAnswer,
        questionSnapshot:
          questionAnswer.questionSnapshot as MultiChoiceQuestion,
        answer: answer as MultiChoiceAnswer,
      });
    case QuestionType.Text:
      return mapToSubmittedTextAnswer({
        ...questionAnswer,
        questionSnapshot: questionAnswer.questionSnapshot as TextQuestion,
        answer: answer as TextAnswer,
      });
    default:
      throw new Error(`Invalid question type`);
  }
}

function mapToSubmittedSingleChoiceAnswer(
  questionAnswer: QuestionAnswer & {
    questionSnapshot: SingleChoiceQuestion;
    answer: SingleChoiceAnswer;
  },
): SubmittedSingleChoiceAnswer {
  const { questionSnapshot: question, answer } = questionAnswer;
  const optionRetriever = createItemRetriever(question.options, 'id');
  const choicedOption = optionRetriever.get(answer.optionId)!;
  return {
    type: QuestionType.SingleChoice,
    optionId: answer.optionId,
    label: choicedOption.label,
    submittedAt: questionAnswer.submittedAt,
  };
}

function mapToSubmittedMultiChoiceAnswer(
  questionAnswer: QuestionAnswer & {
    questionSnapshot: MultiChoiceQuestion;
    answer: MultiChoiceAnswer;
  },
): SubmittedMultiChoiceAnswer {
  const { questionSnapshot: question, answer } = questionAnswer;
  const optionRetriever = createItemRetriever(question.options, 'id');
  const choices = answer.optionIds.map((optionId) => {
    const choicedOption = optionRetriever.get(optionId)!;
    return {
      optionId,
      label: choicedOption.label,
    };
  });

  return {
    type: QuestionType.MultiChoice,
    choices,
    submittedAt: questionAnswer.submittedAt,
  };
}

function mapToSubmittedTextAnswer(
  questionAnswer: QuestionAnswer & {
    questionSnapshot: TextQuestion;
    answer: TextAnswer;
  },
): SubmittedTextAnswer {
  const { answer } = questionAnswer;
  return {
    type: QuestionType.Text,
    text: answer.text,
    submittedAt: questionAnswer.submittedAt,
  };
}
