declare const wx: any;
declare function App(options: any): void;
declare function Page(options: any): void;
declare function Component(options: any): void;
declare function getCurrentPages(): any[];

interface AppInstance {
  globalData: {
    user: import('./types').CurrentUser | null;
  };
  refreshCurrentUser?: () => Promise<void>;
}

declare function getApp<T = AppInstance>(): T;
