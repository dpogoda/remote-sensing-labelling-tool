import { useLabelCanvasStore } from "@/stores/canvasHandlerStore";
import type { CanvasStore } from "@/types";
import { getHexStringAt, getMousePos } from "@/utils/helpers/common";

export class CursorShadowHandler {

    static instance: CursorShadowHandler | null = null;

    canvas: HTMLCanvasElement | null = null;
    cursorShadowPosition: { x: number, y: number } | null = null;
    canvasHandlerStore: CanvasStore | null = null;

    constructor() {
        if (CursorShadowHandler.instance) {
            return CursorShadowHandler.instance;
        }
        this.canvasHandlerStore = useLabelCanvasStore();
    }

    static getInstance() {
        if (!CursorShadowHandler.instance) {
            CursorShadowHandler.instance = new CursorShadowHandler();
        }
        return CursorShadowHandler.instance
    }

    /**
     * Adjusts the cursor shadow based on the pen size
     * @returns 
     */
    updateCursorShadow() {
        let labelCanvasStore = CursorShadowHandler.getInstance().canvasHandlerStore;
        let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
        let cursorContext = cursorCanvas!.getContext('2d');
        if (labelCanvasStore) {
            if ((labelCanvasStore.magicStick.active || labelCanvasStore.bucketFill.active || labelCanvasStore.abStick.active || labelCanvasStore.drawingActive || labelCanvasStore.eraserActive) && CursorShadowHandler.getInstance().cursorShadowPosition) {
                const xy = CursorShadowHandler.getInstance().cursorShadowPosition;
                if (!xy) return;

                let penSize = labelCanvasStore.bucketFill.active ? 1 : labelCanvasStore.penSize;

                const x = Math.floor(xy.x) - Math.floor(penSize / 2);
                const y = Math.floor(xy.y) - Math.floor(penSize / 2);
                cursorContext!.clearRect(0, 0, cursorCanvas!.width, cursorCanvas!.height);
                cursorContext!.fillStyle = 'lime';
                cursorContext!.fillRect(x, y, penSize, penSize);
            }
        }
    }


    mouseMoveEvent(e: Event, cursorCanvas: HTMLCanvasElement, cursorContext: CanvasRenderingContext2D | null) {
        e.preventDefault();
        let labelCanvasStore = CursorShadowHandler.getInstance().canvasHandlerStore;
        if (labelCanvasStore) {
            if (labelCanvasStore.selectedLayer) {
                const mouseEvent = e as MouseEvent;
                const xy = getMousePos(mouseEvent, labelCanvasStore);
                if (!xy) return;
                CursorShadowHandler.getInstance().cursorShadowPosition = { x: xy.x, y: xy.y };
                const x = Math.floor(xy.x) - Math.floor(1 / 2);
                const y = Math.floor(xy.y) - Math.floor(1 / 2);

                let penSize = labelCanvasStore.bucketFill.active ? 1 : labelCanvasStore.penSize;

                const x2 = Math.floor(xy.x) - Math.floor(penSize / 2);
                const y2 = Math.floor(xy.y) - Math.floor(penSize / 2);
                // cursorShadowPosition = { x: x2, y: y2 };
                cursorContext!.clearRect(0, 0, cursorCanvas!.width, cursorCanvas!.height);
                if (labelCanvasStore.magicStick.menuOpen || labelCanvasStore.magicStick.active || labelCanvasStore.drawingActive || labelCanvasStore.bucketFill.active || labelCanvasStore.eraserActive || labelCanvasStore.abStick.active) {
                    // fill rect
                    cursorContext!.fillStyle = 'lime';
                    if (labelCanvasStore.bucketFill.active) {
                        cursorContext!.fillRect(x2, y2, 1, 1);
                        for (let i = -3; i <= 3; i++) {
                            cursorContext!.fillRect(x2 + i, y2, 1, 1);
                            cursorContext!.fillRect(x2, y2 + i, 1, 1);
                        }
                    } else {
                        if (!labelCanvasStore.magicStick.menuOpen) {
                            cursorContext!.fillRect(x2, y2, penSize, penSize);
                        } else {
                            cursorContext!.fillRect(x, y, 1, 1);
                        }
                    }
                }

                labelCanvasStore.pixelClassInfo = getHexStringAt(x, y, labelCanvasStore).hex;
            }
        }
    }

    addMouseOverContainer() {

        let labelContainer = document.getElementById('labelContainer');
        let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
        cursorCanvas!.style.position = 'absolute';
        cursorCanvas!.style.top = '0';
        cursorCanvas.style.left = '0';
        cursorCanvas.style.opacity = '0.4';
        cursorCanvas.style.imageRendering = 'pixelated';
        cursorCanvas.style.pointerEvents = 'none';
        let cursorContext = cursorCanvas!.getContext('2d');

        if (labelContainer) {
            ['mousemove', 'touchmove'].forEach((event) => {
                labelContainer!.addEventListener(event, (e) => {
                    CursorShadowHandler.getInstance().mouseMoveEvent(e, cursorCanvas, cursorContext);
                });
            });
        }
    }

    removeMouseOverContainer() {
        let cursorCanvas = document.getElementById("cursorShadow") as HTMLCanvasElement;
        let cursorContext = cursorCanvas!.getContext('2d');
        let labelContainer = document.getElementById('labelContainer');
        if (labelContainer) {
            ['mousemove', 'touchmove'].forEach((event) => {
                labelContainer!.removeEventListener(event, (e) => {
                    CursorShadowHandler.getInstance().mouseMoveEvent(e, cursorCanvas, cursorContext);
                });
            });
        }
    }
}


