
export class ApiError extends Error {
  constructor(message, status, data) {
    super(typeof message === "string" ? message : JSON.stringify(message));
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}