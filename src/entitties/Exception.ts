export class Exception {
  public error: boolean;
  public message: string;
  constructor(public code: number, message: string) {
    this.message = message;
    this.error = true;
    this.code = code;
  }
}
