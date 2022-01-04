if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.warn(
    `\n⚠️ \u001b[33mThis repository requires using PNPM as the package manager ` +
      ` for scripts to work properly.\u001b[39m` +
      '\n\n1. Install Volta to automatically manage it by running: \x1b[1mcurl https://get.volta.sh | bash\x1b[0m',
    '\n2. Install PNPM by running: \x1b[1mvolta install pnpm@6\x1b[0m',
    "\n3. Done! Run `pnpm` commands as usual and it'll just work :)",
    '\n\nSee \x1b[1mhttps://volta.sh\x1b[0m for more information.',
    '\n',
  );

  process.exit(1);
}
