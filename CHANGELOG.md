# [0.10.0](https://github.com/vitebook/vitebook/compare/v0.9.0...v0.10.0) (2021-11-16)

### Bug Fixes

- **client:** tabs with `groupId` not setting default value ([a029ae0](https://github.com/vitebook/vitebook/commit/a029ae0e3af605c0447953c7d003291676dde0e1))
- **create:** add `// [@ts-check](https://github.com/ts-check)` to non-ts config files ([d5e915e](https://github.com/vitebook/vitebook/commit/d5e915e4f45fe7f8b0a692f358571f1064300105))
- increase tabs margin to `2rem` from `1.15rem` ([c476d56](https://github.com/vitebook/vitebook/commit/c476d56fb2f281cff977eef64e312372c1a6a5e2))
- remove potentially unused imports from main exports ([c431a3f](https://github.com/vitebook/vitebook/commit/c431a3f0ea7ec07edf69e356091de5912abc4ed2))
- **theme-default:** focus box shadow missing from prev/next md links ([579c85c](https://github.com/vitebook/vitebook/commit/579c85c51ce03ba28ced2d46f874577ad31f7192))
- **theme-default:** md toc issues when last header is at page bottom ([3ee5166](https://github.com/vitebook/vitebook/commit/3ee51664b0c9ed569d94898e7d81ab5d90a302f4))

### Features

- **client:** optimize svelte markdown files using static analysis ([43a223f](https://github.com/vitebook/vitebook/commit/43a223f05fdb3f47fd174459db16b605cbb5b4e3))

# [0.9.0](https://github.com/vitebook/vitebook/compare/v0.8.3...v0.9.0) (2021-11-15)

### Bug Fixes

- **theme-default:** initialize dark mode in production correctly ([e14ff6e](https://github.com/vitebook/vitebook/commit/e14ff6ec9f4a171e2c3cc0bc4707cdb6dc50e7f0))
- **theme-default:** no active header links on mobile ([60612be](https://github.com/vitebook/vitebook/commit/60612be57c5a23a0ebbc37a899e35f0278a8eeac))

### Features

- new `<Tabs />` component ([76e9f2a](https://github.com/vitebook/vitebook/commit/76e9f2a3602bf134e564f1d62a5356fe4812c53d))

## [0.8.3](https://github.com/vitebook/vitebook/compare/v0.8.2...v0.8.3) (2021-11-11)

### Bug Fixes

- **client:** improve hash routing ([84d653e](https://github.com/vitebook/vitebook/commit/84d653ece35bb1d36f7d5ff7b34df6a57302d8b8))
- **theme-default:** body scrolling broken on larger devices ([ba15d3a](https://github.com/vitebook/vitebook/commit/ba15d3aa77022beb1970ba0b89669e6394630629))
- **theme-default:** make sure body bg-color matches theme ([3345438](https://github.com/vitebook/vitebook/commit/3345438dbe1c5d371b334f1a31d9253539664773))
- **theme-default:** prevent light/dark theme flash on initial load (2) ([9987096](https://github.com/vitebook/vitebook/commit/99870961ea98366bd2e49fc90a8b51586e32b440))
- **theme-default:** prevent page/sidebar sliding left/right on touch ([f12684e](https://github.com/vitebook/vitebook/commit/f12684e22e5820b8d33488fceda662aada66ef15))
- **theme-default:** prevent sidebar shifting up on short md pages ([e2f0b1c](https://github.com/vitebook/vitebook/commit/e2f0b1ce6223e589b4394414b47bd2c80a1e69cc))
- **theme-default:** prevent taps on mobile going through scrim ([e5597cf](https://github.com/vitebook/vitebook/commit/e5597cfc457c47f51add511b825f24b44ac6afc8))

## [0.8.2](https://github.com/vitebook/vitebook/compare/v0.8.1...v0.8.2) (2021-11-10)

### Bug Fixes

- **theme-default:** ensure `header-anchor` is visible on smaller devices ([5883ced](https://github.com/vitebook/vitebook/commit/5883ced89245ce7ba5b7ed203831a3a3d2ab3701))
- **theme-default:** improve prev/next links on mobile ([cafca73](https://github.com/vitebook/vitebook/commit/cafca735072b6c282d6096dcaf30d8bdcf8ea510))
- **theme-default:** prevent `undefined` showing while repo icon loading ([081691e](https://github.com/vitebook/vitebook/commit/081691e9e5620d8ad3440e67df1e45cb50c75801))
- **theme-default:** prevent light/dark theme flash on initial load ([4eb2df8](https://github.com/vitebook/vitebook/commit/4eb2df88bf0f6d79698ecbd583a519a8cf27455e))
- **theme-default:** set active hashes only after user scrolls ([4e02e19](https://github.com/vitebook/vitebook/commit/4e02e19c821328180170fe9198ab44a7a640dbef))

## [0.8.1](https://github.com/vitebook/vitebook/compare/v0.8.0...v0.8.1) (2021-11-10)

### Bug Fixes

- **core:** `cssCodeSplit` breaking prod builds ([6d006cf](https://github.com/vitebook/vitebook/commit/6d006cf617810698569ea73f02f87d4676c05196))

# [0.8.0](https://github.com/vitebook/vitebook/compare/v0.7.1...v0.8.0) (2021-11-10)

### Features

- render preload directives for svelte/vue ssr rendered components ([7a5db2b](https://github.com/vitebook/vitebook/commit/7a5db2b7acd78222f3ba5ee00c6f61f6014a7228))

## [0.7.1](https://github.com/vitebook/vitebook/compare/v0.7.0...v0.7.1) (2021-11-10)

### Bug Fixes

- downgrade `vite` to `2.7.0-beta.1` ([3a50dd0](https://github.com/vitebook/vitebook/commit/3a50dd0999b9a0073f2db28732622d6ff5225b30))

# [0.7.0](https://github.com/vitebook/vitebook/compare/v0.6.1...v0.7.0) (2021-11-10)

### Bug Fixes

- **core:** duplicate entry chunk preload tags ([96607d3](https://github.com/vitebook/vitebook/commit/96607d32270cf4b7f0fef796a993bda11332cc1d))
- **core:** social tags being rendered incorrectly ([110dc94](https://github.com/vitebook/vitebook/commit/110dc944dc1c3925c2b66d3b68bd8638484d8deb))

### Features

- bump `vite` to `2.7.0-beta.3` ([b9730d9](https://github.com/vitebook/vitebook/commit/b9730d9d068b988197d048d0af6de8eebccc0a8b))
- **core:** split `svelte` internals into separate chunk ([4edbd64](https://github.com/vitebook/vitebook/commit/4edbd645d59ea0e309ed8a364262dae0f1a3c1d6))
- **core:** tidy up css/js chunk file names ([d6af983](https://github.com/vitebook/vitebook/commit/d6af9830d0c46797f82061aa8716e441b0ed3474))

## [0.6.1](https://github.com/vitebook/vitebook/compare/v0.6.0...v0.6.1) (2021-11-10)

### Bug Fixes

- **theme-default:** `MarkdownFloatingToc` not found in CI due to casing ([89d1a05](https://github.com/vitebook/vitebook/commit/89d1a05f4562654cb5202186019ac656301fcd04))

# [0.6.0](https://github.com/vitebook/vitebook/compare/v0.5.0...v0.6.0) (2021-11-09)

### Bug Fixes

- **client:** emoji in url hash not working ([8ea7021](https://github.com/vitebook/vitebook/commit/8ea702101530f071882483b051de1c4f8c85bfb3))
- hmr not working with vue/svelte markdown ([41d5751](https://github.com/vitebook/vitebook/commit/41d5751e278ecbd7676cdab0cdcffbc9ac834317))
- **markdown:** comments are stripped out breaking svelte templates ([5c96b08](https://github.com/vitebook/vitebook/commit/5c96b08346f322da24234a252e283ff178871ccb))
- **theme-default:** add default list style ([c06f15e](https://github.com/vitebook/vitebook/commit/c06f15ef8ca8724a1fec84284ca80ca4cf10cc17))
- **theme-default:** multi-sidebar config not resolving paths correctly ([066663b](https://github.com/vitebook/vitebook/commit/066663baa285a05d72c372d3169640bdb283d998))
- **theme-default:** remove padding on markdown container above `1400px` ([701b9d4](https://github.com/vitebook/vitebook/commit/701b9d4c88f3ade7e1866ea2140d4278df23c100))
- **theme-default:** sidebar body should scroll under header ([b1f71f2](https://github.com/vitebook/vitebook/commit/b1f71f2d8ee4e8110285ec0d7bc4ca726bb022b4))
- **theme-default:** sidebar category item should not be focusable ([e50abfd](https://github.com/vitebook/vitebook/commit/e50abfdd0e7e8869691b62fc99e1f05b6de576e2))

### Features

- bump `svelte` to `3.44.1` ([2fc5990](https://github.com/vitebook/vitebook/commit/2fc5990e5d9728a59019ec4d95956edf5af2f54b))
- **core:** allow pages to be sorted via `[\d]` file name prefix ([7882313](https://github.com/vitebook/vitebook/commit/7882313bf988ca311d84c5f5f2caa5cfd2708638))
- **theme-default:** add links for repo and socials in navbar/sidebar ([5d8d8bc](https://github.com/vitebook/vitebook/commit/5d8d8bc6618c0a1f4a677a68b0944af7f82fbb0c))
- **theme-default:** enable different sidebar styles based on path ([2d43b90](https://github.com/vitebook/vitebook/commit/2d43b90f9cdf6f276823fce564cd54f076ac446e))
- **theme-default:** normalize internal link extensions to `.html` ([0142045](https://github.com/vitebook/vitebook/commit/0142045bea49331384c876da587fe4b10a84559c))

# [0.5.0](https://github.com/vitebook/vitebook/compare/v0.4.1...v0.5.0) (2021-11-05)

### Features

- **create:** new `custom` theme which replaces old `blank` theme ([0807098](https://github.com/vitebook/vitebook/commit/08070980ab822daeeecab1751a3d967c65216414))

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
