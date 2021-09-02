export class DisposalBin {
  protected _disposal: (() => void | Promise<void>)[] = [];

  add(...disposeCallbacks: (() => void | Promise<void>)[]): void {
    for (const dispose of disposeCallbacks) {
      this._disposal.push(dispose);
    }
  }

  async empty(): Promise<void> {
    for (const dispose of this._disposal) {
      await dispose();
    }

    this._disposal = [];
  }
}
