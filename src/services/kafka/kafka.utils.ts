import { Logger, LogLevel } from '@nestjs/common';
import { LogEntry, logLevel as LogLevelKafka } from 'kafkajs';

export function logCreatorKafka(logLevelKafka: LogLevelKafka, logger: Logger) {
  let logLevel: LogLevel = 'log';

  switch (logLevelKafka) {
    case LogLevelKafka.ERROR:
      logLevel = 'error';
      break;
    case LogLevelKafka.INFO:
      logLevel = 'log';
      break;
    case LogLevelKafka.DEBUG:
      logLevel = 'debug';
      break;
    case LogLevelKafka.NOTHING:
      logLevel = 'verbose';
      break;
    case LogLevelKafka.WARN:
      logLevel = 'warn';
      break;
  }

  return (entry: LogEntry) => {
    logger[logLevel](`${entry.namespace}: ${entry.log.message}`);
  };
}
