import { render, screen } from '@testing-library/react'
import { Layout } from './Layout'

describe('Layout', () => {
  it('renders children', () => {
    render(
      <Layout>
        <div data-testid="child">Content</div>
      </Layout>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('has main element', () => {
    render(<Layout>Test</Layout>)

    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
