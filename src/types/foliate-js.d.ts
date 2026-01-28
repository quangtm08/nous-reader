declare module 'foliate-js' {
    export class View {
        constructor(book: any);
        element: HTMLElement;
        destroy(): void;
    }
    export function makeBook(blob: Blob): Promise<any>;
}

interface Renderer {
    focusView?(): void;
    getSelection?(): { removeAllRanges?(): void } | null;
    setAttribute?(name: string, value: string): void;
}

declare module 'foliate-js/view.js' {
    export class View extends HTMLElement {
        renderer: Renderer | null;
        book: any;
        constructor();
        open(book: any): Promise<void>;
        init(options: { lastLocation?: string | null; showTextStart?: boolean }): Promise<void>;
        close(): void;
        destroy(): void;
        goTo(target: any): Promise<any>;
        prev(distance?: number): Promise<void>;
        next(distance?: number): Promise<void>;
        goLeft?(): Promise<void>;
        goRight?(): Promise<void>;
        isFixedLayout?: boolean;
        addAnnotation(annotation: any): void;
        deleteAnnotation(annotation: any): void;
        getSelection(): any;
    }
    export function makeBook(file: File | Blob | string): Promise<any>;
}
