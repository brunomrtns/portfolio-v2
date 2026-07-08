import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { AppError } from '@portfolio/shared';

// ── Error handler plugin ──────────────────────────────────────────────────────
//
// Same pattern as Avesia:
//   ZodError → 400
//   AppError → mapped status
//   unknown  → 500
//
// Error format: { error: { code, message, details? } }

export default fp(async (app) => {
  app.setErrorHandler((err, _request, reply) => {
    // ZodError → 400 validation error
    if (err instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
    }

    // AppError → mapped status code
    if (err instanceof AppError) {
      const body: { error: { code: string; message: string; details?: unknown } } = {
        error: {
          code: err.code,
          message: err.message,
        },
      };
      if (err.details !== undefined) {
        body.error.details = err.details;
      }
      return reply.status(err.statusCode).send(body);
    }

    // Unknown → 500
    app.log.error({ err }, 'Unhandled error');
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
  });
}, {
  name: 'error-handler',
});
