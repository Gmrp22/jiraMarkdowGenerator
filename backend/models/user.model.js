const { z } = require('zod');

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(['admin', 'user']),
});

module.exports = { userSchema };
