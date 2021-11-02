import { getIdName } from './utils';

export async function compileHTML(source: string, id: string): Promise<string> {
  const { compileTemplate } = await import('@vue/compiler-sfc');

  const name = getIdName(id);

  let { code } = compileTemplate({
    source,
    id,
    filename: id,
  });

  code = code.replace(/^export /g, '');
  code += '\n\nexport default { name: ' + `'${name}',` + ' render }';

  return code;
}
