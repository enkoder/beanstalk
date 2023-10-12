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
