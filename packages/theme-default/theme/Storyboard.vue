<template>
  Vitebook<br />

  <router-view v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
      <!-- TODO: LOADING SPINNER FALLBACK -->
    </Suspense>
  </router-view>
</template>

<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { computed } from 'vue';

import { useSiteConfig } from '../composables/useSiteConfig';
import { useStoryboardPageData } from '../composables/useStoryboardPage';

const siteConfig = useSiteConfig();
const pageData = useStoryboardPageData();

const documentHead = computed(() => {
  console.log(pageData.value);
  console.log(siteConfig.value);

  return {
    //
  };
});

useHead(documentHead);

// useHead({
//   title: computed(() => {
//     let title: string | undefined;

//     const currPage = page.value;

//     if (activeVariant.value) {
//       title = activeVariant.value.name;
//     } else if (currPage) {
//       if (currPage.type === 'story') {
//         title = currPage.story.name;
//       } else if (currPage.type === 'markdown') {
//         // TODO: frontmatter
//         title = undefined;
//       }
//     }

//     // TODO: Append site data title + convert name
//     return title ?? '';
//   }),
//   meta: [
//     {
//       name: `description`,
//       content: computed(() => {
//         let desc: string | undefined;

//         const currPage = page.value;

//         if (activeVariant.value) {
//           desc = activeVariant.value.description;
//         } else if (currPage) {
//           if (currPage.type === 'story') {
//             desc = currPage.story.description;
//           } else if (currPage.type === 'markdown') {
//             // TODO: frontmatter
//             desc = undefined;
//           }
//         }

//         // TODO: Append site data desc + convert name
//         return desc ?? '';
//       })
//     }
//   ]
// });
</script>
