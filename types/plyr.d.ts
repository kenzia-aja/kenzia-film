declare module "plyr" {
  export type PlyrQuality = { index: number; height?: number; label?: string };

  export default class Plyr {
    constructor(target: string | HTMLVideoElement | HTMLElement, options?: PlyrOptions);
    play(): Promise<void>;
    pause(): void;
    destroy(): void;
    source: unknown;
    poster: unknown;
    // quality control
    quality: { current: number; get options(): number[] };
    on(event: string, callback: (...args: unknown[]) => void): void;
    once(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback?: (...args: unknown[]) => void): void;
  }

  export interface PlyrOptions {
    controls?: string[];
    settings?: string[];
    autoplay?: boolean;
    muted?: boolean;
    ratio?: string;
    tooltips?: { controls?: boolean; seek?: boolean };
    quality?: {
      default?: number;
      forced?: boolean;
      options?: number[];
    };
    storage?: { enabled?: boolean; key?: string };
    loading?: string;
    speed?: { selected?: number; options?: number[] };
    i18n?: Record<string, string>;
  }
}
