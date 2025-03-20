export abstract class HttpError extends Error {
  constructor(
    name: string,
    public statusCode: number,
    public message: string,
    public errorCode?: number,
    public payload?: any,
  ) {
    super(message);
    this.name = name;
    this.errorCode = errorCode;
  }

  toJSON() {
    if (this.errorCode != null) {
      return {
        statusCode: this.statusCode,
        error: this.name,
        message: this.message,
        errorCode: this.errorCode,
        payload: this.payload,
      };
    } else {
      return {
        statusCode: this.statusCode,
        error: this.name,
        message: this.message,
      };
    }
  }
}
