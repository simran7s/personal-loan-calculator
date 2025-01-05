import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface LoanEntryDetailsProps {
  entry: {
    date: Date
    amount: number
    type: 'borrowed' | 'paid'
    balanceDateAmount: number
  }
  balanceDate: Date
  interestRate: number
  compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  getDaysDifference: (startDate: Date, endDate: Date) => number
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const getCompoundsPerYear = (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): number => {
  switch (frequency) {
    case 'daily': return 365
    case 'weekly': return 52
    case 'monthly': return 12
    case 'yearly': return 1
  }
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

const InfoPopover = ({ content }: { content: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 -mt-1">
        <Info className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 text-sm">{content}</PopoverContent>
  </Popover>
)

export function LoanEntryDetails({ entry, balanceDate, interestRate, compoundFrequency, getDaysDifference }: LoanEntryDetailsProps) {
  const daysDifference = getDaysDifference(entry.date, balanceDate)
  const yearsElapsed = daysDifference / 365.25
  const compoundsPerYear = getCompoundsPerYear(compoundFrequency)
  const compoundPeriods = compoundsPerYear * yearsElapsed
  const rate = interestRate / 100
  const compoundFactor = Math.pow(1 + rate / compoundsPerYear, compoundPeriods)
  const effectiveAnnualRate = (Math.pow(1 + rate / compoundsPerYear, compoundsPerYear) - 1) * 100

  return (
    <div className="space-y-2">
      <p>
        <strong>Days Elapsed:</strong> {daysDifference}
        <InfoPopover content="The number of days between the entry date and the balance calculation date, accounting for leap years." />
      </p>
      <p className="text-sm text-gray-600">Calculation: {formatDate(entry.date)} till {formatDate(balanceDate)} = {daysDifference} days (including leap days)</p>
      {isLeapYearIncluded(entry.date, balanceDate) && (
        <p className="text-sm text-blue-600"><strong>Note:</strong> This period includes a leap year, which is accounted for in the calculation.</p>
      )}
      
      <p>
        <strong>Years Elapsed:</strong> {yearsElapsed.toFixed(4)}
        <InfoPopover content="The number of years between the entry date and the balance calculation date, used for interest calculations. This accounts for leap years by using an average of 365.25 days per year." />
      </p>
      <p className="text-sm text-gray-600">Calculation: {daysDifference} days / 365.25 days per year = {yearsElapsed.toFixed(4)} years</p>
      
      <p>
        <strong>Compounds per Year:</strong> {compoundsPerYear}
        <InfoPopover content={`The number of times interest is compounded per year based on the selected frequency (${compoundFrequency}).`} />
      </p>
      <p className="text-sm text-gray-600">Calculation: {compoundFrequency} compounding = {compoundsPerYear} times per year</p>
      
      <p>
        <strong>Compound Periods:</strong> {compoundPeriods.toFixed(2)}
        <InfoPopover content="The total number of times interest is compounded over the elapsed time period." />
      </p>
      <p className="text-sm text-gray-600">Calculation: {compoundsPerYear} (compounds per year) × {yearsElapsed.toFixed(4)} (years elapsed) = {compoundPeriods.toFixed(2)}</p>
      
      <p>
        <strong>Effective Annual Rate:</strong> {effectiveAnnualRate.toFixed(3)}%
        <InfoPopover content="The annual interest rate when taking into account the effect of compounding." />
      </p>
      <p className="text-sm text-gray-600">Calculation: (1 + {rate.toFixed(4)} / {compoundsPerYear})^{compoundsPerYear} - 1 = {(effectiveAnnualRate / 100).toFixed(4)}</p>
      
      <p>
        <strong>Compound Factor:</strong> {compoundFactor.toFixed(4)}
        <InfoPopover content="The factor by which the initial amount is multiplied to get the final amount after interest." />
      </p>
      <p className="text-sm text-gray-600">Calculation: (1 + {rate.toFixed(4)} / {compoundsPerYear})^{compoundPeriods.toFixed(2)} = {compoundFactor.toFixed(4)}</p>
      
      <p>
        <strong>Balance Date Amount:</strong> {formatCurrency(entry.balanceDateAmount)}
        <InfoPopover content="The final amount after applying interest to the initial entry amount." />
      </p>
      <p className="text-sm text-gray-600">Calculation: {formatCurrency(entry.amount)} × {compoundFactor.toFixed(4)} = {formatCurrency(entry.balanceDateAmount)}</p>
    </div>
  )
}

