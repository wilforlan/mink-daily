/* eslint-disable @typescript-eslint/no-unused-vars */
import { createError } from './sentry-log';
import { Task, type TaskChain } from './types/task';
import type { UnknownType } from '~interfaces';

export class TaskRunner<A extends TaskChain<Task<U>>, K, U = UnknownType> {
  constructor(public readonly name: string, private readonly taskChain: A) {}

  async run(args: UnknownType) {
    if (this.taskChain.length < 0) {
      throw new Error('empty task chain provided');
    }

    let chainName = 'start';

    try {
      let input: UnknownType = args;
      let output: UnknownType = undefined;
      for (const task of this.taskChain) {
        const instance = new task();
        chainName = instance.name;
        output = await instance.do.call(instance, input);
        input = output;
      }
      return output;
    } catch (e) {
      const taskName = `Error executing task ${this.name}/${chainName}`;
      console.error(taskName);
      createError(`${taskName}: ${(e as Error).message}`);
      console.error(e);
      throw e;
    }
  }
}
