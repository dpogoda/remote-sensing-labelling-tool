import type GeoTIFF from 'geotiff';
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { getColorbar, getContour, getGMM, getGMMProba, getGeoTiff, getHeatmap, getScl, getSeason, request, toggleTag } from '@/utils/helpers/api';
import { fromArrayBuffer } from 'geotiff';
import { normalizeBy1And99Percentile } from '@/views/editor/components/remoteSensingUtilities';
import { certaintyToColor } from '@/views/editor/components/common';
import Panzoom, { type PanzoomObject, type PanzoomOptions } from '@panzoom/panzoom'
import config from '@/config';
import { loadNDWI } from '@/canvashandlers/indices/NDWI';
import { loadNDVI } from '@/canvashandlers/indices/NDVI';
import { loadNDBI } from '@/canvashandlers/indices/NDBI';
import { loadSAVI } from '@/canvashandlers/indices/SAVI';
import { loadShortWaveInfrared } from '@/canvashandlers/indices/ShortWaveInfrared';
import { loadAgriculture } from '@/canvashandlers/indices/Agriculture';
import { loadMoisture } from '@/canvashandlers/indices/Moisture';
import { loadNDSI } from '@/canvashandlers/indices/NDSI';
import type { CanvasHandlerStore, CanvasHandlerStoreActions, CanvasHandlerStoreGetters } from '@/types';
import { ActionEventHandler } from '@/eventhandlers/ActionEventHandler';
import { LayersHandler } from '@/eventhandlers/LayersHandler';
import { HistoryHandler } from '@/eventhandlers/HistoryHandler';
import { toggleCursor } from '@/utils/helpers/common';
import { CursorShadowHandler } from '@/eventhandlers/CursorShadowHandler';
import { PanzoomHandler } from '@/eventhandlers/PanzoomHandler';
import { useNavStore } from './navStore';
import { HotkeyHandler } from '@/eventhandlers/Hotkeys';
import { useSettingsStore } from './settingStore';

const baseUrl = `${import.meta.env.VITE_SERVER_BASE}`;

export function patchNumberToCoords(patchNumber: number) {

    let numColumns = config.patchColumns;
    let cellWidth = config.patchSize;

    let x = (patchNumber % numColumns) * cellWidth;
    let y = Math.floor(patchNumber / numColumns) * cellWidth;

    return { x, y }
}

interface LayerStateSave {
    layerName: string;
    title: string;
    fullTitle: string;
    drawingArray: string;
    certaintyArray: string;
}

export interface ClassItem {
    id: number;
    className: string;
    classNumber: number;
    color: string;
    displayOrder: number;
}

export interface Setting {
    id: number;
    name: string;
    value: string;
    type: string;
    displayName: string;
}

export interface HotKeySetting {
    id: number;
    name: string;
    value: string;
    type: string;
    keys: string[];
    displayName: string;
}

const normalizations = ['1/99 Percentiles', '5/95 Percentiles', 'MinMax', 'Histogram']; //, 'Dynamic World', 'Div 10000', 'Histogram'
const cursors = [1, 5, 10, 15, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14];

export const useLabelCanvasStore = defineStore<'labelCanvasStore', CanvasHandlerStore, CanvasHandlerStoreGetters, CanvasHandlerStoreActions>('labelCanvasStore', {
    state: () => ({
        bucketFillTolerance: 80,
        autofillMaxTolerance: 100,
        autofillTolerance: 50,
        autofillXY: { x: 0, y: 0 } as { x: number, y: number },
        tooltips: {} as { [key: string]: string },
        intensityFillerMenuOpen: false,
        intensityFillerTolerance: 100,
        layerType: 'RGB' as 'NDBI' | 'NDSI' | 'SAVI' | 'NDWI' | 'Moisture' | 'Agriculture' | 'NDVI' | 'Short Wave Infrared' | 'RGB',
        autofillColor: new Uint8ClampedArray([0, 0, 0, 0]),
        autofillReferencePixel: [] as number[][],
        theme: 'DarkPurpleTheme' as 'PurpleTheme' | 'DarkPurpleTheme',
        showSidebar: true as boolean,
        showMini: false as boolean,
        panzoom: null as PanzoomObject | null, // PanzoomObject | null = null,
        lastPan: null as { x: number, y: number } | null,  //{ x: number, y: number } | null = null,
        lastPanScale: null as number | null,  //number | null = null,
        lastPanOptions: null as PanzoomOptions | null, // PanzoomOptions | null = null,
        lastLabelContainerStyle: null as string | null, // string | null = null,
        // settings: [] as Setting[],
        saveMenuOpen: false as boolean,
        // hotKeys: [] as HotKeySetting[],
        gmmArray: [] as number[][],
        gmmArrayProb: [] as number[][],
        sclArray: [] as number[][],
        propMaskActive: false as boolean,
        probabilityMask: 0 as number,
        shortNote: '' as string,
        longNote: '' as string,
        currentTags: [] as string[],
        newClassName: '' as string,
        newClassColor: '#FF0000' as string,
        saveWithGMM: true as boolean,
        rawMapBrightness: 0 as number,
        rawMapContrast: 0 as number,
        brightnessContrastMenuActive: false,
        currentNormalization: '1/99 Percentiles',
        certainty: 95,
        mapActive: false,
        currentMapLayer: 'Google Satellite',
        availableMapLayers: ['OpenStreetMap', 'Google Satellite'],
        pixelClassInfo: '',
        pixelCertaintyInfo: '',
        mouseIsDown: false,
        mouseIsUp: false,
        drawingActive: false,
        eraserActive: false,
        panMoveActive: true,
        layerNameDrawerSettings: new Map<string, {}>() as Map<string, {
            opacity: number,
            visible: boolean,
            discretizable: boolean,
            discreteActive: boolean,
            discreteMenuOpen: boolean
        }>,
        availableTags: [] as string[],
        bucketFill: {
            active: false,
            drawLayer: 'Drawing Layer 1',
            menuOpen: false
        } as {
            active: boolean, drawLayer: string, menuOpen: boolean
        },
        magicStick: {
            active: false,
            overwriteClass: 'Water',
            menuOpen: false,
            drawLayer: 'Drawing Layer 1'
        } as { active: boolean, overwriteClass: string, menuOpen: boolean, drawLayer: string },
        abStick: {
            active: false,
            menuOpen: false,
            drawLayer: 'Drawing Layer 1'
        } as { active: boolean, menuOpen: boolean, drawLayer: string },
        penSize: 10,
        displayNameToClassNumber: {} as { [key: string]: number },
        displayNameToRGB: {} as { [key: string]: number[] },
        classNameToDisplay: {} as { [key: string]: string },
        classNameToColors: {} as { [key: string]: string },
        hexColorToClassName: {} as { [key: string]: string },
        displayNameToColors: {} as {
            [key: string]: string
        },
        classNumberToColors: {} as { [key: number]: string },
        classDetails: [] as {
            id: number;
            className: string;
            classNumber: number;
            color: string;
            displayOrder: number;
        }[],
        listOfImages: [] as {
            leftLower: [number, number],
            rightUpper: [number, number]
            rightLower: [number, number],
            leftUpper: [number, number],
            title: string
            patchNumber: number,
            fullTitle: string,
            tags?: string[],
            shortNote?: string,
        }[],
        isLoading: false,
        showHotKeyBadges: false,
        currentImage: {
            title: '',
            fullTitle: ''
        } as { title: string, fullTitle: string },
        rgbRaw: [] as Uint16Array[],
        b1Raw: new Uint16Array() as Uint16Array,
        b5Raw: new Uint16Array() as Uint16Array,
        b6Raw: new Uint16Array() as Uint16Array,
        b7Raw: new Uint16Array() as Uint16Array,
        b8Raw: new Uint16Array() as Uint16Array,
        b8aRaw: new Uint16Array() as Uint16Array,
        b9Raw: new Uint16Array() as Uint16Array,
        b11Raw: new Uint16Array() as Uint16Array,
        b12Raw: new Uint16Array() as Uint16Array,
        rMax: 0,
        gMax: 0,
        bMax: 0,
        b1RawMax: 0,
        b5RawMax: 0,
        b6RawMax: 0,
        b7RawMax: 0,
        b8RawMax: 0,
        b8aRawMax: 0,
        b9RawMax: 0,
        b11RawMax: 0,
        b12RawMax: 0,
        rMin: 0,
        gMin: 0,
        bMin: 0,
        b1RawMin: 0,
        b5RawMin: 0,
        b6RawMin: 0,
        b7RawMin: 0,
        b8RawMin: 0,
        b8aRawMin: 0,
        b9RawMin: 0,
        b11RawMin: 0,
        b12RawMin: 0,
        rgbNormalised: new ImageData(5, 5),
        selectedLayer: '',
        layerRGBs: [] as HTMLCanvasElement[],
        layerNameDisplayOrder: [] as string[],
        drawingLayerNameDisplayOrder: [] as string[],
        layerNameToCanvas: reactive(new Map<string, HTMLCanvasElement>()),
        drawingLayerToCanvas: reactive(new Map<string, HTMLCanvasElement>()),
        layerNameToCertaintyCanvas: new Map<string, HTMLCanvasElement>(),
        // history: [] as [string, ImageData][],
        future: [] as [string, ImageData][],
        selectedDrawingLayer: '',
        geoTiffs: [] as GeoTIFF[],
        width: 0,
        height: 0,
        updatingTag: false,
        selectedClass: 'Water',
        miniSideBar: false,
        sideBar: true,
        drawingLayers: [
            { title: 'Drawing Layer 1', selected: true },
            { title: 'Drawing Layer 2', selected: false },
        ] as { title: string, selected: boolean }[],
        drawingCertainties: [
            { title: 'Low', selected: false },
            { title: 'Medium', selected: false },
            { title: 'High', selected: true },
        ] as { title: string, selected: boolean }[],
        showDrawingLayerModal: false as boolean,
        todos: [] as any[],
        sclClassNumberToColor: {} as { [key: number]: string },
    }),
    getters: {
        getIntensityFillerMenuOpen(state: CanvasHandlerStore): boolean {
            return state.intensityFillerMenuOpen;
        },
        getNextLayerName(state: CanvasHandlerStore): string {
            let maxLayerNumber = 0;
            state.layerNameToCanvas.forEach((_, layerName) => {
                const layerNumber = parseInt(layerName.split(' ')[1]);
                if (layerNumber > maxLayerNumber) {
                    maxLayerNumber = layerNumber;
                }
            });
            return `Layer ${maxLayerNumber + 1}`;
        },
        getSelectedClass(state: CanvasHandlerStore): string {
            return state.selectedClass;
        },
    },
    actions: {
        // setIntensityFillerMenuOpen(open: boolean) {
        //     this.intensityFillerMenuOpen = open;
        // },
        // async loadSettings() {
        //     this.settings = [];
        //     this.hotKeys = [];
        //     const settings = await getSettings();
        //     this.settings = settings.settings;

        //     this.settings.forEach((setting: Setting) => {
        //         switch (setting.type) {
        //             case 'string[]':
        //                 this.hotKeys.push({
        //                     ...setting,
        //                     keys: JSON.parse(setting.value)
        //                 });
        //                 localStorage.setItem(setting.displayName, JSON.parse(setting.value));
        //                 break;
        //         }
        //     });
        //     return settings;
        // },
        // async saveSetting(setting: Setting) {
        //     await updateSetting(setting);
        //     await this.loadSettings();
        // },
        async loadListOfImages() {
            const metaJson = await request.get(`${baseUrl}/api/list-of-images`);
            this.listOfImages = metaJson.listOfFiles;
        },
        async loadTags() {
            const allAvailableTags = await request.get(`${baseUrl}/api/tags`);
            this.availableTags = allAvailableTags.tags;
        },
        loadClasses(classes: ClassItem[]) {
            classes.forEach((class_) => {
                this.displayNameToClassNumber[class_.className] = class_.classNumber;
                this.displayNameToRGB[class_.className] = class_.color.slice(1).match(/.{1,2}/g)!.map((x) => parseInt(x, 16));
                this.classNameToDisplay[class_.className] = class_.className;
                this.classNameToColors[class_.className] = class_.color;
                this.hexColorToClassName[class_.color] = class_.className;
                this.displayNameToColors[class_.className] = class_.color;
                this.classNumberToColors[class_.classNumber] = class_.color;
            });
            this.classDetails = classes;
        },
        async resetState() {
            HistoryHandler.history = [];
            HistoryHandler.future = [];
            HistoryHandler.letterIndex = 0;

            this.layerNameToCanvas.clear();
            this.geoTiffs = [];
            this.setWidth(0);
            this.setHeight(0);
            this.setRGBraw([]);
            this.setRGBnormalised(new ImageData(5, 5));
            this.setLayerRGBs([]);
            this.setDrawingLayerToCanvas(new Map<string, HTMLCanvasElement>());
            this.setSelectedDrawingLayer('');
            this.setDrawingActive(false);
            this.setEraserActive(false);
            this.setPanMoveActive(true);
            this.layerNameDisplayOrder = [];
            this.drawingLayerNameDisplayOrder = [];
            this.bucketFill.active = false;
            this.bucketFill.menuOpen = false;
            this.magicStick.active = false;
            this.magicStick.menuOpen = false;
            this.future = [];
            this.rawMapBrightness = 0;
            this.rawMapContrast = 0;
            this.brightnessContrastMenuActive = false;
            this.currentNormalization = '1/99 Percentiles';
            this.certainty = 95;
            this.mapActive = false;
            this.currentMapLayer = 'Google Satellite';
            this.layerNameDrawerSettings = new Map();
            this.shortNote = '';
            this.longNote = '';
            this.currentTags = [];
            this.gmmArray = [];
            this.sclArray = [];
            this.probabilityMask = 0;
            this.propMaskActive = false;
            this.future = [];
        },
        // const fileNameToImage: {
        //     [key: string]: Uint16Array;
        // } = {
        // }

        // const fileNameToCornerCoordinates: {
        //     [key: string]: {
        //         topLeft: number[];
        //         topRight: number[];
        //         bottomLeft: number[];
        //         bottomRight: number[];
        //     };
        // } = {
        // }
        async prepareEditor({
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
                [key: string]: number
            }
            classes: ClassItem[],
            width: number,
            height: number
        }) {
            this.resetState();

            const settingsStore = useSettingsStore();
            await settingsStore.loadSettings();
            HotkeyHandler.getInstance();
            CursorShadowHandler.getInstance();
            LayersHandler.getInstance();
            ActionEventHandler.getInstance();
            PanzoomHandler.getInstance();
            ActionEventHandler.getInstance().updateMouseListeners();
            let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
            this.width = width;
            this.height = height;
            cursorCanvas!.width = this.width;
            cursorCanvas!.height = this.height;
            CursorShadowHandler.getInstance().updateCursorShadow();
            PanzoomHandler.getInstance().addPanzoom(document.getElementById('panContainer')!);
            this.selectLayer('Drawing Layer 1');


            console.log('wh', width, height);
            console.log('thiswh', this.width, this.height);

            this.loadClasses(classes);
            let r;
            let g;
            let b;
            for (const [fileName, bandNo] of Object.entries(fileNameToBand)) {

                if (bandNo === 10) {
                    continue;
                }

                if (bandNo === 4) {
                    r = fileNameToImage[fileName];
                }
                if (bandNo === 3) {
                    g = fileNameToImage[fileName];
                }
                if (bandNo === 2) {
                    b = fileNameToImage[fileName];
                }
                if (bandNo === 0) {
                    this.b1Raw = fileNameToImage[fileName];
                }

                if (bandNo === 4) {
                    this.b5Raw = fileNameToImage[fileName];
                }

                if (bandNo === 5) {
                    this.b6Raw = fileNameToImage[fileName];
                }

                if (bandNo === 6) {
                    this.b7Raw = fileNameToImage[fileName];
                }

                if (bandNo === 7) {
                    this.b8Raw = fileNameToImage[fileName];
                }

                if (bandNo === 8) {
                    this.b8aRaw = fileNameToImage[fileName];
                }

                if (bandNo === 9) {
                    this.b9Raw = fileNameToImage[fileName];
                }

                if (bandNo === 11) {
                    this.b11Raw = fileNameToImage[fileName];
                }

                if (bandNo === 12) {
                    this.b12Raw = fileNameToImage[fileName];
                }

                const cornerCoordinates = fileNameToCornerCoordinates[fileName];
                this.listOfImages.push({
                    leftLower: cornerCoordinates.bottomLeft,
                    rightUpper: cornerCoordinates.topRight,
                    rightLower: cornerCoordinates.bottomRight,
                    leftUpper: cornerCoordinates.topLeft,
                    title: fileName,
                    patchNumber: 0,
                    fullTitle: fileName,
                });
            }

            // merge rgb
            if (r && g && b) {
                this.rgbRaw = [r, g, b];
            }

            console.log(this.listOfImages);

            let normalisedRgbTiff: ImageData = normalizeBy1And99Percentile(this.rgbRaw, this.width, this.height);
            this.setRGBnormalised(normalisedRgbTiff);

            let sourceImageCanvas = document.createElement('canvas');
            sourceImageCanvas.width = this.width;
            sourceImageCanvas.height = this.height;
            sourceImageCanvas.style.imageRendering = 'pixelated';
            sourceImageCanvas.style.position = 'absolute';
            sourceImageCanvas.style.top = '0';
            sourceImageCanvas.style.left = '0';
            sourceImageCanvas.id = 'Source Image';
            let ctx = sourceImageCanvas.getContext('2d');
            if (ctx) {
                ctx.putImageData(this.rgbNormalised, 0, 0);
                ctx!.imageSmoothingEnabled = false;
            }

            // this.layerNameDrawerSettings.set('Source Image', { opacity: 100, visible: true });
            this.addLayer('Source Image', sourceImageCanvas, true);

            loadAgriculture(this);
            loadNDVI(this);
            // loadNDBI(this);
            // loadSAVI(this);
            loadNDWI(this);
            // loadNDSI(this);
            // loadShortWaveInfrared(this);
            // loadMoisture(this);

            let drawingCanvas1 = document.createElement('canvas');
            drawingCanvas1.id = 'Drawing Layer 1';
            drawingCanvas1.width = this.width;
            drawingCanvas1.height = this.height;
            drawingCanvas1.style.position = 'absolute';
            drawingCanvas1.style.top = '0';
            drawingCanvas1.style.left = '0';
            drawingCanvas1.style.imageRendering = 'pixelated';
            this.addLayer('Drawing Layer 1', drawingCanvas1);


            console.log('--->', this.width, this.height);




            const navStore = useNavStore();
            navStore.uploadActive = false;

            LayersHandler.getInstance().orderLayers('Drawing Layer 1')
            PanzoomHandler.getInstance().addPanzoom(document.getElementById('panContainer')!);
            CursorShadowHandler.getInstance().addMouseOverContainer();
            PanzoomHandler.getInstance().addRightMouseButtonDownEvent();
            PanzoomHandler.getInstance().addRightMouseButtonUpEvent();
            ActionEventHandler.getInstance().updateMouseListeners();


            // for (const [fileName, image] of Object.entries(fileNameToImage)) {
            //     const cornerCoordinates = fileNameToCornerCoordinates[fileName];
            //     this.listOfImages.push({
            //         leftLower: cornerCoordinates.bottomLeft,
            //         rightUpper: cornerCoordinates.topRight,
            //         rightLower: cornerCoordinates.bottomRight,
            //         leftUpper: cornerCoordinates.topLeft,
            //         title: fileName,
            //         patchNumber: 0,
            //         fullTitle: fileName,
            //     });
            //     this.geoTiffs.push(await fromArrayBuffer(image.buffer));
            // }


            // history.replaceState({}, '', `/editor?full-title=ac_2020_06_-3.1031588031869792_53.55478943580942_2`);

        },
        async cleanAndLoadNewImage(title: string) {

            // this.isLoading = true;

            // this.resetState();

            // const classes = await request.get(`${baseUrl}/api/classes`);
            // this.loadClasses(classes.classes);

            // this.sclClassNumberToColor = {
            //     1: '#00000000',
            //     2: '#00000000',
            //     3: '#00000000',
            //     4: this.classNameToColors['Vegetation'],
            //     5: this.classNameToColors['Unvegetated Soil'],
            //     6: this.classNameToColors['Water'],
            //     7: '#00000000',
            //     8: '#00000000',
            //     9: '#00000000',
            //     10: '#00000000',
            //     11: this.classNameToColors['Snow/Ice'],
            // }



            // const imageOfInterest = this.listOfImages.find((img) => img.title === title);

            // if (imageOfInterest) {
            //     /* --- rgb tiff --- */
            //     const redBand = await fromArrayBuffer(await getGeoTiff('r', imageOfInterest.fullTitle));
            //     const greenBand = await fromArrayBuffer(await getGeoTiff('g', imageOfInterest.fullTitle));
            //     const blueBand = await fromArrayBuffer(await getGeoTiff('b', imageOfInterest.fullTitle));

            //     const b1 = await fromArrayBuffer(await getGeoTiff('B1', imageOfInterest.fullTitle));
            //     const b5 = await fromArrayBuffer(await getGeoTiff('B5', imageOfInterest.fullTitle));
            //     const b6 = await fromArrayBuffer(await getGeoTiff('B6', imageOfInterest.fullTitle));
            //     const b7 = await fromArrayBuffer(await getGeoTiff('B7', imageOfInterest.fullTitle));
            //     const b8 = await fromArrayBuffer(await getGeoTiff('B8', imageOfInterest.fullTitle));
            //     const b8a = await fromArrayBuffer(await getGeoTiff('B8A', imageOfInterest.fullTitle));
            //     const b9 = await fromArrayBuffer(await getGeoTiff('B9', imageOfInterest.fullTitle));
            //     const b11 = await fromArrayBuffer(await getGeoTiff('B11', imageOfInterest.fullTitle));
            //     const b12 = await fromArrayBuffer(await getGeoTiff('B12', imageOfInterest.fullTitle));


            //     const redImage = await redBand.getImage();
            //     const greenImage = await greenBand.getImage();
            //     const blueImage = await blueBand.getImage();

            //     const b1Image = await b1.getImage();
            //     const b5Image = await b5.getImage();
            //     const b6Image = await b6.getImage();
            //     const b7Image = await b7.getImage();
            //     const b8Image = await b8.getImage();
            //     const b8aImage = await b8a.getImage();
            //     const b9Image = await b9.getImage();
            //     const b11Image = await b11.getImage();
            //     const b12Image = await b12.getImage();

            //     const redRasters = await redImage.readRasters();
            //     const greenRasters = await greenImage.readRasters();
            //     const blueRasters = await blueImage.readRasters();

            //     const b1Rasters = await b1Image.readRasters();
            //     const b5Rasters = await b5Image.readRasters();
            //     const b6Rasters = await b6Image.readRasters();
            //     const b7Rasters = await b7Image.readRasters();
            //     const b8Rasters = await b8Image.readRasters();
            //     const b8aRasters = await b8aImage.readRasters();
            //     const b9Rasters = await b9Image.readRasters();
            //     const b11Rasters = await b11Image.readRasters();
            //     const b12Rasters = await b12Image.readRasters();

            //     this.setWidth(redImage.getWidth());
            //     this.setHeight(redImage.getHeight());
            //     this.setRGBraw([redRasters[0] as Uint16Array, greenRasters[0] as Uint16Array, blueRasters[0] as Uint16Array]);

            //     this.b1Raw = b1Rasters[0] as Uint16Array;
            //     this.b5Raw = b5Rasters[0] as Uint16Array;
            //     this.b6Raw = b6Rasters[0] as Uint16Array;
            //     this.b7Raw = b7Rasters[0] as Uint16Array;
            //     this.b8Raw = b8Rasters[0] as Uint16Array;
            //     this.b8aRaw = b8aRasters[0] as Uint16Array;
            //     this.b9Raw = b9Rasters[0] as Uint16Array;
            //     this.b11Raw = b11Rasters[0] as Uint16Array;
            //     this.b12Raw = b12Rasters[0] as Uint16Array;

            //     let normalisedRgbTiff: ImageData = normalizeBy1And99Percentile(this.rgbRaw, this.width, this.height);
            //     this.setRGBnormalised(normalisedRgbTiff);

            //     let sourceImageCanvas = document.createElement('canvas');
            //     sourceImageCanvas.width = this.width;
            //     sourceImageCanvas.height = this.height;
            //     sourceImageCanvas.style.imageRendering = 'pixelated';
            //     sourceImageCanvas.style.position = 'absolute';
            //     sourceImageCanvas.style.top = '0';
            //     sourceImageCanvas.style.left = '0';
            //     sourceImageCanvas.id = 'Source Image';
            //     let ctx = sourceImageCanvas.getContext('2d');
            //     if (ctx) {
            //         ctx.putImageData(this.rgbNormalised, 0, 0);
            //         ctx!.imageSmoothingEnabled = false;
            //     }

            //     // this.layerNameDrawerSettings.set('Source Image', { opacity: 100, visible: true });
            //     this.addLayer('Source Image', sourceImageCanvas, true);



            //     loadNDVI(this);
            //     loadNDBI(this);
            //     loadSAVI(this);
            //     loadNDWI(this);
            //     loadNDSI(this);
            //     loadShortWaveInfrared(this);
            //     loadAgriculture(this);
            //     loadMoisture(this);




            //     let drawingCanvas1 = document.createElement('canvas');
            //     drawingCanvas1.id = 'Drawing Layer 1';
            //     drawingCanvas1.width = this.width;
            //     drawingCanvas1.height = this.height;
            //     drawingCanvas1.style.position = 'absolute';
            //     drawingCanvas1.style.top = '0';
            //     drawingCanvas1.style.left = '0';
            //     drawingCanvas1.style.imageRendering = 'pixelated';
            //     this.addLayer('Drawing Layer 1', drawingCanvas1);

            //     let autofillCanvas = document.getElementById('autofill') as HTMLCanvasElement;
            //     autofillCanvas!.style!.pointerEvents = 'none';
            //     autofillCanvas!.width = this.width;
            //     autofillCanvas!.height = this.height;
            //     autofillCanvas!.style!.position = 'absolute';
            //     autofillCanvas!.style!.top = '0';
            //     autofillCanvas!.style!.left = '0';
            //     autofillCanvas!.style!.imageRendering = 'pixelated';


            //     let response: { layers: LayerStateSave[], shortNote: string, longNote: string, tags: string[], useGmm: boolean } = await request.get(`${baseUrl}/api/load-labelling?fullTitle=${this.currentImage.fullTitle}`);
            //     if (response) {
            //         this.shortNote = response.shortNote;
            //         this.longNote = response.longNote;
            //         this.currentTags = response.tags;
            //         this.saveWithGMM = response.useGmm;
            //         if (response.layers.length) {
            //             for (let i = 0; i < response.layers.length; i++) {
            //                 let drawingCanvas = null;
            //                 //@ts-ignore
            //                 let drawLayerNumber = parseInt(response.layers[i].layer_name.split(' ')[2]);
            //                 if (drawLayerNumber != 1) {
            //                     drawingCanvas = document.createElement('canvas');
            //                     drawingCanvas.id = 'Drawing Layer ' + drawLayerNumber;
            //                     drawingCanvas.width = this.width;
            //                     drawingCanvas.height = this.height;
            //                     drawingCanvas.style.position = 'absolute';
            //                     drawingCanvas.style.top = '0';
            //                     drawingCanvas.style.left = '0';
            //                     drawingCanvas.style.imageRendering = 'pixelated';
            //                     this.addLayer('Drawing Layer ' + drawLayerNumber, drawingCanvas);
            //                     // this.layerNameDrawerSettings.set('Drawing Layer ' + drawLayerNumber, { opacity: 100, visible: true });


            //                     let drawingLayer2CanvasCertainty = document.createElement('canvas');
            //                     drawingLayer2CanvasCertainty.id = 'Drawing Layer 1 Certainty';
            //                     drawingLayer2CanvasCertainty.width = this.width;
            //                     drawingLayer2CanvasCertainty.height = this.height;
            //                     drawingLayer2CanvasCertainty.style.position = 'absolute';
            //                     drawingLayer2CanvasCertainty.style.top = '0';
            //                     drawingLayer2CanvasCertainty.style.left = '0';
            //                     drawingLayer2CanvasCertainty.style.imageRendering = 'pixelated';
            //                     this.layerNameToCertaintyCanvas.set('Drawing Layer ' + drawLayerNumber, drawingLayer2CanvasCertainty);

            //                 } else {
            //                     drawingCanvas = drawingCanvas1;
            //                 }
            //                 let layer = response.layers[i];
            //                 let { x: x0, y: y0 } = patchNumberToCoords(this.listOfImages.find((img) => img.fullTitle === this.currentImage.fullTitle)!.patchNumber);
            //                 //@ts-ignore
            //                 let drawingArray = JSON.parse(layer.drawing_array);
            //                 for (let i = 0; i < drawingArray.length; i++) {
            //                     let x = i % config.patchSize;
            //                     let y = Math.floor(i / config.patchSize);
            //                     let classNumber = drawingArray[i];
            //                     let rgb = this.classNumberToColors[classNumber];
            //                     if (classNumber === 0) {
            //                         continue;
            //                     }
            //                     drawingCanvas!.getContext('2d')!.fillStyle = rgb;
            //                     drawingCanvas!.getContext('2d')!.fillRect(x + x0, y + y0, 1, 1);
            //                 }

            //                 //@ts-ignore
            //                 HistoryHandler.history.push([layer.layer_name + '_undeletable', drawingCanvas!.getContext('2d')!.getImageData(0, 0, this.width, this.height)]);
            //             }
            //         }
            //     }
            // }
            // ActionEventHandler.getInstance().updateMouseListeners();
            // PanzoomHandler.getInstance().addPanzoom(document.getElementById('panContainer')!);
            // this.isLoading = false;

            // let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
            // cursorCanvas!.width = this.width;
            // cursorCanvas!.height = this.height;

            // document.getElementById('probabilities')!.style!.pointerEvents = 'none';

            // HistoryHandler.history.reverse();
            // this.selectLayer('Drawing Layer 1');

            // if (imageOfInterest) {

            //     /* --- contour --- */
            //     const contourData = await getContour(imageOfInterest.fullTitle);
            //     let reader = new FileReader();
            //     let contourImage = new Image();
            //     reader.readAsDataURL(contourData);
            //     reader.onloadend = () => {
            //         //@ts-ignore
            //         contourImage.src = reader.result;
            //         contourImage.onload = () => {
            //             let canvas = document.createElement('canvas');
            //             let context = canvas.getContext('2d');
            //             canvas.width = this.width;
            //             canvas.height = this.height;
            //             canvas.style.position = 'absolute';
            //             canvas.style.top = '0';
            //             canvas.style.left = '0';
            //             canvas.id = 'Contour';
            //             if (context) {
            //                 context.drawImage(contourImage, 0, 0, this.width, this.height);
            //             }
            //             this.addLayer('Contour', canvas);
            //             // this.layerNameDrawerSettings.set('Contour', { opacity: 100, visible: true });
            //         };
            //     };

            //     /* --- heatmap --- */
            //     const heatmapData = await getHeatmap(imageOfInterest.fullTitle);
            //     const heatmapReader = new FileReader();
            //     let heatmapImage = new Image();
            //     heatmapReader.readAsDataURL(heatmapData);
            //     heatmapReader.onloadend = () => {
            //         //@ts-ignore
            //         heatmapImage.src = heatmapReader.result;
            //         heatmapImage.onload = () => {
            //             let heatmapCanvas = document.createElement('canvas');
            //             let heatmapContext = heatmapCanvas.getContext('2d');
            //             heatmapCanvas.width = this.width;
            //             heatmapCanvas.height = this.height;
            //             heatmapCanvas.style.position = 'absolute';
            //             heatmapCanvas.style.top = '0';
            //             heatmapCanvas.style.left = '0';
            //             heatmapCanvas.id = 'Heatmap';
            //             if (heatmapContext) {
            //                 heatmapContext.drawImage(heatmapImage, 0, 0, this.width, this.height);
            //             }
            //             this.addLayer('Heatmap', heatmapCanvas);
            //             // this.layerNameDrawerSettings.set('Heatmap', { opacity: 100, visible: true });
            //         };
            //     };

            //     /* --- colorbar --- */
            //     const colorbarData = await getColorbar(imageOfInterest.fullTitle);
            //     const colorbarReader = new FileReader();
            //     let colorbarImage = new Image();
            //     colorbarReader.readAsDataURL(colorbarData);
            //     colorbarReader.onloadend = () => {
            //         //@ts-ignore
            //         colorbarImage.src = colorbarReader.result;
            //         colorbarImage.onload = () => {
            //             document.getElementById('colorbar')!.innerHTML = '';
            //             (document.getElementById('colorbar') as HTMLImageElement).src = colorbarImage.src;
            //         };
            //     };

            //     let seasons = ['winter', 'summer', 'spring', 'autumn'];
            //     for (let i = 0; i < seasons.length; i++) {
            //         try {
            //             const seasonData = await getSeason(imageOfInterest.fullTitle, seasons[i]);
            //             const seasonReader = new FileReader();
            //             let seasonImage = new Image();
            //             seasonReader.readAsDataURL(seasonData);
            //             seasonReader.onloadend = () => {
            //                 //@ts-ignore
            //                 seasonImage.src = seasonReader.result;
            //                 seasonImage.onload = () => {
            //                     let seasonCanvas = document.createElement('canvas');
            //                     let seasonContext = seasonCanvas.getContext('2d');
            //                     seasonCanvas.width = this.width;
            //                     seasonCanvas.height = this.height;
            //                     seasonCanvas.style.position = 'absolute';
            //                     seasonCanvas.style.imageRendering = 'pixelated';
            //                     seasonCanvas.style.top = '0';
            //                     seasonCanvas.style.left = '0';
            //                     seasonCanvas.id = seasons[i].charAt(0).toUpperCase() + seasons[i].slice(1);
            //                     if (seasonContext) {
            //                         seasonContext.drawImage(seasonImage, 0, 0, this.width, this.height);
            //                         seasonContext!.imageSmoothingEnabled = false;
            //                     }
            //                     this.addLayer(seasons[i].charAt(0).toUpperCase() + seasons[i].slice(1), seasonCanvas);
            //                     // this.layerNameDrawerSettings.set('Heatmap', { opacity: 100, visible: true });
            //                 };
            //             };

            //         } catch (error: any) {

            //         }
            //     }

            //     let gmmCanvas = document.createElement('canvas');
            //     gmmCanvas.width = config.patchSize //this.width;
            //     gmmCanvas.height = config.patchSize //this.height;
            //     gmmCanvas.style.position = 'absolute';
            //     gmmCanvas.style.top = patchNumberToCoords(imageOfInterest.patchNumber).y + 'px';
            //     gmmCanvas.style.left = patchNumberToCoords(imageOfInterest.patchNumber).x + 'px';
            //     gmmCanvas.style.imageRendering = 'pixelated';
            //     gmmCanvas.id = 'GMM';
            //     this.gmmArray = await getGMM(imageOfInterest.fullTitle);
            //     let height = this.gmmArray.length;
            //     let width = this.gmmArray[0].length;

            //     let gmmContext = gmmCanvas.getContext('2d');
            //     for (let y = 0; y < height; y++) {
            //         for (let x = 0; x < width; x++) {
            //             const clusterNumber: number = this.gmmArray[y][x];
            //             gmmContext!.fillStyle = this.classNumberToColors[clusterNumber];
            //             gmmContext!.fillRect(x, y, 1, 1);
            //         }
            //     }
            //     this.addLayer('GMM', gmmCanvas);
            //     this.layerNameDrawerSettings.set('GMM', { opacity: 100, visible: true, discretizable: false, discreteActive: false, discreteMenuOpen: false });

            //     let sclCanvas = document.createElement('canvas');
            //     sclCanvas.width = this.width;
            //     sclCanvas.height = this.height;
            //     sclCanvas.style.position = 'absolute';
            //     sclCanvas.style.top = patchNumberToCoords(imageOfInterest.patchNumber).y + 'px';
            //     sclCanvas.style.left = patchNumberToCoords(imageOfInterest.patchNumber).x + 'px';
            //     sclCanvas.style.imageRendering = 'pixelated';
            //     sclCanvas.id = 'SCL';
            //     this.sclArray = await getScl(imageOfInterest.fullTitle);
            //     height = this.sclArray.length;
            //     width = this.sclArray[0].length;

            //     let sclContext = sclCanvas.getContext('2d');
            //     for (let y = 0; y < height; y++) {
            //         for (let x = 0; x < width; x++) {
            //             const clusterNumber: number = this.sclArray[y][x];
            //             sclContext!.fillStyle = this.sclClassNumberToColor[clusterNumber];
            //             sclContext!.fillRect(x, y, 1, 1);
            //         }
            //     }
            //     this.addLayer('SCL', sclCanvas);
            //     this.layerNameDrawerSettings.set('SCL', { opacity: 100, visible: true, discretizable: false, discreteActive: false, discreteMenuOpen: false });
            //     this.tooltips['SCL'] = 'In Sentinel-2 satellite imagery, "SCL" stands for Scene Classification Layer. Detects bare ground, vegetation, water snow/ice';


            //     let gmmCanvasCertainty = document.createElement('canvas');
            //     gmmCanvasCertainty.id = 'GMM Certainty Layer';
            //     gmmCanvasCertainty.width = this.width;
            //     gmmCanvasCertainty.height = this.height;
            //     gmmCanvasCertainty.style.position = 'absolute';
            //     gmmCanvasCertainty.style.top = patchNumberToCoords(imageOfInterest.patchNumber).y + 'px';
            //     gmmCanvasCertainty.style.left = patchNumberToCoords(imageOfInterest.patchNumber).x + 'px';
            //     gmmCanvasCertainty.style.imageRendering = 'pixelated';
            //     this.gmmArrayProb = await getGMMProba(imageOfInterest.fullTitle);
            //     height = this.gmmArrayProb.length;
            //     width = this.gmmArrayProb[0].length;

            //     let gmmCertaintyContext = gmmCanvasCertainty.getContext('2d');
            //     for (let y = 0; y < height; y++) {
            //         for (let x = 0; x < width; x++) {

            //             let certainty = certaintyToColor(this.gmmArrayProb[y][x]);

            //             gmmCertaintyContext!.fillStyle = certainty;
            //             gmmCertaintyContext!.fillRect(x, y, 1, 1);
            //         }
            //     }

            //     gmmCanvasCertainty.style.pointerEvents = 'none';
            //     console.log(gmmCanvasCertainty);
            //     // append after element with id GMM
            //     document.getElementById('probabilities')!.innerHTML = '';
            //     document.getElementById('probabilities')!.appendChild(gmmCanvasCertainty);
            //     console.log('appending!');
            //     document.getElementById('probabilities')!.style!.opacity = '0';
            //     document.getElementById('probabilities')!.style!.pointerEvents = 'none';

            //     this.layerNameToCertaintyCanvas.set('GMM Certainty Layer', gmmCanvasCertainty);
            //     // this.addLayer('GMM Certainty Layer', gmmCanvasCertainty);

            //     // document.getElementById('layers')?.appendChild(gmmCanvasCertainty);
            // }

        },
        setRGBnormalised(rgbNormalised: ImageData) {
            this.rgbNormalised = rgbNormalised;
        },
        setRGBraw(rgbRaw: Uint16Array[]) {
            this.rgbRaw = rgbRaw;
        },
        setLayerRGBs(layerRGBs: HTMLCanvasElement[]) {
            this.layerRGBs = layerRGBs;
        },
        setGeoTiffs(geoTiffs: GeoTIFF[]) {
            this.geoTiffs = geoTiffs;
        },
        setWidth(width: number) {
            this.width = width;
        },
        setHeight(height: number) {
            this.height = height;
        },
        addLayer(layerName: string, canvas: HTMLCanvasElement, discretizable: boolean = false) {
            this.layerNameToCanvas.set(layerName, canvas);
            this.layerNameDrawerSettings.set(layerName, { opacity: 100, visible: true, discretizable, discreteActive: false, discreteMenuOpen: false });
            if (layerName.startsWith('Drawing Layer')) {
                this.drawingLayerNameDisplayOrder.push(layerName);
            } else {
                this.layerNameDisplayOrder.push(layerName);
            }
        },
        removeLayer(layerName: string) {
            if (layerName === this.selectedLayer) {
                this.selectLayer('Drawing Layer 1')
            }
            document.getElementById(layerName)?.remove();
            this.layerNameToCanvas.delete(layerName);
            this.layerNameToCertaintyCanvas.delete(layerName);
            this.drawingLayerNameDisplayOrder = this.drawingLayerNameDisplayOrder.filter((name) => name !== layerName);
            this.layerNameDisplayOrder = this.layerNameDisplayOrder.filter((name) => name !== layerName);
            // remove all history entries for this layer
            HistoryHandler.history = HistoryHandler.history.filter(([name, _]) => name !== layerName);
            HistoryHandler.future = HistoryHandler.future.filter(([name, _]) => name !== layerName);
        },
        renameLayer(oldName: string, newName: string) {
            const canvas = this.layerNameToCanvas.get(oldName);
            if (canvas) {
                this.layerNameToCanvas.delete(oldName);
                this.layerNameToCanvas.set(newName, canvas);
            }
        },
        selectLayer(layerName: string, closeMenus: boolean = true) {
            if (!layerName.startsWith('Drawing Layer') && closeMenus) {
                this.closeAllMenus();
                this.setDrawingActive(false);
                this.setPanMoveActive(true);
            }
            this.selectedLayer = layerName;
            LayersHandler.getInstance().orderLayers(layerName);

            if (layerName.startsWith('Drawing Layer')) {
                ActionEventHandler.getInstance().updateMouseListeners();
            }
        },
        selectClass(className: string) {
            //const cursors = [1, 5, 10, 15, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14];
            // switch (className) {
            //     case 'Water':
            //         this.penSize = 15;
            //         break;
            //     case 'Wavebreaking Zone':
            //         this.penSize = 3;
            //         break;
            //     case "Intertidal Area":
            //         this.penSize = 3;
            //         break;
            //     case "Dry Sand":
            //         this.penSize = 3;
            //         break;
            //     case "Vegetation":
            //         this.penSize = 3;
            //         break;
            //     case "Tree":
            //         this.penSize = 3;
            //         break;
            //     case "Unvegetated Soil":
            //         this.penSize = 3;
            //         break;
            //     case "Rock":
            //         this.penSize = 3;
            //         break;
            //     case "Protecting Constructions":
            //         this.penSize = 3;
            //         break;
            //     case "Marsh land":
            //         this.penSize = 3;
            //         break;
            //     case "Human constructed":
            //         this.penSize = 3;
            //         break;
            //     case "Anthrophogenic Vegetation":
            //         this.penSize = 3;
            //         break;
            //     case "Reed Marsh":
            //         this.penSize = 3;
            //         break;
            //     case "Salt Marsh":
            //         this.penSize = 3;
            //         break;
            //     case "Snow/Ice":
            //         this.penSize = 3;
            //         break;
            //     case "Cliffline":
            //         this.penSize = 2;
            //         break;
            // }
            this.selectedClass = className
            if (!this.selectedLayer.toString().startsWith('Drawing Layer')) {
                this.selectLayer('Drawing Layer 1', false);
            }
            // if (!this.bucketFill.active && !this.magicStick.active && !this.abStick.active) {
            //     this.setDrawingActive(true);
            //     this.setPanMoveActive(false);
            //     this.setEraserActive(false);
            // } else {
            //     this.abStick.menuOpen = false;
            //     this.magicStick.menuOpen = false;
            //     this.bucketFill.menuOpen = false;
            // }
        },
        selectDrawingLayer(layerName: string) {
            this.drawingLayers.forEach((layer) => {
                layer.selected = layer.title === layerName;
            });
        },
        selectDrawingCertainty(layerName: string) {
            this.drawingCertainties.forEach((layer) => {
                layer.selected = layer.title === layerName;
            });
        },
        setShowDrawingLayerModal(show: boolean) {
            this.showDrawingLayerModal = show;
        },
        setCurrentImage(title: string, fullTitle: string) {
            this.currentImage = { title, fullTitle };
        },
        setIsLoading(isLoading: boolean) {
            this.isLoading = isLoading;
        },
        setDrawingLayerToCanvas(drawingLayerToCanvas: Map<string, HTMLCanvasElement>) {
            this.drawingLayerToCanvas = drawingLayerToCanvas;
        },
        addDrawingLayer(layerName: string, canvas: HTMLCanvasElement) {
            let layers = Array.from(this.layerNameToCanvas.keys())
            // get highest layer number
            let maxLayerNumber = 0;
            layers.forEach((layerName) => {
                const layerNumber = parseInt(layerName.split(' ')[2]);
                if (layerNumber > maxLayerNumber) {
                    maxLayerNumber = layerNumber;
                }
            });

            let drawingCanvas1 = document.createElement('canvas');
            drawingCanvas1.id = 'Drawing Layer ' + (maxLayerNumber + 1);
            drawingCanvas1.width = this.width;
            drawingCanvas1.height = this.height;
            drawingCanvas1.style.position = 'absolute';
            drawingCanvas1.style.top = '0';
            drawingCanvas1.style.left = '0';
            drawingCanvas1.style.imageRendering = 'pixelated';

            this.addLayer('Drawing Layer ' + (maxLayerNumber + 1), drawingCanvas1);
        },
        removeDrawingLayer(layerName: string) {
            this.drawingLayerToCanvas.delete(layerName);
        },
        setSelectedDrawingLayer(layerName: string) {
            this.selectedDrawingLayer = layerName;
        },
        setDrawingActive(active: boolean) {
            this.drawingActive = active;
        },
        setEraserActive(active: boolean) {
            this.eraserActive = active;
        },
        setPanMoveActive(active: boolean) {
            this.panMoveActive = active;
        },
        setMagicStickActive(active: boolean) {
            this.magicStick.active = active;
            this.magicStick.menuOpen = active;
        },
        setAbStickActive(active: boolean) {
            this.abStick.active = active;
            this.abStick.menuOpen = active;
        },
        setMouseIsDown(isDown: boolean) {
            this.mouseIsDown = isDown;
        },
        setMouseIsUp(isUp: boolean) {
            this.mouseIsUp = isUp;
        },
        async saveState(shortNote: string = '', longNote: string = '') {
            this.isLoading = true;
            const layersToSave: LayerStateSave[] = []
            // this.isLoading = true;
            // for each layer in layerNameToCanvas, save the canvas to the server
            this.layerNameToCanvas.forEach(async (canvas, layerName) => {
                if (layerName.startsWith('Drawing Layer')) {
                    const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
                    const targetArray = new Array(config.patchSize * config.patchSize);
                    // init targetArray with 0
                    for (let i = 0; i < targetArray.length; i++) {
                        targetArray[i] = 0;
                    }
                    let { x, y } = patchNumberToCoords(this.listOfImages.find((img) => img.fullTitle === this.currentImage.fullTitle)!.patchNumber);
                    x = x / config.patchSize;
                    y = y / config.patchSize;

                    for (let j = y * config.patchSize; j < y * config.patchSize + config.patchSize; j++) { // Iterate over each row in the subset
                        for (let k = x * config.patchSize; k < x * config.patchSize + config.patchSize; k++) { // Iterate over each column in the subset
                            let index = (j * this.width + k) * 4; // Calculate the flat array index for the (j, k) position
                            Object.keys(this.displayNameToRGB).forEach((displayName: string, classNumber: number) => {
                                if (imageData.data[index] === this.displayNameToRGB[displayName][0] && imageData.data[index + 1] === this.displayNameToRGB[displayName][1] && imageData.data[index + 2] === this.displayNameToRGB[displayName][2]) {
                                    targetArray[(j - y * config.patchSize) * config.patchSize + (k - x * config.patchSize)] = this.displayNameToClassNumber[displayName]; // Adjust index for targetArray
                                }
                            });
                        }
                    }

                    layersToSave.push({
                        layerName: layerName,
                        title: this.currentImage.title,
                        fullTitle: this.currentImage.fullTitle,
                        drawingArray: JSON.stringify(targetArray),
                        certaintyArray: '1'
                    });

                }
            });
            try {
                await request.post(`${baseUrl}/api/save-labelling`, {
                    'layers': layersToSave,
                    shortNote,
                    longNote,
                    useGmm: this.saveWithGMM
                });
                this.listOfImages.find((img) => img.fullTitle === this.currentImage.fullTitle)!.shortNote = shortNote;
            } catch (error) {
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },
        async addClass() {

            this.isLoading = true;
            await request.post(`${baseUrl}/api/add-class`, {
                className: this.newClassName,
                classColor: this.newClassColor.toUpperCase()
            });

            const classes = await request.get(`${baseUrl}/api/classes`);
            this.loadClasses(classes.classes);

            // this.displayNameToClassNumber[this.newClassName] = Object.keys(this.displayNameToClassNumber).length + 1;
            // this.displayNameToColors[this.newClassName] = this.newClassColor;
            // this.classNameToDisplay[this.newClassName] = this.newClassName;
            // this.classNameToColors[this.newClassName] = this.newClassColor;
            // this.hexColorToClassName[this.newClassColor] = this.newClassName;
            // this.classNumberToColors[Object.keys(this.displayNameToClassNumber).length] = this.newClassColor;

            this.newClassColor = '#FF0000';
            this.newClassName = '';

            this.isLoading = false;
        },
        async deleteClass(classId: number) {
            this.isLoading = true;
            await request.delete(`${baseUrl}/api/class/${classId}`);

            const classes = await request.get(`${baseUrl}/api/classes`);
            this.loadClasses(classes.classes);

            this.selectClass(this.classDetails[0].className);

            this.isLoading = false;
        },
        async selectTag(tag: string) {
            try {
                this.updatingTag = true;
                let imageOfInterest = this.listOfImages.find((img) => img.fullTitle === this.currentImage.fullTitle);
                if (!imageOfInterest) {
                    // throw new Error("Image not found");
                    console.log("Image not found");
                    return;
                }

                // Initialize tags array if it doesn't exist
                if (!imageOfInterest.tags) {
                    imageOfInterest.tags = [];
                }


                let newTags = await toggleTag(imageOfInterest.fullTitle, tag)
                imageOfInterest.tags = newTags;

            } catch (error) {
                console.error(error);
            } finally {
                this.updatingTag = false;
            }
        },
        incrPenSize() {
            let cursorsCopy = [...cursors].sort((a, b) => a - b);
            this.penSize = cursorsCopy[(cursorsCopy.indexOf(this.penSize) + 1) % cursorsCopy.length];
        },
        decrPenSize() {
            let cursorsCopy = [...cursors].sort((a, b) => a - b);
            this.penSize = cursorsCopy[(cursorsCopy.indexOf(this.penSize) - 1 + cursorsCopy.length) % cursorsCopy.length];
        },
        toggleNormalization() {
            this.currentNormalization = normalizations[(normalizations.indexOf(this.currentNormalization) + 1) % normalizations.length];
        },
        closeAllMenus() {
            this.setDrawingActive(false);
            this.setEraserActive(false);
            this.setPanMoveActive(false);
            this.bucketFill.active = false;
            this.bucketFill.menuOpen = false;
            this.magicStick.active = false;
            this.magicStick.menuOpen = false;
            this.abStick.active = false;
            this.abStick.menuOpen = false;
        },
        // togglePen() {
        //     this.closeAllMenus();
        //     let active = this.drawingActive;
        //     this.setDrawingActive(!active);
        //     if (!active) {
        //         // activate the drawing
        //         if (!this.selectedLayer.startsWith('Drawing Layer')) {
        //             this.selectLayer('Drawing Layer 1');
        //         }
        //         this.setDrawingActive(true);
        //         this.setPanMoveActive(false);
        //     } else {
        //         this.setPanMoveActive(true);
        //     }
        //     ActionEventHandler.getInstance().updateMouseListeners();
        //     return !active;
        // },
        // toggleEraser() {
        //     this.closeAllMenus();
        //     let active = this.eraserActive;
        //     this.setEraserActive(!active);
        //     if (!active) {
        //         // activate the drawing
        //         if (!this.selectedLayer.startsWith('Drawing Layer')) {
        //             this.selectLayer('Drawing Layer 1');
        //         }
        //         this.setEraserActive(true);
        //         this.setPanMoveActive(false);
        //     } else {
        //         this.setPanMoveActive(true);
        //     }
        //     return !active;
        // },
        // activatePanMove() {
        //     this.closeAllMenus();
        //     this.setPanMoveActive(true);
        // },
        // cancelWand() {
        //     this.closeAllMenus();
        //     this.setPanMoveActive(true);
        // },
        // activateWand() {
        //     this.closeAllMenus();
        //     this.magicStick.active = true;
        //     this.magicStick.menuOpen = false;
        //     this.selectLayer(this.magicStick.drawLayer);
        //     document.getElementById('drawingContainer')!.style.cursor = 'crosshair';
        //     ActionEventHandler.getInstance().updateMouseListeners();
        // },
        // activateAB() {
        //     this.closeAllMenus();
        //     this.abStick.active = true
        //     this.abStick.menuOpen = false;
        //     document.getElementById('drawingContainer')!.style.cursor = 'crosshair';
        //     ActionEventHandler.getInstance().updateMouseListeners();
        // },
        // activateBucketFill() {
        //     this.closeAllMenus();
        //     this.bucketFill.active = !this.bucketFill.active;
        //     if (!this.selectedLayer.startsWith('Drawing Layer')) {
        //         this.selectLayer('Drawing Layer 1');
        //     }
        //     this.bucketFill.drawLayer = this.selectedLayer;
        // },
        activateTool(tool: string) {
            let labelContainer = document.getElementById('labelContainer')!;
            switch (tool) {
                case 'pan':
                    this.closeAllMenus();
                    this.setPanMoveActive(true);
                    toggleCursor('move');
                    break;
                case 'ab':
                    this.closeAllMenus();
                    this.abStick.active = true;
                    if (!this.selectedLayer.startsWith('Drawing Layer')) {
                        this.selectLayer('Drawing Layer 1');
                    }
                    this.abStick.drawLayer = this.selectedLayer;
                    toggleCursor('ab');
                    break;
                case 'wand':
                    this.closeAllMenus();
                    this.magicStick.menuOpen = true;
                    toggleCursor('wand');
                    CursorShadowHandler.getInstance().updateCursorShadow();
                    break;
                case 'bucket':
                    this.closeAllMenus();
                    this.bucketFill.active = true;
                    if (!this.selectedLayer.startsWith('Drawing Layer')) {
                        this.selectLayer('Drawing Layer 1');
                    }
                    console.log('bucket drawing layer', this.selectedLayer);
                    this.bucketFill.drawLayer = this.selectedLayer;
                    toggleCursor('bucket');
                    break;
                case 'simpledraw':
                    this.closeAllMenus();
                    this.setDrawingActive(true);
                    if (!this.selectedLayer.startsWith('Drawing Layer')) {
                        this.selectLayer('Drawing Layer 1');
                    }
                    toggleCursor('draw');
                    break;
                case 'eraser':
                    this.closeAllMenus();
                    this.setEraserActive(true);
                    if (!this.selectedLayer.startsWith('Drawing Layer')) {
                        this.selectLayer('Drawing Layer 1');
                    }
                    toggleCursor('delete');
                    break;
            }
            ActionEventHandler.getInstance().updateMouseListeners();
        }
    },
});