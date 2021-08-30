import kleur from 'kleur';
import ora from 'ora';

export const LoggerColor = Object.freeze({
  Info: kleur.cyan,
  Tip: kleur.magenta,
  Success: kleur.green,
  Warn: kleur.yellow,
  Error: kleur.red
});

export const LoggerIcon = Object.freeze({
  Info: 'ℹ️',
  Tip: '💡',
  Success: '✅',
  Warn: '⚠️ ',
  Error: '🚨'
});

export const info = (...args: unknown[]): void => {
  console.log(...args);
};

export const formatInfoMsg = (message: string): string =>
  LoggerColor.Info(`${LoggerIcon.Info} ${message}`);

export const tip = (...args: unknown[]): void => {
  console.log(...args);
};

export const formatTipMsg = (message: string): string =>
  LoggerColor.Tip(`${LoggerIcon.Tip} ${message}`);

export const success = (...args: unknown[]): void => {
  console.log(...args);
};

export const formatSuccessMsg = (message: string): string =>
  LoggerColor.Success(`${LoggerIcon.Success} ${message}`);

export const warn = (...args: unknown[]): void => {
  console.warn(...args);
};

export const formatWarnMsg = (message: string): string =>
  LoggerColor.Warn(`${LoggerIcon.Warn} ${message}`);

export const error = (...args: unknown[]): void => {
  console.error(...args);
};

export const formatErrorMsg = (message: string): string =>
  LoggerColor.Error(`${LoggerIcon.Error} ${message}`);

export const createError = (message?: string | undefined): Error => {
  error(message);
  return new Error(message);
};

export const logger = {
  warn,
  tip,
  success,
  info,
  error,
  createError,
  formatWarnMsg,
  formatTipMsg,
  formatSuccessMsg,
  formatInfoMsg,
  formatErrorMsg
};

export const withSpinner =
  (message: string) =>
  async <T>(target: () => Promise<T>): Promise<T> => {
    if (process.env.DEBUG) {
      return target();
    }

    const spinner = ora();

    try {
      spinner.start(message);
      const result = await target();
      spinner.succeed(formatSuccessMsg(message));
      return result;
    } catch (e) {
      spinner.fail(formatErrorMsg(message));
      throw e;
    }
  };
