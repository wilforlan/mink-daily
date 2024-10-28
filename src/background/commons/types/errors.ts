import type { UnknownType } from '@/src/interfaces';

export class NoCreditLeftError extends Error {
  constructor(private readonly userId: string) {
    super(`No credits left to record meeting for ${userId}`);
  }
}

export class EndTaskWithError extends Error {
  constructor(private readonly reason: Error) {
    super(reason.message);
  }
}

export interface TaskWarningMeta {
  id: string;
  message: string;
  meta: UnknownType;
}
export class TaskWarning extends Error {
  constructor(public readonly warningId: string, public readonly params: TaskWarningMeta) {
    super(params.message);
  }
}

export class ApiError extends Error {
  constructor(message: string, public readonly apiCode: number) {
    super(message);
  }
}

export class AuthError extends Error {
  constructor(private readonly reason: Error) {
    super(reason.message);
  }
}

export class QueueDegradationError extends Error {
  constructor() {
    super('Queue performance degraded, restarting queue');
  }
}

export class PriorityChangeError extends Error {
  constructor() {
    super(`moving priority down for meeting`);
  }
}
