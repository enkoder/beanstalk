export class HttpError extends Error {
  private statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorResponse(status: number, msg: string) {
  // @ts-ignore
  return Response.json(
    {
      success: false,
      errors: msg,
      status: status,
    },
    {
      status: status,
    },
  );
}
