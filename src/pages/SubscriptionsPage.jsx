import { useState } from 'react'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { AddEditSubscriptionModal } from '@/components/AddEditSubscriptionModal'
import { SubscriptionCard } from '@/components/SubscriptionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search, Filter, LayoutGrid, List, Trash2, Edit } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { useAuth } from '@/context/AuthContext'

/**
 * Subscriptions management page with table and card views
 */
export function SubscriptionsPage() {
  const { user } = useAuth()
  const { subscriptions, loading, createSubscription, updateSubscription, deleteSubscription } = useSubscriptions()
  const [viewMode, setViewMode] = useState('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [daysFilter, setDaysFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Get unique categories
  const categories = ['all', ...new Set(subscriptions.map((s) => s.category).filter(Boolean))]

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    // Search filter
    if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Category filter
    if (categoryFilter !== 'all' && sub.category !== categoryFilter) {
      return false
    }

    // Days filter
    if (daysFilter !== 'all' && sub.renewal_date) {
      const daysUntil = differenceInDays(new Date(sub.renewal_date), new Date())
      const daysNum = parseInt(daysFilter)
      if (daysNum === 7 && daysUntil > 7) return false
      if (daysNum === 30 && daysUntil > 30) return false
      if (daysNum === 90 && daysUntil > 90) return false
    }

    return true
  })

  const handleAdd = () => {
    setEditingSubscription(null)
    setModalOpen(true)
  }

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription)
    setModalOpen(true)
  }

  const handleSave = async (data) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, data)
    } else {
      await createSubscription(data)
    }
    setModalOpen(false)
    setEditingSubscription(null)
  }

  const handleDeleteClick = (subscription) => {
    setDeleteConfirm(subscription)
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      await deleteSubscription(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`
  }

  const calculateMonthlyTotal = () => {
    return filteredSubscriptions.reduce((total, sub) => {
      if (sub.cycle === 'monthly') {
        return total + parseFloat(sub.price)
      } else {
        return total + parseFloat(sub.price) / 12
      }
    }, 0)
  }

  const calculateYearlyTotal = () => {
    return filteredSubscriptions.reduce((total, sub) => {
      if (sub.cycle === 'yearly') {
        return total + parseFloat(sub.price)
      } else {
        return total + parseFloat(sub.price) * 12
      }
    }, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading subscriptions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Subscriptions</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Subscriptions</p>
          <p className="text-2xl font-bold">{filteredSubscriptions.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Monthly Total</p>
          <p className="text-2xl font-bold">${calculateMonthlyTotal().toFixed(2)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Yearly Projection</p>
          <p className="text-2xl font-bold">${calculateYearlyTotal().toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.filter((c) => c !== 'all').map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Select value={daysFilter} onChange={(e) => setDaysFilter(e.target.value)}>
          <option value="all">All Renewals</option>
          <option value="7">Next 7 days</option>
          <option value="30">Next 30 days</option>
          <option value="90">Next 90 days</option>
        </Select>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="cards">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="table">
              <List className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No subscriptions found</p>
          <p className="text-sm">Add your first subscription to get started</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => {
                const daysUntil = subscription.renewal_date
                  ? differenceInDays(new Date(subscription.renewal_date), new Date())
                  : null

                return (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>{formatPrice(subscription.price)}</TableCell>
                    <TableCell className="capitalize">{subscription.cycle}</TableCell>
                    <TableCell>{subscription.category || '-'}</TableCell>
                    <TableCell>
                      {subscription.renewal_date ? (
                        <span className={daysUntil !== null && daysUntil <= 7 ? 'text-orange-600 font-medium' : ''}>
                          {format(new Date(subscription.renewal_date), 'MMM d, yyyy')}
                          {daysUntil !== null && daysUntil >= 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({daysUntil} days)
                            </span>
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(subscription)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(subscription)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditSubscriptionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        subscription={editingSubscription}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

