export function formatError(err: unknown): string {
  if (!(err instanceof Error)) return 'Error desconocido';

  try {
    const json = JSON.parse(err.message);
    return json.message ?? err.message;
  } catch {
    return err.message;
  }
}
