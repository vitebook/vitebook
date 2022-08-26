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

const formatInfoTitle = (title: string): string =>
  LoggerColor.Info(`\n${LoggerIcon.Info}  ${title}\n`);

const formatTipTitle = (title: string): string =>
  LoggerColor.Tip(`\n${LoggerIcon.Tip} ${title}\n`);

const formatSuccessTitle = (title: string): string =>
  LoggerColor.Success(`\n${LoggerIcon.Success} ${title}\n`);

const formatWarnTitle = (title: string): string =>
  LoggerColor.Warn(`\n${LoggerIcon.Warn} ${title}\n`);

const formatErrorTitle = (title: string): string =>
  LoggerColor.Error(`\n${LoggerIcon.Error} ${title}\n`);

export const createError = (message?: string | undefined): Error => {
  return new Error(formatErrorTitle(message ?? ''));
};

export const logger = {
  info: (title: string, ...args: unknown[]) => {
    console.info(formatInfoTitle(title), ...args);
  },
  tip: (title: string, ...args: unknown[]) => {
    console.info(formatTipTitle(title), ...args);
  },
  success: (title: string, ...args: unknown[]) => {
    console.info(formatSuccessTitle(title), ...args);
  },
  warn: (title: string, ...args: unknown[]) => {
    console.warn(formatWarnTitle(title), ...args);
  },
  error: (title: string, ...args: unknown[]) => {
    console.error(formatErrorTitle(title), ...args);
  },
  withSpinner:
    (
      pendingTitle: string,
      options: {
        successTitle?: string;
        errorTitle?: string;
        timed?: boolean;
      } = {},
    ) =>
    async <T>(target: () => Promise<T>): Promise<T> => {
      const spinner = ora();
      const successTitle = options.successTitle ?? pendingTitle;
      const errorTitle = options.errorTitle ?? pendingTitle;

      try {
        spinner.start(kleur.bold(`${pendingTitle}...`));

        const startTime = Date.now();
        const result = await target();
        const endTime = ((Date.now() - startTime) / 1000).toFixed(2);

        spinner.stopAndPersist({
          symbol: '',
          text: formatSuccessTitle(
            options.timed
              ? `${successTitle} in ${kleur.underline(`${endTime}s`)}`
              : successTitle,
          ),
        });

        return result;
      } catch (e) {
        spinner.stopAndPersist({
          symbol: '',
          text: formatErrorTitle(errorTitle),
        });
        throw e;
      }
    },
};
