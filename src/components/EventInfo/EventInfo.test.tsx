import { render, screen } from '@testing-library/react'
import { EventInfo } from './EventInfo'

describe('EventInfo', () => {
  const defaultProps = {
    title: 'Test Event',
    date: '2026-03-15T18:00:00',
    location: '123 Main St',
    description: 'A wonderful event',
  }

  it('renders event title', () => {
    render(<EventInfo {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'Test Event' })).toBeInTheDocument()
  })

  it('renders location', () => {
    render(<EventInfo {...defaultProps} />)

    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<EventInfo {...defaultProps} />)

    expect(screen.getByText('A wonderful event')).toBeInTheDocument()
  })

  it('formats date correctly', () => {
    render(<EventInfo {...defaultProps} />)

    // Check that date labels exist
    expect(screen.getByText('When')).toBeInTheDocument()
    expect(screen.getByText('Where')).toBeInTheDocument()
  })

  it('does not render description if empty', () => {
    render(<EventInfo {...defaultProps} description="" />)

    const paragraphs = screen.queryAllByRole('paragraph')
    expect(paragraphs).toHaveLength(0)
  })
})
