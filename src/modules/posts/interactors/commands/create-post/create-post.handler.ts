import type { CommandHandler } from '../../../../../libs/kernel/index.js';
import type { CreatePostParams } from './create-post.params.js';

export class CreatePostHandler implements CommandHandler<CreatePostParams> {
  async execute(params: CreatePostParams): Promise<void> {
    try {
      console.log(params);
    } catch (error) {
      // UseCaseErrorHandler.wrapErrorsToApplicationErrors(error);
    }
  }
}
