export type ApiErrorCode =
  | "QUOTE_EXPIRED"
  | "INSUFFICIENT_FUNDS"
  | "NOT_IMPLEMENTED";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
