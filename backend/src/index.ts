import { app } from './core/server/app.js';
import { env } from './core/config/env.js';

const MAX_PORT_RETRIES = 10;

function startServer(port: number, retriesLeft = MAX_PORT_RETRIES) {
  const server = app.listen(port, () => {
    console.log(`Horas Sociales API running on http://localhost:${port}`);
    console.log(`Swagger available at http://localhost:${port}/api-docs`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Retrying on port ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    throw error;
  });
}

startServer(env.port);
