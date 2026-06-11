const { z } = require('zod');

const ticketSchema = z.object({
  id: z.string(),
  key: z.string(),
  summary: z.string(),
  description: z.string(),
  status: z.string(),
  type: z.string(),
  assignee: z.string().nullable(),
});

module.exports = { ticketSchema };
