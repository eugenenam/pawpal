import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import circle from '@turf/circle'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// Default center for the map (Brooklyn, NY)
const BROOKLYN_CENTER = [-73.9802, 40.6782]

export default function MapView({ pin, onPinChange, alertRadius, isPinMode, showRings }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  // Initialize map once — never re-runs because we guard with mapRef.current
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: BROOKLYN_CENTER,
      zoom: 13,
    })
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-left')
  }, [])

  // Pin placement on map click — re-registers when isPinMode or onPinChange change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleClick = (e) => {
      // Only place a pin when the user is in pin-placement mode
      if (!isPinMode) return
      const { lng, lat } = e.lngLat
      onPinChange({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [isPinMode, onPinChange])

  // Update marker position when pin changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !pin) return

    // Remove the old marker before placing a new one
    if (markerRef.current) markerRef.current.remove()

    markerRef.current = new mapboxgl.Marker({ color: '#16A34A' })
      .setLngLat([pin.lng, pin.lat])
      .addTo(map)

    map.flyTo({ center: [pin.lng, pin.lat], zoom: 14 })
  }, [pin])

  // Draw the radius circle around the pin using @turf/circle
  // Uses isStyleLoaded() + map.once('load', ...) pattern so it works whether
  // the style has already loaded or not
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function addRadiusLayers(geojson) {
      if (!map.getSource('radius')) {
        // First time — create source and both layers
        map.addSource('radius', { type: 'geojson', data: geojson })
        map.addLayer({
          id: 'radius-fill',
          type: 'fill',
          source: 'radius',
          paint: { 'fill-color': '#16A34A', 'fill-opacity': 0.08 },
        })
        map.addLayer({
          id: 'radius-line',
          type: 'line',
          source: 'radius',
          paint: { 'line-color': '#16A34A', 'line-width': 2, 'line-dasharray': [2, 2] },
        })
      } else {
        // Source already exists — just update the data
        map.getSource('radius').setData(geojson)
      }
    }

    if (!pin) return

    // Convert miles to kilometers (Turf expects km)
    const radiusKm = alertRadius * 1.60934
    // Turf uses GeoJSON order: [longitude, latitude]
    const geojson = circle([pin.lng, pin.lat], radiusKm, { units: 'kilometers' })

    if (map.isStyleLoaded()) {
      addRadiusLayers(geojson)
    } else {
      // map.once (not map.on) so the handler fires exactly once when the style loads
      map.once('load', () => addRadiusLayers(geojson))
    }
  }, [pin, alertRadius])

  return (
    <div
      data-testid="map-container"
      ref={containerRef}
      className="absolute inset-0"
      style={{ cursor: isPinMode ? 'crosshair' : 'grab' }}
    />
  )
}
