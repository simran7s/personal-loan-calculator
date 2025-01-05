'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Info } from 'lucide-react'
import { LoanEntry } from '@/types/loan'

interface LoanEntryFormProps {
  onAddEntry: (entry: LoanEntry) => void
}

export default function LoanEntryForm({ onAddEntry }: LoanEntryFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'borrowed' | 'paid'>('borrowed')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const [year, month, day] = date.split('-').map(Number)
    onAddEntry({
      id: Date.now(),
      date: new Date(year, month - 1, day),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      type,
      description: description.trim() || undefined,
    })
    setDate('')
    setAmount('')
    setType('borrowed')
    setDescription('')
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center">
          <Label htmlFor="date" className="text-sm font-medium">Date</Label>
          <InfoPopover content="The date when the loan was borrowed or payment was made." />
        </div>
        <Input
          id="date"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <div className="flex items-center">
          <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
          <InfoPopover content="The amount of money borrowed or paid back." />
        </div>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            const regex = /^\d*\.?\d{0,2}$/;
            if (regex.test(value)) {
              setAmount(value);
            }
          }}
          onBlur={() => {
            setAmount(parseFloat(amount).toFixed(2));
          }}
          required
          className="mt-1"
        />
      </div>
      <div>
        <div className="flex items-center">
          <Label className="text-sm font-medium">Type</Label>
          <InfoPopover content="Specify whether this entry is for borrowing money or paying it back." />
        </div>
        <RadioGroup value={type} onValueChange={(value) => setType(value as 'borrowed' | 'paid')} className="mt-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="borrowed" id="borrowed" />
            <Label htmlFor="borrowed">Borrowed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label htmlFor="paid">Paid</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <div className="flex items-center">
          <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
          <InfoPopover content="Add an optional description or note for this loan/payment entry." />
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description (optional)"
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full">Add Entry</Button>
    </form>
  )
}

