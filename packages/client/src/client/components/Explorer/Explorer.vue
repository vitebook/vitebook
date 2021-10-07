<script setup lang="ts">
import {
  defineAsyncComponent,
  FunctionalComponent,
  h,
  KeepAlive,
  VNode
} from 'vue';
import { RouterLink } from 'vue-router';

import {
  ExplorerItem,
  isExplorerGroup,
  useExplorerItems
} from './useExplorerItems';

const items = useExplorerItems();

const isDev = import.meta.env.DEV;

function getIcon(type = '') {
  type = type.replace(/^\w+:/, '');

  const base = './icons/';

  switch (type) {
    case 'jsx':
      return base + 'js.svg';
    case 'tsx':
      return base + 'ts.svg';
    case 'png':
    case 'jpeg':
      return base + 'image.svg';
    case 'mp4':
      return base + 'video.svg';
  }

  if (/^(md|vue|svelte|js|ts|html|svg)$/.test(type)) {
    return base + `${type}.svg`;
  } else {
    return base + 'file.svg';
  }
}

function createTree(item: ExplorerItem): VNode {
  if (!isExplorerGroup(item)) {
    const icon = defineAsyncComponent(
      () => import(/* @vite-ignore */ `${getIcon(item.type)}?raw&vue`)
    );

    return h(
      'li',
      null,
      h(
        RouterLink,
        {
          to: item.link,
          class: item.type && `type-${item.type}`
        },
        {
          default: () => [
            h(KeepAlive, null, { default: () => h(icon) }),
            item.text
          ]
        }
      )
    );
  }

  return h('ul', null, [
    h('span', null, `${item.text}/`),
    ...item.children.map((child) => createTree(child))
  ]);
}

const ExplorerListItem: FunctionalComponent<{
  item: ExplorerItem;
}> = ({ item }) => createTree(item);
</script>

<template>
  <div class="explorer">
    <header>
      Pages Explorer
      <p v-if="isDev">This page is shown when no index file is present.</p>
    </header>
    <main>
      <ul>
        <span>/</span>
        <ExplorerListItem v-for="(item, i) of items" :key="i" :item="item" />
      </ul>
    </main>
    <footer v-if="isDev">
      You can turn this page off by setting `explorer: false` in
      `.vitebook/theme/index`
    </footer>
  </div>
</template>

<style scoped>
.explorer {
  width: 100vw;
  height: 100vh;
}

header {
  width: 100%;
  padding: 16px;
  font-size: 32px;
}

p {
  margin-top: 1rem;
  color: #999;
  font-size: 16px;
}

main {
  width: auto;
  display: inline-block;
  padding: 0 8px;
}

footer {
  color: #999;
  font-size: 14px;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  padding: 2rem;
}

:deep(ul) {
  margin-left: 16px;
  list-style: none;
}

:deep(ul > span) {
  display: inline-block;
  margin: 8px 0;
  font-size: 20px;
  font-weight: bold;
}

:deep(li) {
  padding: 4px 0;
}

:deep(a) {
  margin-left: 8px;
  display: flex;
  align-items: center;
  font-size: 18px;
  color: hsl(0, 0%, 12.3%);
  text-decoration: underline;
}

:deep(a > svg) {
  font-size: 13px;
  margin-right: 4px;
}

:deep(a:hover) {
  color: #610fe6;
}
</style>
