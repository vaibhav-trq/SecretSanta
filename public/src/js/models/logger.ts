/** Debugging class which enables pretty logging by extending it. */
export class Logger {
  /**
   * A wrapper logger to add the class name prior to messages. 
   * 
   * Used in exactly the same way as console.log(...);
   */
  protected LOG(message: any, ...optionalArgs: any[]) {
    console.debug(`${this.constructor.name}: ${message}`, ...optionalArgs);
  }

  protected ASSERT(condition: boolean, message: any) {
    if (!condition) {
      throw new Error(`${this.constructor.name}: ${message}`);
    }
  }
};
