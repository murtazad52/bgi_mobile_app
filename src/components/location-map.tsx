import React from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

import { radius as r } from '@/lib/theme';

type Props = {
  eventLat: number;
  eventLng: number;
  eventRadius: number;
  eventName: string;
  userLat?: number;
  userLng?: number;
  height?: number;
};

function buildHtml(p: Required<Props>): string {
  const { eventLat, eventLng, eventRadius, eventName, userLat, userLng } = p;
  const hasUser = !isNaN(userLat) && !isNaN(userLng);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;}
  body{background:#EEF4F1;}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<script>
var map = L.map('map', { zoomControl: true, attributionControl: false });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

var eventIcon = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;background:#1B5B49;border:3px solid #E6C760;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
  iconSize: [20, 20], iconAnchor: [10, 10]
});
var eventMarker = L.marker([${eventLat}, ${eventLng}], { icon: eventIcon }).addTo(map);
eventMarker.bindPopup(${JSON.stringify(eventName)});

L.circle([${eventLat}, ${eventLng}], {
  radius: ${eventRadius},
  color: '#1B5B49', weight: 2,
  fillColor: '#1B5B49', fillOpacity: 0.10
}).addTo(map);

${
  hasUser
    ? `var userIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(59,130,246,0.25)"></div>',
  iconSize: [14, 14], iconAnchor: [7, 7]
});
L.marker([${userLat}, ${userLng}], { icon: userIcon }).addTo(map).bindPopup('Your location');
var bounds = L.latLngBounds([[${eventLat},${eventLng}],[${userLat},${userLng}]]);
map.fitBounds(bounds, { padding: [48, 48] });`
    : `map.setView([${eventLat}, ${eventLng}], 15);`
}
<\/script>
</body>
</html>`;
}

export function LocationMap({ eventLat, eventLng, eventRadius, eventName, userLat, userLng, height = 240 }: Props) {
  const html = buildHtml({
    eventLat,
    eventLng,
    eventRadius,
    eventName,
    userLat: userLat ?? NaN,
    userLng: userLng ?? NaN,
    height,
  });

  return (
    <View style={[styles.wrapper, { height }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: r.xl,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#EEF4F1',
  },
});
