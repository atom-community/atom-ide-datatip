import type { DatatipService } from "atom-ide-base";
export declare function activate(): Promise<void>;
export declare function deactivate(): void;
export declare function provideDatatipService(): DatatipService;
export declare const config: {
    showDataTipOnCursorMove: {
        title: string;
        description: string;
        type: string;
        default: boolean;
    };
    showDataTipOnMouseMove: {
        title: string;
        description: string;
        type: string;
        default: boolean;
    };
    hoverTime: {
        title: string;
        description: string;
        type: string;
        default: number;
    };
    glowOnHover: {
        title: string;
        description: string;
        type: string;
        default: boolean;
    };
};
