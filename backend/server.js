const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { pino } = require('pino');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports = app;
