import { logger } from '../../utils/logger.js';
import type { ServeCommandArgs } from '../args.js';

export async function serveCommand(args: ServeCommandArgs): Promise<void> {
  throw logger.createError('`serve` command not implemented');
}
