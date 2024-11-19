import { exec } from 'child_process';

export const handleShutdown = () => {
  console.log('Shutting down API...');

  exec('docker compose down', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing docker compose down: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  setTimeout(() => {
    process.exit(0);
  }, 3000);
};
