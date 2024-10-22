/* eslint-disable @typescript-eslint/no-unused-vars */
import type { UnknownType } from '@/src/interfaces';

export class Task<T, R = UnknownType> {
  constructor(readonly name: string) {}

  async do(data: T): Promise<R> {
    return null as R;
  }
}

export type TaskChain<A extends Task<T>, T = UnknownType> = (new () => Task<T>)[];
export type TaskDoArguments<T extends Task<UnknownType>> = T extends Task<infer U> ? Parameters<T['do']> : never;
export type TaskDoReturnType<T extends Task<UnknownType>> = T extends Task<infer U> ? ReturnType<T['do']> : never;
