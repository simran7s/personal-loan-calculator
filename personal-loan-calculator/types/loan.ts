export interface LoanEntry {
  id: number
  date: Date
  amount: number
  type: 'borrowed' | 'paid'
  description?: string
}

