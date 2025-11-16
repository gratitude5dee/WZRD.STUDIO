import { toast } from 'sonner';

export type ErrorType =
  | 'network'
  | 'auth'
  | 'validation'
  | 'permission'
  | 'not-found'
  | 'rate-limit'
  | 'generation'
  | 'storage'
  | 'unknown';

export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  /**
   * Create a typed error
   */
  static createError(
    message: string,
    type: ErrorType = 'unknown',
    code?: string,
    details?: any
  ): AppError {
    const error = new Error(message) as AppError;
    error.type = type;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Handle error with appropriate user feedback
   */
  static handle(error: unknown, context?: string): void {
    console.error(`[${context || 'Error'}]:`, error);

    const appError = this.parseError(error);
    const message = this.getErrorMessage(appError);
    const description = this.getErrorDescription(appError);

    // Show toast notification
    toast.error(message, {
      description,
      duration: 5000,
    });
  }

  /**
   * Parse unknown error into AppError
   */
  private static parseError(error: unknown): AppError {
    if (error instanceof Error) {
      const appError = error as AppError;
      
      // Try to infer type from message
      if (!appError.type) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          appError.type = 'network';
        } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
          appError.type = 'auth';
        } else if (error.message.includes('not found')) {
          appError.type = 'not-found';
        } else if (error.message.includes('rate limit')) {
          appError.type = 'rate-limit';
        } else {
          appError.type = 'unknown';
        }
      }
      
      return appError;
    }

    return this.createError(String(error), 'unknown');
  }

  /**
   * Get user-friendly error message
   */
  private static getErrorMessage(error: AppError): string {
    const messages: Record<ErrorType, string> = {
      network: 'Connection Error',
      auth: 'Authentication Required',
      validation: 'Invalid Input',
      permission: 'Permission Denied',
      'not-found': 'Not Found',
      'rate-limit': 'Rate Limit Exceeded',
      generation: 'Generation Failed',
      storage: 'Storage Error',
      unknown: 'Something Went Wrong',
    };

    return messages[error.type] || messages.unknown;
  }

  /**
   * Get error description
   */
  private static getErrorDescription(error: AppError): string {
    const descriptions: Record<ErrorType, string> = {
      network: 'Please check your internet connection and try again',
      auth: 'Please sign in to continue',
      validation: 'Please check your input and try again',
      permission: "You don't have permission to perform this action",
      'not-found': 'The requested resource could not be found',
      'rate-limit': 'Please wait a moment before trying again',
      generation: 'Failed to generate image. Please try again',
      storage: 'Failed to upload or download file',
      unknown: 'An unexpected error occurred',
    };

    return error.message || descriptions[error.type] || descriptions.unknown;
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: AppError): boolean {
    const recoverableTypes: ErrorType[] = ['network', 'rate-limit', 'generation'];
    return recoverableTypes.includes(error.type);
  }

  /**
   * Get retry delay for recoverable errors
   */
  static getRetryDelay(error: AppError, attempt: number): number {
    if (!this.isRecoverable(error)) return 0;

    const baseDelay = error.type === 'rate-limit' ? 5000 : 2000;
    return baseDelay * Math.pow(2, attempt); // Exponential backoff
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  context?: string
): Promise<T> {
  let lastError: AppError | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = ErrorHandler['parseError'](error);
      lastError = appError;

      if (attempt < maxRetries - 1 && ErrorHandler.isRecoverable(appError)) {
        const delay = ErrorHandler.getRetryDelay(appError, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  ErrorHandler.handle(lastError!, context);
  throw lastError;
}
