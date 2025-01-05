import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BalanceCalculator from '@/components/BalanceCalculator'
import { LoanEntry } from '@/types/loan'

// Mock the current date to ensure consistent test results
const mockDate = new Date('2024-01-01')
jest.spyOn(global, 'Date').mockImplementation(() => mockDate)

describe('BalanceCalculator', () => {
  const mockEntries: LoanEntry[] = [
    { id: 1, date: new Date('2023-01-01'), amount: 10000, type: 'borrowed' },
    { id: 2, date: new Date('2023-06-01'), amount: 5000, type: 'paid' },
  ]

  it('renders without crashing', () => {
    render(<BalanceCalculator entries={mockEntries} />)
    expect(screen.getByLabelText('Balance Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Annual Interest Rate (%)')).toBeInTheDocument()
    expect(screen.getByLabelText('Compound Frequency')).toBeInTheDocument()
  })

  it('calculates balance correctly', () => {
    render(<BalanceCalculator entries={mockEntries} />)
    
    // Set balance date
    fireEvent.change(screen.getByLabelText('Balance Date'), { target: { value: '2024-01-01' } })
    
    // Set interest rate
    fireEvent.change(screen.getByLabelText('Annual Interest Rate (%)'), { target: { value: '10' } })
    
    // Set compound frequency
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Monthly'))
    
    // Click calculate button
    fireEvent.click(screen.getByText('Calculate Balance'))
    
    // Check if the calculation results are displayed
    expect(screen.getByText(/Final Balance:/)).toBeInTheDocument()
    
    // Check if the borrowed amount is displayed in red
    const borrowedAmount = screen.getByText(/\$10,000\.00/)
    expect(borrowedAmount).toHaveClass('text-red-500')
    
    // Check if the paid amount is displayed in green
    const paidAmount = screen.getByText(/\$5,000\.00/)
    expect(paidAmount).toHaveClass('text-green-500')
  })

  it('toggles entry details when clicked', () => {
    render(<BalanceCalculator entries={mockEntries} />)
    
    // Calculate balance first
    fireEvent.change(screen.getByLabelText('Balance Date'), { target: { value: '2024-01-01' } })
    fireEvent.click(screen.getByText('Calculate Balance'))
    
    // Click on the first entry
    fireEvent.click(screen.getAllByText(/2023-01-01/)[0])
    
    // Check if details are displayed
    expect(screen.getByText(/Time elapsed:/)).toBeInTheDocument()
    
    // Click again to collapse
    fireEvent.click(screen.getAllByText(/2023-01-01/)[0])
    
    // Check if details are hidden
    expect(screen.queryByText(/Time elapsed:/)).not.toBeInTheDocument()
  })

  it('expands all entries when "Expand All" is clicked', () => {
    render(<BalanceCalculator entries={mockEntries} />)
    
    // Calculate balance first
    fireEvent.change(screen.getByLabelText('Balance Date'), { target: { value: '2024-01-01' } })
    fireEvent.click(screen.getByText('Calculate Balance'))
    
    // Click "Expand All"
    fireEvent.click(screen.getByText('Expand All'))
    
    // Check if all entries are expanded
    expect(screen.getAllByText(/Time elapsed:/).length).toBe(2)
    
    // Click "Collapse All"
    fireEvent.click(screen.getByText('Collapse All'))
    
    // Check if all entries are collapsed
    expect(screen.queryByText(/Time elapsed:/)).not.toBeInTheDocument()
  })
})

