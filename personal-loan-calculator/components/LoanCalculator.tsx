'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import LoanEntryForm from '@/components/LoanEntryForm'
import LoanEntryList from '@/components/LoanEntryList'
import BalanceCalculator, { CalculationEntry } from '@/components/BalanceCalculator'
import { LoanEntry } from '@/types/loan'

export default function LoanCalculator() {
  const [entries, setEntries] = useState<LoanEntry[]>([])
  const [calculatedEntries, setCalculatedEntries] = useState<CalculationEntry[]>([])

  const addEntry = (entry: LoanEntry) => {
    setEntries([...entries, entry])
    setCalculatedEntries([]) // Clear calculated entries
  }

  const deleteEntry = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id))
    setCalculatedEntries([]) // Clear calculated entries
  }

  const editEntry = (id: number, updatedEntry: LoanEntry) => {
    setEntries(entries.map(entry => entry.id === id ? updatedEntry : entry))
    setCalculatedEntries([]) // Clear calculated entries
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Add Loan/Payment Entry</h2>
          <LoanEntryForm onAddEntry={addEntry} />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Loan/Payment Entries</h2>
          <LoanEntryList entries={entries} onDelete={deleteEntry} onEdit={editEntry} />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Balance Calculator</h2>
          <BalanceCalculator 
            entries={entries} 
            calculatedEntries={calculatedEntries}
            setCalculatedEntries={setCalculatedEntries}
          />
        </CardContent>
      </Card>
    </div>
  )
}

