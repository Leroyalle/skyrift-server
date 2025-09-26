export type PublicData<T extends object> = {
  [K in keyof T as T[K] extends () => any ? never : K]: T[K];
};
