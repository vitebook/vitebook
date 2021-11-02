import type { HeadAttrsConfig, HeadConfig } from '../types/HeadConfig';

/**
 * Resolve identifier of a tag, to avoid duplicated tags in `<head>`.
 */
export const resolveHeadIdentifier = ([
  tag,
  attrs,
  content,
]: HeadConfig): string => {
  // avoid duplicated `<meta>` with same `name`
  if (tag === 'meta' && attrs.name) {
    return `${tag}.${attrs.name}`;
  }

  // there should be only one `<title>` or `<base>`
  if (['title', 'base'].includes(tag)) {
    return tag;
  }

  // avoid duplicated `<template>` with same `id`
  if (tag === 'template' && attrs.id) {
    return `${tag}.${attrs.id}`;
  }

  return JSON.stringify([tag, attrs, content]);
};

/**
 * Dedupe head config with identifier. Items that appear earlier have higher priority.
 */
export const dedupeHead = (head: HeadConfig[]): HeadConfig[] => {
  const identifierSet = new Set<string>();
  const result: HeadConfig[] = [];

  head.forEach((item) => {
    const identifier = resolveHeadIdentifier(item);
    if (!identifierSet.has(identifier)) {
      identifierSet.add(identifier);
      result.push(item);
    }
  });

  return result;
};

/**
 * Render head attrs config to string
 */
export const renderHeadAttrs = (attrs: HeadAttrsConfig): string =>
  Object.entries(attrs)
    .filter((item): item is [string, string | true] => item[1] !== false)
    .map(([key, value]) =>
      value === true ? ` ${key}` : ` ${key}="${attrs[key]}"`,
    )
    .join('');

/**
 * Render head config to string.
 */
export const renderHead = ([
  tag,
  attrs,
  innerHTML = '',
]: HeadConfig): string => {
  const openTag = `<${tag}${renderHeadAttrs(attrs)}>`;
  if (tag === 'link' || tag === 'meta' || tag === 'base') {
    return openTag;
  }
  return `${openTag}${innerHTML}</${tag}>`;
};
