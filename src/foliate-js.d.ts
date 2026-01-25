declare module 'foliate-js' {
    export class View {
        constructor(book: any);
        element: HTMLElement;
        destroy(): void;
    }
    export function makeBook(blob: Blob): Promise<any>;
}
