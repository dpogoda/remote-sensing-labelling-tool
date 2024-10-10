import { bucketFillWorker } from "@/canvashandlers/drawingtools/bucketfill";
import { drawAbPixel, drawPixel, erasePixel, overDrawColor } from "@/canvashandlers/drawingtools/Simple";
import { useLabelCanvasStore } from "@/stores/canvasHandlerStore";
import { useSettingsStore } from "@/stores/settingStore";
import type { CanvasHandlerStore, CanvasStore } from "@/types";
import { getMousePos, toggleCursor } from "@/utils/helpers/common";
import { HistoryHandler } from "./HistoryHandler";

export class ActionEventHandler {

    static instance: ActionEventHandler | null = null;

    static mouseupListener: boolean = false;
    static mousedownListener: boolean = false;
    static mousemoveListener: boolean = false;

    canvasHandlerStore: CanvasStore | null = null;
    settingsStore: any = null;

    private mouseDownHandler: (event: Event) => void;
    private mouseUpHandler: (event: Event) => void;
    private mouseMoveHandler: (event: Event) => void;

    constructor() {
        this.canvasHandlerStore = useLabelCanvasStore();
        this.settingsStore = useSettingsStore();

        // Define the handler functions
        this.mouseDownHandler = (event: Event) => this.mouseDownFunction(event as MouseEvent, this.getCanvas()!);
        this.mouseUpHandler = (event: Event) => this.mouseUpFunction(event as MouseEvent);
        this.mouseMoveHandler = (event: Event) => this.mouseMoveEvent(event, this.getGMMContext());
    }

    static getInstance() {
        if (!ActionEventHandler.instance) {
            ActionEventHandler.instance = new ActionEventHandler();
        }
        return ActionEventHandler.instance;
    }

    getCanvas(): HTMLCanvasElement | null {
        let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;
        if (labelStore) {
            if (labelStore.magicStick.active) {
                return labelStore.layerNameToCanvas.get(labelStore.magicStick.drawLayer)!;
            } else if (labelStore.bucketFill.active) {
                return labelStore.layerNameToCanvas.get(labelStore.bucketFill.drawLayer)!;
            } else if (labelStore.abStick.active) {
                return labelStore.layerNameToCanvas.get(labelStore.abStick.drawLayer)!;
            } else {
                return labelStore.layerNameToCanvas.get(labelStore.selectedLayer)!;
            }
        }
        return null;
    }

    getGMMContext(): CanvasRenderingContext2D | null {
        let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;
        if (labelStore) {
            let gmmCanvas = labelStore.layerNameToCanvas.get('GMM');
            return gmmCanvas?.getContext('2d') ?? null;
        }
        return null;
    }

    mouseDownFunction(event: MouseEvent, canvas: HTMLCanvasElement) {
        event.preventDefault();
        let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;

        if (labelStore) {
            if (event.which === 3) {
                return; // Skip right-clicks
            }

            const xy = getMousePos(event, labelStore);
            if (!xy) return;

            const x = Math.floor(xy.x) - Math.floor(1 / 2);
            const y = Math.floor(xy.y) - Math.floor(1 / 2);
            labelStore.setMouseIsDown(true);

            if (labelStore.bucketFill.active && !labelStore.magicStick.menuOpen) {
                bucketFillWorker(canvas!, x, y, labelStore);
                return;
            }

            const x2 = Math.floor(xy.x) - Math.floor(labelStore.penSize / 2);
            const y2 = Math.floor(xy.y) - Math.floor(labelStore.penSize / 2);

            if(labelStore.magicStick.menuOpen) {
                labelStore.closeAllMenus();
                labelStore.magicStick.overwriteClass = labelStore.pixelClassInfo;
                labelStore.magicStick.menuOpen = false;
                labelStore.magicStick.active = true;
                labelStore.magicStick.drawLayer = labelStore.selectedLayer;
                toggleCursor('wand')
                return;
            } 

            if (labelStore.drawingActive && labelStore.layerNameDrawerSettings.get(labelStore.selectedLayer)!.visible) {
                drawPixel(x2, y2, labelStore.classNumberToColors[labelStore.displayNameToClassNumber[labelStore.selectedClass]], labelStore);
            } else if (labelStore.eraserActive && labelStore.layerNameDrawerSettings.get(labelStore.selectedLayer)!.visible) {
                erasePixel(x2, y2, labelStore);
            } else if (labelStore.abStick.active) {
                drawAbPixel(x2, y2, labelStore.classNumberToColors[labelStore.displayNameToClassNumber[labelStore.selectedClass]], labelStore);
            } else if (labelStore.magicStick.active) {
                overDrawColor(x2, y2, labelStore.classNumberToColors[labelStore.displayNameToClassNumber[labelStore.selectedClass]], labelStore);
            }
        }
    }

    mouseUpFunction(event: MouseEvent) {
        event.preventDefault();
        let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;

        if (labelStore) {
            labelStore.setMouseIsDown(false);
            if (event.button === 0) {
                if (labelStore.bucketFill.active || labelStore.drawingActive || labelStore.eraserActive || labelStore.magicStick.active || labelStore.abStick.active) {
                    HistoryHandler.getInstance().pushToHistory();
                }
            }
        }
    }

    mouseMoveEvent(event: Event, gmmContext: CanvasRenderingContext2D | null) {
        event.preventDefault();
        let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;

        if (labelStore && labelStore.mouseIsDown) {
            const xy = getMousePos(event as MouseEvent, labelStore);
            if (!xy) return;

            let x = Math.floor(xy.x) - Math.floor(labelStore.penSize / 2);
            let y = Math.floor(xy.y) - Math.floor(labelStore.penSize / 2);

            if (labelStore.drawingActive && labelStore.layerNameDrawerSettings.get(labelStore.selectedLayer)!.visible) {
                drawPixel(x, y, labelStore.classNumberToColors[labelStore.displayNameToClassNumber[labelStore.selectedClass]], labelStore);
            } else if (labelStore.eraserActive && labelStore.layerNameDrawerSettings.get(labelStore.selectedLayer)!.visible) {
                erasePixel(x, y, labelStore);
            } else if (labelStore.abStick.active) {
                drawAbPixel(x, y, labelStore.classNumberToColors[labelStore.displayNameToClassNumber[labelStore.selectedClass]], labelStore);
            } else if (labelStore.magicStick.active) {
                overDrawColor(x, y, labelStore.classNumberToColors[labelStore.displayNameToClassNumber[labelStore.selectedClass]], labelStore);
            }
        }
    }

    addMouseDownListeners() {
        if (!ActionEventHandler.mousedownListener) {
            
            let canvas = ActionEventHandler.getInstance().getCanvas();
            if (canvas) {
                canvas.style.pointerEvents = 'auto';
                ['mousedown', 'touchstart'].forEach(modality => {
                    canvas!.addEventListener(modality, ActionEventHandler.getInstance().mouseDownHandler);
                });
                ActionEventHandler.mousedownListener = true;
            }
        }
    }

    addMouseUpListeners() {
        if (!ActionEventHandler.mouseupListener) {
           
            let body = document.querySelector('#labelContainer');
            if (body) {
                ['mouseup', 'touchend'].forEach(modality => {
                    body!.addEventListener(modality, ActionEventHandler.getInstance().mouseUpHandler);
                });
                ActionEventHandler.mouseupListener = true;
            }
        }
    }

    addMouseMoveEventListeners() {
        if (!ActionEventHandler.mousemoveListener) {
            
            let canvas = ActionEventHandler.getInstance().getCanvas();
            if (canvas) {
                ['mousemove', 'touchmove'].forEach(modality => {
                    canvas!.addEventListener(modality, ActionEventHandler.getInstance().mouseMoveHandler);
                });
                ActionEventHandler.mousemoveListener = true;
            }
        }
    }

    updateMouseListeners() {
        ActionEventHandler.getInstance().removeEventListeners();
        ActionEventHandler.getInstance().addMouseDownListeners();
        ActionEventHandler.getInstance().addMouseUpListeners();
        ActionEventHandler.getInstance().addMouseMoveEventListeners();
    }

    removeEventListeners() {
        let labelStore = ActionEventHandler.getInstance().canvasHandlerStore;
        if (labelStore) {
            labelStore.layerNameToCanvas.forEach((canvas: HTMLCanvasElement) => {
                ['mousedown', 'touchstart'].forEach(modality => {
                    canvas?.removeEventListener(modality, ActionEventHandler.getInstance().mouseDownHandler);
                });
                ['mouseup', 'touchend'].forEach(modality => {
                    canvas?.removeEventListener(modality, ActionEventHandler.getInstance().mouseUpHandler);
                });
                ['mousemove', 'touchmove'].forEach(modality => {
                    canvas?.removeEventListener(modality, ActionEventHandler.getInstance().mouseMoveHandler);
                });
            });
            ActionEventHandler.mousedownListener = false;
            ActionEventHandler.mouseupListener = false;
            ActionEventHandler.mousemoveListener = false;
        }
    }
}
