export type Unsubscribe = () => void;

export type Reactive<T> = {
  get(): T;
  set(newValue: T): void;
  subscribe(onUpdate: (value: T) => void): Unsubscribe;
};

export type ReactiveFactory = {
  <T>(value: T): Reactive<T>;
};
