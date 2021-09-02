import { logger } from '../../utils/logger.js';
import type { BuildCommandArgs } from '../args.js';

export async function buildCommand(args: BuildCommandArgs): Promise<void> {
  throw logger.createError('`build` command not implemented');
}
