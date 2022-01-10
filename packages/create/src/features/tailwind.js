// @ts-check

/**
 * @param {import('../ProjectBuilder').ProjectBuilder} builder
 */
export function addTailwindFeature(builder) {
  if (!builder.hasFeature('tailwind')) return;

  builder.pkg.addDependency('tailwindcss', '^3.0.0', { dev: true });
  builder.pkg.addDependency('postcss', '^8.0.0', { dev: true });
  builder.pkg.addDependency('autoprefixer', '^10.0.0', { dev: true });

  builder.dirs.dest.root.writeFile(
    'tailwind.config.cjs',
    getTailwindConfig(builder),
  );

  builder.dirs.dest.root.writeFile('postcss.config.cjs', getPostCssConfig());

  builder.dirs.dest.config.writeFile(
    'global.css',
    `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
  );
}

function getPostCssConfig() {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

/**
 * @param {import('../ProjectBuilder').ProjectBuilder} builder
 */
function getTailwindConfig(builder) {
  function getExt() {
    if (builder.framework === 'svelte') return 'svelte';
    if (builder.framework === 'vue') return 'vue';
    return builder.hasFeature('typescript') ? 'tsx' : 'jsx';
  }

  const ext = getExt();

  const content = [
    `'./src/**/*.${ext}'`,
    `'./src/**/*.story.${ext}'`,
    `'./.vitebook/App.${ext}'`,
  ];

  return `module.exports = {
  darkMode: 'class',
  content: [
    ${content.join(',\n    ')}
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}
