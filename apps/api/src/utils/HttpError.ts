export class HttpError extends Error {
  StatusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.StatusCode = statusCode;
  }
}
