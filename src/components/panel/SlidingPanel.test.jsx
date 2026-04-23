import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SlidingPanel from './SlidingPanel'

describe('SlidingPanel', () => {
  it('renders children when open', () => {
    render(<SlidingPanel open={true} onClose={vi.fn()}><div>Panel Content</div></SlidingPanel>)
    expect(screen.getByText('Panel Content')).toBeInTheDocument()
  })

  it('has translate-x-0 class when open', () => {
    const { container } = render(<SlidingPanel open={true} onClose={vi.fn()}><div /></SlidingPanel>)
    expect(container.firstChild).toHaveClass('translate-x-0')
  })

  it('has translate-x-full class when closed', () => {
    const { container } = render(<SlidingPanel open={false} onClose={vi.fn()}><div /></SlidingPanel>)
    expect(container.firstChild).toHaveClass('translate-x-full')
  })
})
