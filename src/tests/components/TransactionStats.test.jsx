import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionStats } from '../../components/transactions/TransactionStats'

const transactions = [
  { id: 'tx-1', type: 'income', amount: 2000 },
  { id: 'tx-2', type: 'expense', amount: 500 },
  { id: 'tx-3', type: 'expense', amount: 300 },
]

describe('TransactionStats', () => {
  it('berekent en toont totale inkomsten correct', () => {
    render(<TransactionStats transactions={transactions} />)
    expect(screen.getByText(/inkomsten/i)).toBeInTheDocument()
    expect(screen.getByText('↑ €2000.00')).toBeInTheDocument()
  })

  it('berekent en toont totale uitgaven correct', () => {
    render(<TransactionStats transactions={transactions} />)
    expect(screen.getByText(/uitgaven/i)).toBeInTheDocument()
    expect(screen.getByText('↓ €800.00')).toBeInTheDocument()
  })

  it('berekent en toont positieve balans correct', () => {
    render(<TransactionStats transactions={transactions} />)
    expect(screen.getByText(/balans/i)).toBeInTheDocument()
    expect(screen.getByText('= €1200.00')).toBeInTheDocument()
  })

  it('toont negatieve balans als uitgaven hoger zijn dan inkomsten', () => {
    const roodTransactions = [
      { id: 'tx-1', type: 'income', amount: 100 },
      { id: 'tx-2', type: 'expense', amount: 500 },
    ]
    render(<TransactionStats transactions={roodTransactions} />)
    expect(screen.getByText('= €400.00')).toBeInTheDocument()
  })

  it('toont nullen bij lege transactielijst', () => {
    render(<TransactionStats transactions={[]} />)
    const nullen = screen.getAllByText(/€0\.00/)
    expect(nullen).toHaveLength(3)
  })
})
