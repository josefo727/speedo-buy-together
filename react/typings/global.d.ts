import type { FunctionComponent } from 'react';

declare global {
  interface StorefrontFunctionComponent<P = {}> extends FunctionComponent<P> {
    getSchema?(props: P): object;
    schema?: object;
  }
}
