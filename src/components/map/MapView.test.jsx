import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapView from './MapView'

// Vitest v4 requires constructor mocks to use the `function` keyword (not arrow functions)
// when the mock will be called with `new`
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(function () {
      return {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
        remove: vi.fn(),
        addControl: vi.fn(),
        flyTo: vi.fn(),
        addSource: vi.fn(),
        addLayer: vi.fn(),
        getSource: vi.fn().mockReturnValue(null),
        getLayer: vi.fn().mockReturnValue(null),
        removeLayer: vi.fn(),
        removeSource: vi.fn(),
        isStyleLoaded: vi.fn().mockReturnValue(false),
      }
    }),
    Marker: vi.fn(function () {
      return {
        setLngLat: vi.fn().mockReturnThis(),
        addTo: vi.fn().mockReturnThis(),
        remove: vi.fn(),
      }
    }),
    NavigationControl: vi.fn(function () {}),
    accessToken: '',
  },
}))

describe('MapView', () => {
  it('renders the map container', () => {
    render(
      <MapView
        pin={null}
        onPinChange={vi.fn()}
        alertRadius={2}
        isPinMode={false}
        showRings={false}
      />
    )
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('applies crosshair cursor in pin mode', () => {
    render(
      <MapView
        pin={null}
        onPinChange={vi.fn()}
        alertRadius={2}
        isPinMode={true}
        showRings={false}
      />
    )
    expect(screen.getByTestId('map-container')).toHaveStyle({ cursor: 'crosshair' })
  })
})
