/** a function representing an offscreen command  */
export type CommandFn<T, R> = (data: T) => R | Promise<R>;

/** a type to represent all the offscreen commands */
export interface CommandRepo<T, R> {
  [key: string]: CommandFn<T, R>;
}
