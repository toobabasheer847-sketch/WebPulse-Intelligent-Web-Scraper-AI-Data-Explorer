export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFound(message = 'Resource not found', details = {}) {
  return new AppError(message, 404, 'NOT_FOUND', details);
}

export function unauthorized(message = 'Unauthorized', details = {}) {
  return new AppError(message, 401, 'UNAUTHORIZED', details);
}

export function forbidden(message = 'Forbidden', details = {}) {
  return new AppError(message, 403, 'FORBIDDEN', details);
}

export function badRequest(message = 'Bad request', details = {}) {
  return new AppError(message, 400, 'BAD_REQUEST', details);
}
