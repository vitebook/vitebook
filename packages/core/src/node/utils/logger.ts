import kleur from 'kleur';
import ora from 'ora';

export const LoggerColor = Object.freeze({
  Info: kleur.cyan,
  Tip: kleur.magenta,
  Success: kleur.green,
  Warn: kleur.yellow,
  Error: kleur.red,
});

export const LoggerIcon = Object.freeze({
  Info: 'ℹ️',
  Tip: '💡',
  Success: '✅',
  Warn: '⚠️ ',
  Error: '🚨',
});

export const formatInfoMsg = (message: string): string =>
  LoggerColor.Info(`${LoggerIcon.Info} ${message}`);

export const formatTipMsg = (message: string): string =>
  LoggerColor.Tip(`${LoggerIcon.Tip} ${message}`);

export const formatSuccessMsg = (message: string): string =>
  LoggerColor.Success(`${LoggerIcon.Success} ${message}`);

export const formatWarnMsg = (message: string): string =>
  LoggerColor.Warn(`${LoggerIcon.Warn} ${message}`);

export const formatErrorMsg = (message: string): string =>
  LoggerColor.Error(`${LoggerIcon.Error} ${message}`);

export const createError = (message?: string | undefined): Error => {
  return new Error(formatErrorMsg(message ?? ''));
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
      spinner.stopAndPersist({
        symbol: '',
        text: formatSuccessMsg(message),
      });
      return result;
    } catch (e) {
      spinner.stopAndPersist({
        symbol: '',
        text: formatErrorMsg(message),
      });
      throw e;
    }
  };

export const logger = {
  warn: console.warn,
  tip: console.log,
  success: console.log,
  info: console.log,
  error: console.error,
  createError,
  formatWarnMsg,
  formatTipMsg,
  formatSuccessMsg,
  formatInfoMsg,
  formatErrorMsg,
  withSpinner,
};
