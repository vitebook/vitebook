<script setup lang="ts">
import NavbarTitle from './NavbarTitle.vue';
import NavLinks from './NavLinks.vue';
</script>

<template>
  <header class="navbar">
    <div class="navbar__container">
      <slot name="start" />

      <NavbarTitle />

      <div class="flex-grow" />

      <NavLinks />

      <slot name="end" />
    </div>
  </header>
</template>

<style>
.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  width: 100vw;
  z-index: var(--vbk--navbar-z-index);
  height: var(--vbk--navbar-height);
  background-color: var(--vbk--navbar-bg-color);
  box-shadow: var(--vbk--elevation-small);
}

.navbar__container {
  width: 100%;
  height: var(--vbk--navbar-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* @see https://css-tricks.com/elegant-fix-jumping-scrollbar-issue/ */
  padding-right: calc(calc(100vw - 100%) + 1.35rem);
}

.navbar__links {
  display: none;
}

@media (min-width: 992px) {
  .navbar__links {
    display: block;
  }

  .navbar__container {
    padding-left: 1.25rem;
  }
}

/** No mobile styles because a nav item is a sidebar item <992px. **/

@media (hover: hover) and (min-width: 992px) {
  .nav-link:hover {
    text-decoration: none;
  }

  .nav-item:hover {
    color: var(--vbk--nav-item-hover-color);
    background-color: var(--vbk--nav-item-hover-bg-color);
  }

  .nav-link:hover > .nav-link__text {
    color: var(--vbk--nav-item-hover-color);
    border-bottom: var(--vbk--nav-link-hover-border);
  }
}

@media (min-width: 992px) {
  .nav-item {
    color: var(--vbk--nav-item-color);
    background-color: var(--vbk--nav-item-bg-color);
  }

  .navbar__links__list {
    flex-direction: row;
    align-items: center;
  }

  .nav-link,
  .nav-item > button {
    display: flex;
    align-items: center;
    font-size: 1rem;
    border: 0;
    font-weight: 500;
    line-height: 1.4;
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0;
    color: var(--vbk--nav-item-color);
    white-space: nowrap;
    text-decoration: none;
    width: 100%;
    cursor: pointer;
    text-align: left;
    background-color: transparent;
  }

  .nav-link.active .nav-link__text {
    color: var(--vbk--nav-link-active-color);
    background-color: var(--vbk--nav-link-active-bg-color);
    border-bottom: var(--vbk--nav-link-active-border);
    transition: border-color var(--vbk--color-transition-duration)
      var(--vbk--color-transition-timing);
  }
}
</style>
