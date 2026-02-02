import type { Point, ShapeType, Drawing } from "./drawing";

/**
 * Canvas state for tracking drawing operations and view transformations
 */
export interface CanvasState {
    /** Current zoom level (1.0 = 100%) */
    zoomLevel: number;
    /** Pan offset for canvas scrolling */
    panOffset: Point;
    /** Whether user is currently drawing */
    isDrawing: boolean;
    /** Currently selected shape tool */
    selectedShape: ShapeType;
    /** Current drawing color */
    color: string;
    /** Starting point of current drawing operation */
    startPoint: Point | null;
    /** In-progress drawing being created */
    currentDrawing: Drawing | null;
}

/**
 * Initial canvas state factory
 */
export function createInitialCanvasState(): CanvasState {
    return {
        zoomLevel: 1,
        panOffset: { x: 0, y: 0 },
        isDrawing: false,
        selectedShape: "pencil",
        color: "#000000",
        startPoint: null,
        currentDrawing: null,
    };
}

/**
 * Zoom constraints
 */
export const ZOOM_CONFIG = {
    MIN: 0.5,
    MAX: 3,
    STEP: 0.1,
} as const;
