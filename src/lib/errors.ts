export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Données invalides") {
    super(message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ce dossier n’existe pas") {
    super(message, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Accès non autorisé") {
    super(message, "UNAUTHORIZED");
  }
}

export class DomainError extends AppError {
  constructor(message: string) {
    super(message, "DOMAIN_ERROR");
  }
}

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return { ok: false, error: { code: error.code, message: error.message } };
  }
  return { ok: false, error: { code: "UNKNOWN", message: "Une erreur est survenue" } };
}
