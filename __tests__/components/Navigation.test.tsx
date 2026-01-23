import { render, screen } from '@testing-library/react'
import Navigation from '@/components/Navigation'

describe('Navigation Component', () => {
  it('renders navigation element', () => {
    render(<Navigation />)
    
    // Check if navigation element is present
    const navElement = screen.getByRole('navigation')
    expect(navElement).toBeInTheDocument()
  })

  it('renders the logo image', () => {
    render(<Navigation />)
    
    // Check if logo is present
    const logo = screen.getByAltText(/Externally Yours Productions/i)
    expect(logo).toBeInTheDocument()
  })
})
