import { BadRequestException } from '@nestjs/common';
import { DetailSession } from './session.schema';

export class SessionProcessor {
  constructor(private detailSession: DetailSession) {}

  checkSubmittable(questionId: string): void {
    if (this.detailSession.isCompleted) {
      throw new BadRequestException('Session already completed');
    }

    if (this.detailSession.nextQuestionId !== questionId) {
      throw new BadRequestException('Invalid question step');
    }

    const hasSubmittedAnswer = this.detailSession.answers.some(
      (answer) => answer.answer,
    );

    if (hasSubmittedAnswer) {
      throw new BadRequestException('Question already submitted');
    }
  }
}
