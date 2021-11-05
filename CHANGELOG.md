## [0.4.1](https://github.com/vitebook/vitebook/compare/v0.4.0...v0.4.1) (2021-11-05)

### Bug Fixes

- **core:** drop superfluous `StoryMeta` (use `PageMeta`) ([19c6bc3](https://github.com/vitebook/vitebook/commit/19c6bc39e095eed1b87edcb55dffce70d3530ddd))
- **create:** drop `.story` in include statements (let user decide) ([8a2a042](https://github.com/vitebook/vitebook/commit/8a2a0427065e0e1ca9c7632c929a5876b1d3f5a5))
- **create:** drop `svelte-preprocess` by default (let user decide) ([ee95617](https://github.com/vitebook/vitebook/commit/ee95617e5f6f61b8e3145f6774eadf69099184e7))

# [0.4.0](https://github.com/vitebook/vitebook/compare/v0.3.1...v0.4.0) (2021-11-03)

### Features

- **create:** change `--local` option to `--link` with improved yarn support ([3e5c716](https://github.com/vitebook/vitebook/commit/3e5c716edf9e21aed482a862028a898efb1d7724))
- **theme-default:** sidebar categories + styles `explorer`/`docs` ([eccfc68](https://github.com/vitebook/vitebook/commit/eccfc68d55f504889f69ffaf4a0a7ba5fef306b8))

## [0.3.1](https://github.com/vitebook/vitebook/compare/v0.3.0...v0.3.1) (2021-11-03)

### Bug Fixes

- **create:** `--template` option is not checked ([2bc9e98](https://github.com/vitebook/vitebook/commit/2bc9e98cd5ee638cf89b70f82324fb4ec1d6a02a))
- **preact:** patch `@prefresh/vite` to support new `{ ssr }` option ([4c0bd94](https://github.com/vitebook/vitebook/commit/4c0bd94b8c2ce32fee921ec2661b3994a36c06d0))

# [0.3.0](https://github.com/vitebook/vitebook/compare/v0.2.2...v0.3.0) (2021-11-03)

### Bug Fixes

- **create:** change lib `es2017` to `esnext` ([4e8d8b2](https://github.com/vitebook/vitebook/commit/4e8d8b20ffec8c39f9bed8313e5f123896f68145))
- **create:** invalid regular expression in preact-ts starter ([0d3951f](https://github.com/vitebook/vitebook/commit/0d3951fd03faba1f9dcf8910d77547fe05097382))
- **create:** missing `)` in preact-ts starter ([b1939f0](https://github.com/vitebook/vitebook/commit/b1939f08aabc83993d2a778eca28fe875e3e22cd))
- **create:** simplify include regular expressions ([d1349c6](https://github.com/vitebook/vitebook/commit/d1349c6d487ceb89758097e0a021c86f91b9caff))

### Features

- bump `@prefresh/vite` to `2.2.3` ([10f079f](https://github.com/vitebook/vitebook/commit/10f079f6c6f9758226a44818b1adbe394ea1c2a0))
- bump `@sveltejs/vite-plugin-svelte` to `1.0.0-next.30` ([a4d764b](https://github.com/vitebook/vitebook/commit/a4d764b308655354d3de74c8ee3c79bbd72b4f6c))
- bump `@vitejs/plugin-vue` to `1.10.0-beta.0` ([2487134](https://github.com/vitebook/vitebook/commit/2487134cbae48259bcf9d7c1d050a9eff0da038f))
- bump vite to `2.7.0-beta.1` ([d937115](https://github.com/vitebook/vitebook/commit/d937115057a269a51bc3b04ccf516f84d8617038))

## [0.2.2](https://github.com/vitebook/vitebook/compare/v0.2.1...v0.2.2) (2021-11-03)

### Bug Fixes

- drop unnecessary peer deps ([6be2a33](https://github.com/vitebook/vitebook/commit/6be2a33ce788b7ca561dd69d8959cbc7256fd257))

## [0.2.1](https://github.com/vitebook/vitebook/compare/v0.2.0...v0.2.1) (2021-11-03)

### Features

- we can release on latest since <1.0 ([a9f3dc0](https://github.com/vitebook/vitebook/commit/a9f3dc0ceadd391dd771e24e703034a38c8f6bd9))

# [0.2.0](https://github.com/vitebook/vitebook/compare/v0.1.1...v0.2.0) (2021-11-03)

### Bug Fixes

- resolve prebuild issues ([6e08f38](https://github.com/vitebook/vitebook/commit/6e08f3871e68cbe7e4cc5cedb22cb71db3f13b56))

### Features

- **create:** include `--local` option for using local vitebook packages ([bffb3fb](https://github.com/vitebook/vitebook/commit/bffb3fb7e81ff36e2c4bf0a87a192e8301db4c40))

## [0.1.1](https://github.com/vitebook/vitebook/compare/v0.1.0...v0.1.1) (2021-11-02)

### Bug Fixes

- add theme scope class to prebuilt client builds ([3ef2325](https://github.com/vitebook/vitebook/commit/3ef2325b736b921112ef7517630d03e387adbca4))
- **client:** app cannot find entry file module ([a2b5232](https://github.com/vitebook/vitebook/commit/a2b5232047b9bf719f8c15b8c6f703c4d91a8363))
- **client:** avoid crashing when no route exists ([174f187](https://github.com/vitebook/vitebook/commit/174f1872a154ed7326bdedb787ef459396d8887e))

# [0.1.0](https://github.com/vitebook/vitebook/compare/v0.0.3...v0.1.0) (2021-11-02)

### Bug Fixes

- avoid minification and treeshaking on client builds ([8917335](https://github.com/vitebook/vitebook/commit/891733505c68356876d9242e24fc426236e67033))

### Features

- **core:** print preview server urls ([24473ee](https://github.com/vitebook/vitebook/commit/24473ee61ce3c11f2b49fcd6c99cdce8e8451015))
- **create:** first draft of `npm init vitebook` package ([d1a78d5](https://github.com/vitebook/vitebook/commit/d1a78d51b4336e1afda20f5f27649cb2d875abd8))
- prebuild all packages and includes types ([0cd6212](https://github.com/vitebook/vitebook/commit/0cd621284b4a5dece15671f9172330972589dbb7))

## [0.0.3](https://github.com/vitebook/vitebook/compare/v0.0.2...v0.0.3) (2021-10-28)

### Bug Fixes

- **core:** dev command does not print http urls for dev server ([d4333fe](https://github.com/vitebook/vitebook/commit/d4333fe660e72148aca2f73791399a39411883f8))
- **core:** vite injected browser hash breaking singletons ([0d40957](https://github.com/vitebook/vitebook/commit/0d4095760464665eac84ea4d1a85a9a33b679611))

### Features

- **core:** print vitebook version on build ([bea46c1](https://github.com/vitebook/vitebook/commit/bea46c12cbfa4b71f18e77e1493432e300116cab))

## [0.0.2](https://github.com/vitebook/vitebook/compare/v0.0.1...v0.0.2) (2021-10-28)

### Bug Fixes

- **client:** remove cyclic dependency between client and theme packages ([ac67ab6](https://github.com/vitebook/vitebook/commit/ac67ab6b118a571bd2f038ad2d7aaa5675562a60))
- **core:** vitebook virtual paths breaking due to vite optimizations ([b4fe76c](https://github.com/vitebook/vitebook/commit/b4fe76c5aeadab196ca0ada5797e758706c5ef73))

## 0.0.1 (2021-10-28)

### Features

- initial release ([b8d827c](https://github.com/vitebook/vitebook/commit/b8d827c316096d2f9b9206187d9aa3977bf4ae7e))
