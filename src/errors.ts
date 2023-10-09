export function errorResponse(status: number, msg: string) {
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
