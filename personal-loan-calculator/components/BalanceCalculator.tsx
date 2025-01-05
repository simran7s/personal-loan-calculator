'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, Info } from 'lucide-react'
import { LoanEntry } from '@/types/loan'
import { LoanEntryDetails } from './LoanEntryDetails'

interface BalanceCalculatorProps {
  entries: LoanEntry[]
  calculatedEntries: LoanEntry[]
  setCalculatedEntries: (entries: LoanEntry[]) => void
}

type CompoundFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

const getCompoundsPerYear = (frequency: CompoundFrequency): number => {
  switch (frequency) {
    case 'daily': return 365
    case 'weekly': return 52
    case 'monthly': return 12
    case 'yearly': return 1
  }
}

interface CalculationEntry extends LoanEntry {
  balanceDateAmount: number
  isExpanded: boolean
}

const isLeapYearIncluded = (startDate: Date, endDate: Date): boolean => {
  for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
    if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
      const leapDay = new Date(year, 1, 29); // February 29th
      if (leapDay >= startDate && leapDay <= endDate) {
        return true;
      }
    }
  }
  return false;
}

const getDaysDifference = (startDate: Date, endDate: Date) => {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(24, 0, 0, 0)  // Set to the end of the day
  const differenceInTime = end.getTime() - start.getTime()
  return Math.floor(differenceInTime / (1000 * 3600 * 24))
}


export default function BalanceCalculator({ entries, calculatedEntries, setCalculatedEntries }: BalanceCalculatorProps) {
  const sortedEntries = useMemo(() => 
    [...entries].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [entries]
  )

  const earliestDate = useMemo(() => 
    sortedEntries.length > 0 ? sortedEntries[0].date : new Date(),
    [sortedEntries]
  )

  const [balanceDate, setBalanceDate] = useState('')
  const [interestRate, setInterestRate] = useState('11')
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFrequency>('monthly')
  const [finalBalance, setFinalBalance] = useState<number | null>(null)
  const [isAllExpanded, setIsAllExpanded] = useState(false)

  const calculateBalance = () => {
    const balanceDateObj = new Date(balanceDate)
    const newCalculations: CalculationEntry[] = []
    const rate = parseFloat(interestRate) / 100
    const compoundsPerYear = getCompoundsPerYear(compoundFrequency)

    let totalBorrowed = 0
    let totalPaid = 0

    sortedEntries.forEach((entry) => {
      const daysDifference = getDaysDifference(entry.date, balanceDateObj)
      const yearsElapsed = daysDifference / 365
      const compoundPeriods = compoundsPerYear * yearsElapsed
      const compoundFactor = Math.pow(1 + rate / compoundsPerYear, compoundPeriods)
      const balanceDateAmount = entry.amount * compoundFactor

      if (entry.type === 'borrowed') {
        totalBorrowed += balanceDateAmount
      } else {
        totalPaid += balanceDateAmount
      }

      const effectiveAnnualRate = (Math.pow(1 + rate / compoundsPerYear, compoundsPerYear) - 1) * 100


      newCalculations.push({
        ...entry,
        balanceDateAmount,
        isExpanded: false
      })
    })

    setCalculatedEntries(newCalculations)
    setFinalBalance(totalBorrowed - totalPaid)
  }


  const toggleExpand = (index: number) => {
    setCalculatedEntries(prev => 
      prev.map((entry, i) => 
        i === index ? { ...entry, isExpanded: !entry.isExpanded } : entry
      ) as CalculationEntry[]
    )
  }

  const toggleExpandAll = () => {
    setIsAllExpanded(!isAllExpanded)
    setCalculatedEntries(prev => 
      prev.map(entry => ({ ...entry, isExpanded: !isAllExpanded })) as CalculationEntry[]
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const setQuickDate = (months: number) => {
    const date = new Date(earliestDate)
    date.setMonth(date.getMonth() + months)
    setBalanceDate(date.toISOString().split('T')[0])
  }

  const InfoPopover = ({ content }: { content: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">{content}</PopoverContent>
    </Popover>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center">
            <Label htmlFor="balanceDate" className="text-sm font-medium">Balance Date</Label>
            <InfoPopover content="The date for which you want to calculate the balance. Quick action buttons are based on the earliest entry in the loan payments, or today's date if there are no entries." />
          </div>
          <div className="mt-1">
            <Input
              id="balanceDate"
              type="date"
              value={balanceDate}
              onChange={(e) => setBalanceDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <Button onClick={() => setBalanceDate(new Date().toISOString().split('T')[0])}>Today</Button>
          <Button onClick={() => setQuickDate(1)}>1 Month</Button>
          <Button onClick={() => setQuickDate(12)}>1 Year</Button>
          <Button onClick={() => setQuickDate(60)}>5 Years</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center">
            <Label htmlFor="interestRate" className="text-sm font-medium">Annual Interest Rate (%)</Label>
            <InfoPopover content="The yearly interest rate applied to the loan, expressed as a percentage." />
          </div>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <div className="flex items-center">
            <Label htmlFor="compoundFrequency" className="text-sm font-medium">Compound Frequency</Label>
            <InfoPopover content="How often the interest is compounded. This affects how quickly the interest grows over time." />
          </div>
          <Select value={compoundFrequency} onValueChange={(value) => setCompoundFrequency(value as CompoundFrequency)}>
            <SelectTrigger id="compoundFrequency" className="mt-1">
              <SelectValue placeholder="Select compound frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={calculateBalance} className="w-full">Calculate Balance</Button>
      {calculatedEntries.length > 0 && (
        <div className="mt-6 space-y-4">
          <Button onClick={toggleExpandAll} className="w-full">
            {isAllExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <div className="space-y-4">
            {calculatedEntries.map((entry, index) => (
              <Collapsible key={index} open={entry.isExpanded}>
                <CollapsibleTrigger asChild>
                  <div 
                    className="flex justify-between items-center cursor-pointer p-4 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    onClick={() => toggleExpand(index)}
                  >
                    <div>
                      <span className="font-medium">
                        {entry.date.toISOString().split('T')[0]} - 
                        <span className={entry.type === 'borrowed' ? 'text-red-500' : 'text-green-500'}>
                          {formatCurrency(entry.amount)}
                        </span> 
                        {' → '} 
                        <span className={entry.type === 'borrowed' ? 'text-red-500' : 'text-green-500'}>
                          {formatCurrency(entry.balanceDateAmount)}
                        </span>
                      </span>
                      {entry.description && (
                        <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                      )}
                    </div>
                    <ChevronDown className={`transition-transform duration-200 ${entry.isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-4 bg-white rounded-md shadow-inner border border-gray-200">
                    <LoanEntryDetails
                      entry={entry}
                      balanceDate={new Date(balanceDate)}
                      interestRate={parseFloat(interestRate)}
                      compoundFrequency={compoundFrequency}
                      getDaysDifference={getDaysDifference}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          <div className="mt-6 p-6 bg-gray-100 rounded-md shadow">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-semibold">Summary</h3>
              <InfoPopover content="This summary shows the result of calculating all loan and payment entries up to the specified balance date. Each entry's amount is adjusted for interest based on the time elapsed and the given interest rate. The final balance is the difference between the total borrowed amount (including accrued interest) and the total amount paid (including interest savings)." />
            </div>
            <div className="space-y-2">
              {calculatedEntries.map((entry, index) => (
                <div key={index} className={`flex justify-between ${entry.type === 'borrowed' ? 'text-red-500' : 'text-green-500'}`}>
                  <span>{entry.type === 'borrowed' ? 'Borrowed:' : 'Paid:'}</span>
                  <span>{formatCurrency(entry.balanceDateAmount)}</span>
                </div>
              ))}
              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className={`flex justify-between text-lg font-bold ${finalBalance && finalBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span>Final Balance:</span>
                  <span>{finalBalance !== null ? formatCurrency(Math.abs(finalBalance)) : '-'}</span>
                </div>
                {finalBalance !== null && (
                  <div className="text-right text-sm mt-1 font-medium">
                    {finalBalance > 0 ? '(Owed)' : '(In Credit)'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

