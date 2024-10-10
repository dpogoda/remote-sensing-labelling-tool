import type { PanzoomObject, PanzoomOptions } from "@panzoom/panzoom";
import type GeoTIFF from "geotiff";
import type { ClassItem, useLabelCanvasStore } from "./stores/canvasHandlerStore";

export enum NormType {
    '1and99percentile' = '1and99percentile',
    '5and95percentile' = '5and95percentile',
    'minmax' = 'minmax',
    'histogram' = 'histogram'
}

export enum SimpleDrawType {
    'DrawPixel' = 'DrawPixel',
    'ErasePixel' = 'ErasePixel',
    'OverDrawColor' = 'OverDrawColor',
    'ABDraw' = 'ABDraw'
}

export interface CanvasHandlerStore {
    bucketFillTolerance: number;
    autofillMaxTolerance: number;
    autofillTolerance: number;
    autofillXY: { x: number, y: number };
    tooltips: { [key: string]: string };
    intensityFillerMenuOpen: boolean;
    intensityFillerTolerance: number;
    layerType: 'NDBI' | 'NDSI' | 'SAVI' | 'NDWI' | 'Moisture' | 'Agriculture' | 'NDVI' | 'Short Wave Infrared' | 'RGB';
    autofillColor: Uint8ClampedArray;
    autofillReferencePixel: number[][];
    theme: 'PurpleTheme' | 'DarkPurpleTheme';
    showSidebar: boolean;
    showMini: boolean;
    panzoom: PanzoomObject | null;
    lastPan: { x: number, y: number } | null;
    lastPanScale: number | null;
    lastPanOptions: PanzoomOptions | null;
    lastLabelContainerStyle: string | null;
    saveMenuOpen: boolean;
    gmmArray: number[][];
    gmmArrayProb: number[][];
    sclArray: number[][];
    propMaskActive: boolean;
    probabilityMask: number;
    shortNote: string;
    longNote: string;
    currentTags: string[];
    newClassName: string;
    newClassColor: string;
    saveWithGMM: boolean;
    rawMapBrightness: number;
    rawMapContrast: number;
    brightnessContrastMenuActive: boolean;
    currentNormalization: string;
    certainty: number;
    mapActive: boolean;
    currentMapLayer: string;
    availableMapLayers: string[];
    pixelClassInfo: string;
    pixelCertaintyInfo: string;
    mouseIsDown: boolean;
    mouseIsUp: boolean;
    drawingActive: boolean;
    eraserActive: boolean;
    panMoveActive: boolean;
    layerNameDrawerSettings: Map<string, {
        opacity: number;
        visible: boolean;
        discretizable: boolean;
        discreteActive: boolean;
        discreteMenuOpen: boolean;
    }>;
    availableTags: string[];
    bucketFill: {
        active: boolean;
        drawLayer: string;
        menuOpen: boolean;
    };
    magicStick: {
        active: boolean;
        overwriteClass: string;
        menuOpen: boolean;
        drawLayer: string;
    };
    abStick: {
        active: boolean;
        menuOpen: boolean;
        drawLayer: string;
    };
    penSize: number;
    displayNameToClassNumber: { [key: string]: number };
    displayNameToRGB: { [key: string]: number[] };
    classNameToDisplay: { [key: string]: string };
    classNameToColors: { [key: string]: string };
    hexColorToClassName: { [key: string]: string };
    displayNameToColors: { [key: string]: string };
    classNumberToColors: { [key: number]: string };
    classDetails: {
        id: number;
        className: string;
        classNumber: number;
        color: string;
        displayOrder: number;
    }[];
    listOfImages: {
        leftLower: [number, number];
        rightUpper: [number, number];
        rightLower: [number, number];
        leftUpper: [number, number];
        title: string;
        patchNumber: number;
        fullTitle: string;
        tags?: string[];
        shortNote?: string;
    }[];
    isLoading: boolean;
    showHotKeyBadges: boolean;
    currentImage: {
        title: string;
        fullTitle: string;
    };
    rgbRaw: Uint16Array[];
    b1Raw: Uint16Array;
    b5Raw: Uint16Array;
    b6Raw: Uint16Array;
    b7Raw: Uint16Array;
    b8Raw: Uint16Array;
    b8aRaw: Uint16Array;
    b9Raw: Uint16Array;
    b11Raw: Uint16Array;
    b12Raw: Uint16Array;
    rMax: number;
    gMax: number;
    bMax: number;
    b1RawMax: number;
    b5RawMax: number;
    b6RawMax: number;
    b7RawMax: number;
    b8RawMax: number;
    b8aRawMax: number;
    b9RawMax: number;
    b11RawMax: number;
    b12RawMax: number;
    rMin: number;
    gMin: number;
    bMin: number;
    b1RawMin: number;
    b5RawMin: number;
    b6RawMin: number;
    b7RawMin: number;
    b8RawMin: number;
    b8aRawMin: number;
    b9RawMin: number;
    b11RawMin: number;
    b12RawMin: number;
    rgbNormalised: ImageData;
    selectedLayer: string;
    layerRGBs: HTMLCanvasElement[];
    layerNameDisplayOrder: string[];
    drawingLayerNameDisplayOrder: string[];
    layerNameToCanvas: Map<string, HTMLCanvasElement>;
    drawingLayerToCanvas: Map<string, HTMLCanvasElement>;
    layerNameToCertaintyCanvas: Map<string, HTMLCanvasElement>;
    future: [string, ImageData][];
    selectedDrawingLayer: string;
    geoTiffs: GeoTIFF[];
    width: number;
    height: number;
    updatingTag: boolean;
    selectedClass: string;
    miniSideBar: boolean;
    sideBar: boolean;
    drawingLayers: { title: string; selected: boolean }[];
    drawingCertainties: { title: string; selected: boolean }[];
    showDrawingLayerModal: boolean;
    todos: any[];
    sclClassNumberToColor: { [key: number]: string };
}

export interface CanvasHandlerStoreGetters {
    getIntensityFillerMenuOpen(state: CanvasHandlerStore): boolean;
    getNextLayerName(state: CanvasHandlerStore): string;
    getSelectedClass(state: CanvasHandlerStore): string;
    [key: string]: any;
}

export interface CanvasHandlerStoreActions {
    prepareEditor: ({
        fileNameToImage,
        fileNameToCornerCoordinates,
        fileNameToBand,
        classes,
        width, 
        height
    }: {
        fileNameToImage: {
            [key: string]: Uint16Array;
        },
        fileNameToCornerCoordinates: {
            [key: string]: {
                topLeft: [number, number];
                topRight: [number, number];
                bottomLeft: [number, number];
                bottomRight: [number, number];
            };
        },
        fileNameToBand: {
            [key: string]: number;
        },
        classes: ClassItem[],
        width: number,
        height: number
    }) => Promise<void>;
    loadListOfImages(): Promise<void>;
    loadTags(): Promise<void>;
    loadClasses(classes: ClassItem[]): void;
    resetState(): void;
    cleanAndLoadNewImage(title: string): void;
    setRGBnormalised(rgbNormalised: ImageData): void;
    setRGBraw(rgbRaw: Uint16Array[]): void;
    setLayerRGBs(layerRGBs: HTMLCanvasElement[]): void;
    setGeoTiffs(geoTiffs: GeoTIFF[]): void;
    setWidth(width: number): void;
    setHeight(height: number): void;
    addLayer(layerName: string, canvas: HTMLCanvasElement, discretizable?: boolean): void;
    removeLayer(layerName: string): void;
    renameLayer(oldLayerName: string, newLayerName: string): void;
    selectLayer(layerName: string, closeMenus?: boolean): void;
    selectClass(className: string): void;
    selectDrawingLayer(layerName: string): void;
    selectDrawingCertainty(layerName: string): void;
    setShowDrawingLayerModal(show: boolean): void;
    setCurrentImage(title: string, fullTitle: string): void;
    setIsLoading(isLoading: boolean): void;
    setDrawingLayerToCanvas(drawingLayerToCanvas: Map<string, HTMLCanvasElement>): void;
    addDrawingLayer(layerName: string, canvas: HTMLCanvasElement): void;
    removeDrawingLayer(layerName: string): void;
    setSelectedDrawingLayer(layerName: string): void;
    setDrawingActive(active: boolean): void;
    setEraserActive(active: boolean): void;
    setPanMoveActive(active: boolean): void;
    setMagicStickActive(active: boolean): void;
    setAbStickActive(active: boolean): void;
    setMouseIsDown(isDown: boolean): void;
    setMouseIsUp(isUp: boolean): void;
    saveState(shortNote: string, longNote: string): Promise<void>;
    // pushToHistory(): void;
    // undo(): void;
    // redo(): Promise<void>;
    addClass(): Promise<void>;
    deleteClass(classId: number): Promise<void>;
    selectTag(tag: string): Promise<void>;
    incrPenSize(): void;
    decrPenSize(): void;
    toggleNormalization(): void;
    // togglePen(): boolean;
    // toggleEraser(): boolean;
    closeAllMenus(): void;
    // activatePanMove(): void;
    // activateWand(): void;
    // activateAB(): void;
    // activateBucketFill(): void;
    // cancelWand(): void;
    activateTool(tool: string): void;
}

// export type CanvasStore = CanvasHandlerStore  & CanvasHandlerStoreActions & CanvasHandlerStoreGetters;
export type CanvasStore = ReturnType<typeof useLabelCanvasStore>;