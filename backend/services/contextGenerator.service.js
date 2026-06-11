const generate = (tickets) => {
  const blocks = tickets.map((ticket) => {
    const assignee = ticket.assignee ?? 'Sin asignar';
    return [
      `## [${ticket.key}] ${ticket.summary}`,
      `**Tipo:** ${ticket.type}`,
      `**Status:** ${ticket.status}`,
      `**Asignado:** ${assignee}`,
      '',
      '### Descripción',
      ticket.description || 'Sin descripción.',
      '',
      '---',
    ].join('\n');
  });

  return blocks.join('\n\n');
};

module.exports = { generate };
