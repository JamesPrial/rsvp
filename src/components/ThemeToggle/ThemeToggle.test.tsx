import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../../context'
import { ThemeToggle } from './ThemeToggle'

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    renderWithTheme()

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    renderWithTheme()

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('toggles theme on click', () => {
    renderWithTheme()

    const button = screen.getByRole('button')
    const initialLabel = button.getAttribute('aria-label')

    fireEvent.click(button)

    expect(button.getAttribute('aria-label')).not.toBe(initialLabel)
  })
})
