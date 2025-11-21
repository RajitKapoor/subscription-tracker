import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

/**
 * Modal component for adding or editing a subscription
 * @param {object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onOpenChange - Callback when open state changes
 * @param {object|null} props.subscription - Subscription to edit (null for new)
 * @param {function} props.onSave - Callback with subscription data
 */
export function AddEditSubscriptionModal({ open, onOpenChange, subscription, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    renewal_date: '',
    cycle: 'monthly',
    category: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Populate form when editing
  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name || '',
        price: subscription.price?.toString() || '',
        renewal_date: subscription.renewal_date || '',
        cycle: subscription.cycle || 'monthly',
        category: subscription.category || '',
        notes: subscription.notes || '',
      })
    } else {
      // Reset form for new subscription
      setFormData({
        name: '',
        price: '',
        renewal_date: '',
        cycle: 'monthly',
        category: '',
        notes: '',
      })
    }
    setError(null)
  }, [subscription, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required')
      }
      if (!formData.price || parseFloat(formData.price) < 0) {
        throw new Error('Valid price is required')
      }

      const subscriptionData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        renewal_date: formData.renewal_date || null,
        cycle: formData.cycle,
        category: formData.category.trim() || null,
        notes: formData.notes.trim() || null,
      }

      await onSave(subscriptionData)
      onOpenChange(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Netflix, Spotify, etc."
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="9.99"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cycle">Billing Cycle</Label>
                <Select
                  id="cycle"
                  value={formData.cycle}
                  onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                  disabled={loading}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="renewal_date">Renewal Date</Label>
                <Input
                  id="renewal_date"
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Entertainment, Software, etc."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : subscription ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

