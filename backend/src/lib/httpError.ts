export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export class UpstreamError extends HttpError {
  constructor(
    message: string,
    public readonly upstream: string,
    details?: unknown,
  ) {
    super(502, message, details);
  }
}
