const { generate } = require('../services/contextGenerator.service');

describe('contextGenerator.service', () => {
  it('retorna string vacío cuando el array de tickets está vacío', () => {
    expect(generate([])).toBe('');
  });

  it('genera el bloque markdown correcto con todos los campos', () => {
    const ticket = {
      key: 'PROJ-1',
      summary: 'Implementar login',
      type: 'Story',
      status: 'In Progress',
      assignee: 'Juan Pérez',
      description: 'El usuario debe poder iniciar sesión con email y contraseña.',
    };

    const result = generate([ticket]);

    expect(result).toContain('## [PROJ-1] Implementar login');
    expect(result).toContain('**Tipo:** Story');
    expect(result).toContain('**Status:** In Progress');
    expect(result).toContain('**Asignado:** Juan Pérez');
    expect(result).toContain('### Descripción');
    expect(result).toContain('El usuario debe poder iniciar sesión con email y contraseña.');
    expect(result).toContain('---');
  });

  it('muestra "Sin asignar" cuando assignee es null', () => {
    const ticket = {
      key: 'PROJ-2',
      summary: 'Ticket sin asignar',
      type: 'Bug',
      status: 'Open',
      assignee: null,
      description: 'Descripción del bug.',
    };

    const result = generate([ticket]);

    expect(result).toContain('**Asignado:** Sin asignar');
  });

  it('separa los bloques con doble salto de línea cuando hay múltiples tickets', () => {
    const ticket1 = {
      key: 'PROJ-1',
      summary: 'Ticket uno',
      type: 'Story',
      status: 'Done',
      assignee: 'Ana',
      description: 'Descripción uno.',
    };

    const ticket2 = {
      key: 'PROJ-2',
      summary: 'Ticket dos',
      type: 'Task',
      status: 'Open',
      assignee: 'Luis',
      description: 'Descripción dos.',
    };

    const result = generate([ticket1, ticket2]);

    expect(result).toContain('## [PROJ-1] Ticket uno');
    expect(result).toContain('## [PROJ-2] Ticket dos');

    expect(result).toContain('---\n\n## [PROJ-2]');
  });
});
