declare module 'foliate-js' {
    export class View {
        constructor(book: any);
        element: HTMLElement;
        destroy(): void;
    }
    export function makeBook(blob: Blob): Promise<any>;
}

declare module 'foliate-js/view.js' {
    export class View extends HTMLElement {
        renderer: HTMLElement | null;
        book: any;
        open(book: any): Promise<void>;
        init(options: { lastLocation?: string | null; showTextStart?: boolean }): Promise<void>;
        close(): void;
        destroy(): void;
        goTo(target: any): Promise<any>;
        prev(distance?: number): Promise<void>;
        next(distance?: number): Promise<void>;
    }
    export function makeBook(file: File | Blob | string): Promise<any>;
}
