<script setup lang="ts">
import SidebarListItem from './SidebarListItem';
import { useSidebarItems } from './useSidebar';

const items = useSidebarItems();
</script>

<template>
  <nav class="sidebar__links">
    <ul v-if="items.length > 0" class="sidebar__links__list">
      <SidebarListItem
        v-for="(item, i) of items"
        :key="i"
        :item="item"
        class="sidebar__links__list-item"
      />
    </ul>
  </nav>
</template>

<style>
.sidebar__body ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.sidebar__body li {
  display: block;
  min-width: var(--vbk--sidebar-item-min-width);
  border-radius: var(--vbk--sidebar-item-border-radius);
  white-space: nowrap;
}

.sidebar__body a,
.sidebar__body button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--vbk--sidebar-item-padding);
  border: 0;
  font-size: var(--vbk--sidebar-item-font-size);
  margin-top: var(--vbk--sidebar-item-spacing);
  font-weight: var(--vbk--sidebar-item-font-weight);
  border-radius: var(--vbk--sidebar-item-border-radius);
  color: var(--vbk--sidebar-item-color);
  white-space: nowrap;
  text-decoration: none;
  background-color: var(--vbk--sidebar-item-bg-color);
  text-align: left;
  cursor: pointer;
  line-height: var(--vbk--sidebar-item-line-height);
}

.sidebar__body svg {
  margin-right: 0.5rem;
}

.sidebar__body .nav-link:not(.external) .nav-link__text,
.sidebar__body .sidebar-link:not(.external) .sidebar-link__text {
  display: flex;
  align-items: center;
}

.sidebar__body .link.active {
  color: var(--vbk--sidebar-item-active-color);
  background-color: var(--vbk--sidebar-item-active-bg-color);
}

.sidebar__body a,
.sidebar__body button {
  padding-left: 0.5rem;
}

.sidebar__body .nav-item__menu-button > svg {
  margin-top: -0.2rem;
}

@media (hover: hover) and (pointer: fine) {
  .sidebar__body a:hover,
  .sidebar__body button:hover {
    color: var(--vbk--sidebar-item-hover-color);
    background-color: var(--vbk--sidebar-item-hover-bg-color);
  }
}
</style>
