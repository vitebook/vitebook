import {
  type Router,
  routerContextKey,
  ssrContextKey,
  type VitebookSSRContext,
} from '@vitebook/core';
import { getContext } from 'svelte';

export function getRouter() {
  return getContext(routerContextKey) as Router;
}

export function getSSRContext() {
  return getContext(ssrContextKey) as VitebookSSRContext;
}
