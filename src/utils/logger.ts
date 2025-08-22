/**
 * Development Logger - Replaces console statements to avoid ESLint violations
 * Only logs in development environment
 */

interface Logger {
  log: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  info: (message?: any, ...optionalParams: any[]) => void;
  debug: (message?: any, ...optionalParams: any[]) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger: Logger = {
  log: (message?: any, ...optionalParams: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(message, ...optionalParams);
    }
  },
  
  warn: (message?: any, ...optionalParams: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(message, ...optionalParams);
    }
  },
  
  error: (message?: any, ...optionalParams: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(message, ...optionalParams);
    }
  },
  
  info: (message?: any, ...optionalParams: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(message, ...optionalParams);
    }
  },
  
  debug: (message?: any, ...optionalParams: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(message, ...optionalParams);
    }
  }
};

export default logger;