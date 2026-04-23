import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StepIndicator from './StepIndicator'

describe('StepIndicator', () => {
  it('displays current and total steps', () => {
    render(<StepIndicator current={2} total={3} />)
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
  })
})
