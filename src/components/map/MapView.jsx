import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import circle from '@turf/circle'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const BROOKLYN_CENTER = [-73.9802, 40.6782]

export default function MapView({ pin, onPinChange, alertRadius, isPinMode, showRings }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  // Initialize map once
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

  // Set crosshair cursor on the canvas directly — container-div cursor is overridden by Mapbox
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const apply = () => {
      map.getCanvas().style.cursor = isPinMode ? 'crosshair' : ''
    }
    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [isPinMode])

  // Register click handler for pin placement
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handleClick = (e) => {
      if (!isPinMode) return
      const { lng, lat } = e.lngLat
      onPinChange({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
    }
    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [isPinMode, onPinChange])

  // Render/clear pin dot as a canvas circle layer
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function clearPin() {
      if (map.getLayer('pin-dot')) map.removeLayer('pin-dot')
      if (map.getSource('pin-point')) map.removeSource('pin-point')
    }

    function drawPin() {
      const data = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [pin.lng, pin.lat] },
      }
      if (map.getSource('pin-point')) {
        map.getSource('pin-point').setData(data)
      } else {
        map.addSource('pin-point', { type: 'geojson', data })
        map.addLayer({
          id: 'pin-dot',
          type: 'circle',
          source: 'pin-point',
          paint: {
            'circle-radius': 10,
            'circle-color': '#DC2626',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1,
          },
        })
      }
      map.flyTo({ center: [pin.lng, pin.lat], zoom: 14 })
    }

    if (map.isStyleLoaded()) {
      if (!pin) clearPin()
      else drawPin()
    } else {
      map.once('load', () => {
        if (!pin) clearPin()
        else drawPin()
      })
    }
  }, [pin])

  // Render/clear alert radius circle layer
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function clearRadius() {
      if (map.getLayer('radius-fill')) map.removeLayer('radius-fill')
      if (map.getLayer('radius-line')) map.removeLayer('radius-line')
      if (map.getSource('radius')) map.removeSource('radius')
    }

    function drawRadius() {
      const radiusKm = alertRadius * 1.60934
      const geojson = circle([pin.lng, pin.lat], radiusKm, { units: 'kilometers' })
      if (map.getSource('radius')) {
        map.getSource('radius').setData(geojson)
      } else {
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
      }
    }

    if (map.isStyleLoaded()) {
      if (!pin) clearRadius()
      else drawRadius()
    } else {
      map.once('load', () => {
        if (!pin) clearRadius()
        else drawRadius()
      })
    }
  }, [pin, alertRadius])

  return (
    <div
      data-testid="map-container"
      ref={containerRef}
      className="absolute inset-0"
    />
  )
}
