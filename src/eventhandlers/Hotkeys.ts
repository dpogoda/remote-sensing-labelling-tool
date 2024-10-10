import { useLabelCanvasStore } from "@/stores/canvasHandlerStore";
import { useSettingsStore } from "@/stores/settingStore";
import type { CanvasStore } from "@/types";
import { ActionEventHandler } from "./ActionEventHandler";
import { set } from "lodash";
import { HistoryHandler } from "./HistoryHandler";
import { prefillAutofill } from "@/canvashandlers/drawingtools/autofillTool";
import { CursorShadowHandler } from "./CursorShadowHandler";

export class HotkeyHandler {

    static instance: HotkeyHandler | null = null;
    static pressedKeys: string[] = [];
    static combiHitPerformed = false;

    settingsStore: any = null;
    canvasHandlerStore: CanvasStore | null = null;

    constructor() {
        if (HotkeyHandler.instance) {
            return HotkeyHandler.instance;
        } else {
            // add event listeners
            this.settingsStore = useSettingsStore();
            this.canvasHandlerStore = useLabelCanvasStore();

            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
        }
    }

    static getInstance() {
        if (!HotkeyHandler.instance) {
            HotkeyHandler.instance = new HotkeyHandler();
        }
        return HotkeyHandler.instance;
    }

    handleKeyUp(event: KeyboardEvent) {
        if (HotkeyHandler.getInstance().canvasHandlerStore?.saveMenuOpen) {
            return;
        }
        event.preventDefault();

        HotkeyHandler.pressedKeys = HotkeyHandler.pressedKeys.filter((key) => key !== event.key || key === 'Meta');

        if (event.key === 'Meta') {
            HotkeyHandler.pressedKeys = [];
        }

        let store = HotkeyHandler.getInstance().canvasHandlerStore;

        if (store) {

            if (event.key === 'Tab') {
                store.autofillColor = new Uint8ClampedArray([0, 0, 0, 0]);
                store.autofillReferencePixel = [];
                store.intensityFillerMenuOpen = false;
                // clear canvas 
                const autofillCanvas = document.getElementById('autofill') as HTMLCanvasElement;
                const autofillCtx = autofillCanvas.getContext('2d');
                autofillCtx!.clearRect(0, 0, autofillCanvas.width, autofillCanvas.height);

            }
        }

        HotkeyHandler.combiHitPerformed = false;

    }

    handleKeyDown(event: KeyboardEvent) {
        if (HotkeyHandler.getInstance().canvasHandlerStore?.saveMenuOpen) {
            return;
        }
        event.preventDefault();

        if (!HotkeyHandler.pressedKeys.includes(event.key)) {
            HotkeyHandler.pressedKeys.push(event.key);
        }

        if (HotkeyHandler.pressedKeys.includes('Meta')) {
            HotkeyHandler.pressedKeys = [];
            return;
        }

        let store = HotkeyHandler.getInstance().canvasHandlerStore;
        if (store) {

            // edge case 'Tab'
            if (HotkeyHandler.pressedKeys.length === 1) {
                if (HotkeyHandler.pressedKeys[0] === 'Tab' && store.layerType === 'RGB') {
                    if (!store.intensityFillerMenuOpen && CursorShadowHandler.getInstance().cursorShadowPosition) {
                        store.intensityFillerMenuOpen = true;
                        store.autofillXY = CursorShadowHandler.getInstance().cursorShadowPosition!;
                        prefillAutofill(store.autofillTolerance, store);

                    }
                    return;
                }

                let hks = HotkeyHandler.getInstance().settingsStore.hotKeys;
                for (let i = 0; i < hks.length; i++) {
                    let hksParsed = JSON.parse(hks[i].value);
                    if (hks[i].type === 'string[]' && hksParsed.length === 1) {
                        if (hksParsed[0] === HotkeyHandler.pressedKeys[0]) {
                            HotkeyHandler.getInstance().performAction(hks[i].name);
                            return;
                        }
                    }
                }
            }


            if (HotkeyHandler.pressedKeys.length === 2 && HotkeyHandler.combiHitPerformed === false) {

                HotkeyHandler.combiHitPerformed = true;
                let hks = HotkeyHandler.getInstance().settingsStore.hotKeys;
                for (let i = 0; i < hks.length; i++) {
                    let hksParsed = JSON.parse(hks[i].value);
                    hksParsed.sort();
                    HotkeyHandler.pressedKeys.sort();
                    if (hks[i].type === 'string[]' && hksParsed.length === 2) {
                        if (hksParsed[0] == HotkeyHandler.pressedKeys[0] && hksParsed[1] == HotkeyHandler.pressedKeys[1]) {
                            HotkeyHandler.getInstance().performAction(hks[i].name);
                            return;
                        }
                    }
                }
            }
        }
    }

    async performAction(hotKeyName: string) {
        let labelStore = HotkeyHandler.getInstance().canvasHandlerStore;
        if (labelStore) {
            if (!labelStore.magicStick.menuOpen && !labelStore.abStick.menuOpen && !labelStore.bucketFill.menuOpen && !labelStore.mapActive && !labelStore.saveMenuOpen) {
                switch (hotKeyName) {
                    case 'hk_toggle_pen':
                        labelStore.activateTool('simpledraw')
                        break;
                    case 'hk_toggle_eraser':
                        labelStore.activateTool('eraser')
                        break;
                    case 'hk_toggle_pan':
                        labelStore.activateTool('pan')
                        break;
                    case 'hk_toggle_bucket_fill':
                        labelStore.activateTool('bucket')
                        break;
                    case 'hk_toggle_magic_stick':
                        labelStore.activateTool('wand')
                        break;
                    case 'hk_toggle_ab_stick':
                        labelStore.activateTool('ab')
                        break;
                    case 'hk_cancel':
                        labelStore.closeAllMenus();
                        break;
                    case 'hk_undo':
                        HistoryHandler.getInstance().undo();
                        break;
                    case 'hk_redo':
                        HistoryHandler.getInstance().redo();
                        break;
                    case 'hk_save':
                        labelStore.saveState(labelStore.shortNote, labelStore.longNote);
                        break;
                    case 'hk_incr_pen_size':
                        labelStore.incrPenSize();
                        break;
                    case 'hk_decr_pen_size':
                        labelStore.decrPenSize();
                        break;
                    case 'hk_toggle_norm':
                        labelStore.toggleNormalization();
                        break;
                    case 'hk_map':
                        labelStore.mapActive = !labelStore.mapActive;
                        break;
                }
            } else {
                if (hotKeyName === 'hk_map') {
                    labelStore.mapActive = !labelStore.mapActive;
                }
            }

            if (hotKeyName === 'hk_undo' || hotKeyName === 'hk_redo') {
                setTimeout(() => {
                    HotkeyHandler.combiHitPerformed = false;
                }, 200);
            }
        }
    }

}