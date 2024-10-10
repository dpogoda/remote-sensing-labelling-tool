<script setup lang="ts">
import { useLabelCanvasStore } from '@/stores/canvasHandlerStore';
import * as L from 'leaflet';
import { ref, onMounted, type Ref, watch, shallowRef } from 'vue';
import 'leaflet/dist/leaflet.css';

const map: Ref<L.Map | null> = ref(null);
const mapBounds: Ref<L.LatLng[]> = ref([]);
const patchMapBounds: Ref<L.LatLng[]> = ref([]);
const latLngBounds: Ref<L.LatLngBounds | null> = ref(null);
const imageOverlayRef: Ref<L.ImageOverlay | null> = ref(null);


let savedState = {
    lat: 0,
    lng: 0,
    zoom: 0
};


const labelStore = useLabelCanvasStore();

watch(() => labelStore.mapActive, active => {
    if (!active) {
        hideMap();
    } else {
        resetMap();
        drawMap();
    }
});

watch(() => labelStore.currentMapLayer, () => {
    if (labelStore.mapActive) {
        resetMap();
        drawMap();
    }
});

watch(() => labelStore.currentImage, () => {
    savedState = {
        lat: 0,
        lng: 0,
        zoom: 0
    };
    resetMap(true);
    if (labelStore.mapActive) {
        drawMap();
    }
});

function resetMap(forgetState = false) {
    try {
        // save last state
        if (forgetState == false) {
            savedState = {
                lat: map.value!.getCenter().lat,
                lng: map.value!.getCenter().lng,
                zoom: map.value!.getZoom()
            };
        }
        map.value!.remove();
        map.value = null;
    } catch (error: any) {
    }
    if (map.value !== null) {
        map.value = null;
        latLngBounds.value = null;
        imageOverlayRef.value = null;
        patchMapBounds.value = [];
    }
}

function showContextMenu(lat: number, lng: number) {
    // For simplicity, using browser's context menu
    const navigate = confirm(`Do you want to navigate to this location on Google Maps?\nLatitude: ${lat}\nLongitude: ${lng}`);
    if (navigate) {
        window.open(`https://www.google.com/maps/?q=${lat},${lng}`, '_blank');
    }
}


function panScaleToMapZoom() {
    if (labelStore.panzoom) {
        return labelStore.panzoom.getScale() * 13 / 4
    }

}

function drawMap() {

    document.getElementById('map')!.style.display = 'block';
    document.getElementById('map')!.style.pointerEvents = 'auto';

    // @ts-ignore
    // document.getElementsByClassName('content')[0].style.display = 'none';

    const image = labelStore.listOfImages.find(image => image.fullTitle === labelStore.currentImage.fullTitle);

    if (map.value === null) {
        map.value = L.map('map', {
            center: [image!.leftLower[1], image!.leftLower[0]],
            zoom: 13
        });

        // let mapLink =
        //     '<a href="http://www.esri.com/">Esri</a>';
        // let wholink =
        //     'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        // L.tileLayer(
        //     'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        //     attribution: '&copy; ' + mapLink + ', ' + wholink,
        //     maxZoom: 19,
        // }).addTo(map_);

        switch (labelStore.currentMapLayer) {
            case 'OpenStreetMap':
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map.value);
                break;
            case 'Google Maps':
                L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.google.com">Google Maps</a>'
                }).addTo(map.value);
                break;
            case 'Google Satellite':
                L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.google.com">Google Maps</a>'
                }).addTo(map.value);
                break;

            default:
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map.value);
        }
        // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //     maxZoom: 19,
        //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        // }).addTo(map.value);

        map.value.on('contextmenu', (event) => {
            const { lat, lng } = event.latlng;
            showContextMenu(lat, lng);
        });


        latLngBounds.value = L.latLngBounds([
            [image!.leftLower[1], image!.leftLower[0]],
            [image!.rightUpper[1], image!.rightUpper[0]],
            // [65.52716011280192, 22.178610070089565],
            // [65.5334762650674, 22.193766993119137]
        ]);
        // let latLngBoundsPatch = L.latLngBounds(patchMapBounds.value);

        L.rectangle(latLngBounds.value, { fill: false }).addTo(map.value);

        // // L.rectangle(latLngBounds).addTo(map);
        // map.value.fitBounds(latLngBounds.value);

        // createOrUpdateImageOverlay();

    }

    if (savedState.lat === 0 && savedState.lng === 0 && savedState.zoom === 0) {
        map.value.setView([image!.leftLower[1], image!.leftLower[0]], 13);
    } else {
        map.value.setView([savedState.lat, savedState.lng], savedState.zoom);
    }
}

function hideMap() {
    if (map.value) {
        let center = map.value.getCenter();
        let zoom = map.value.getZoom();

        // Save these values for later
        savedState = {
            lat: center.lat,
            lng: center.lng,
            zoom: zoom
        };
    }
    document.getElementById('map')!.style.display = 'none';
    document.getElementById('map')!.style.pointerEvents = 'none';
}


</script>

<template>
    <div id="map"></div>
</template>

<style>
#map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* z-index: 1000; */
}
</style>