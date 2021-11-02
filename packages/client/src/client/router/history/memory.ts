import { isString } from '@vitebook/core';

/**
 * Used server-side.
 */
class MemoryHistory implements History {
  scrollRestoration: ScrollRestoration = 'auto';

  protected history: string[] = [''];
  protected position = 0;
  protected _state = {};

  get state() {
    return this._state;
  }

  get length() {
    return this.history.length;
  }

  back(): void {
    this.go(-1);
  }

  forward(): void {
    this.position = Math.min(this.position + 1, this.history.length - 1);
  }

  go(delta: number): void {
    this.position = Math.max(
      0,
      Math.min(this.position + delta, this.history.length - 1),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pushState(data: any, _: string, url?: string | URL | null): void {
    if (!url) return;
    this.setLocation(isString(url) ? url : url.pathname);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replaceState(state: any, _: string, url?: string | URL | null): void {
    if (!url) return;
    this._state = state;
    this.history.splice(this.position--, 1);
    this.setLocation(isString(url) ? url : url.pathname);
  }

  protected setLocation(location: string) {
    this.position++;
    if (this.position === this.history.length) {
      // we are at the end, we can simply append a new entry
      this.history.push(location);
    } else {
      // we are in the middle, we remove everything from here in the history
      this.history.splice(this.position);
      this.history.push(location);
    }
  }
}

export function /*#__PURE__*/ createMemoryHistory() {
  return new MemoryHistory();
}
