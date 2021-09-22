import { compileHTML } from './compileHTML';

const RAW_SVG_RE = /(\?raw|&raw)/;

export async function compileSVG(source: string, id: string): Promise<string> {
  if (RAW_SVG_RE.test(id)) {
    source = JSON.parse(source.replace('export default', ''));
  }

  return compileHTML(source, id);
}
