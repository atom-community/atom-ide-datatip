import type { DatatipService } from "atom-ide-base";
export { default as config } from "./config.json";
export declare function activate(): Promise<void>;
export declare function deactivate(): void;
export declare function provideDatatipService(): DatatipService;
