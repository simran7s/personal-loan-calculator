import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"
import { LoanEntry } from '@/types/loan'

interface LoanEntryListProps {
  entries: LoanEntry[]
  onDelete: (id: number) => void
  onEdit: (id: number, updatedEntry: LoanEntry) => void
}

export default function LoanEntryList({ entries, onDelete, onEdit }: LoanEntryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<LoanEntry | null>(null)

  const handleEdit = (entry: LoanEntry) => {
    setEditingId(entry.id)
    setEditForm(entry)
  }

  const handleSave = () => {
    if (editForm) {
      onEdit(editForm.id, editForm)
      setEditingId(null)
      setEditForm(null)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm(null)
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                {editingId === entry.id ? (
                  <Input
                    type="date"
                    value={editForm?.date.toISOString().split('T')[0]}
                    onChange={(e) => setEditForm({ ...editForm!, date: new Date(e.target.value) })}
                    className="w-full"
                  />
                ) : (
                  entry.date.toLocaleDateString()
                )}
              </TableCell>
              <TableCell>
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    value={editForm?.amount}
                    onChange={(e) => setEditForm({ ...editForm!, amount: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                ) : (
                  entry.amount.toFixed(2)
                )}
              </TableCell>
              <TableCell>
                {editingId === entry.id ? (
                  <select
                    value={editForm?.type}
                    onChange={(e) => setEditForm({ ...editForm!, type: e.target.value as 'borrowed' | 'paid' })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="borrowed">Borrowed</option>
                    <option value="paid">Paid</option>
                  </select>
                ) : (
                  entry.type
                )}
              </TableCell>
              <TableCell>
                {editingId === entry.id ? (
                  <Textarea
                    value={editForm?.description || ''}
                    onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                    className="w-full"
                    placeholder="Enter a description (optional)"
                  />
                ) : (
                  entry.description || '-'
                )}
              </TableCell>
              <TableCell>
                {editingId === entry.id ? (
                  <div className="space-x-2">
                    <Button size="sm" onClick={handleSave}>Save</Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(entry.id)}>Delete</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

