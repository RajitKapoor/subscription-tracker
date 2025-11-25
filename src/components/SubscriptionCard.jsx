import { format, differenceInDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Card component for displaying a subscription
 * @param {object} props - Component props
 * @param {object} props.subscription - Subscription data
 * @param {function} props.onEdit - Callback when edit is clicked
 * @param {function} props.onDelete - Callback when delete is clicked
 */
export function SubscriptionCard({ subscription, onEdit, onDelete }) {
  const formatPrice = (price, cycle) => {
    return `$${parseFloat(price).toFixed(2)}/${cycle === 'yearly' ? 'yr' : 'mo'}`
  }

  const getRenewalInfo = () => {
    if (!subscription.renewal_date) return null

    const renewalDate = new Date(subscription.renewal_date)
    const daysUntil = differenceInDays(renewalDate, new Date())

    if (daysUntil < 0) {
      return { text: 'Overdue', className: 'text-destructive', days: Math.abs(daysUntil) }
    } else if (daysUntil === 0) {
      return { text: 'Renews today', className: 'text-primary', days: 0 }
    } else if (daysUntil <= 7) {
      return { text: `Renews in ${daysUntil} days`, className: 'text-orange-600', days: daysUntil }
    } else {
      return { text: `Renews ${format(renewalDate, 'MMM d, yyyy')}`, className: 'text-muted-foreground', days: daysUntil }
    }
  }

  const renewalInfo = getRenewalInfo()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{subscription.name}</CardTitle>
            {subscription.category && (
              <p className="text-sm text-muted-foreground mt-1">{subscription.category}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold">{formatPrice(subscription.price, subscription.cycle)}</p>
            <p className="text-xs text-muted-foreground capitalize">{subscription.cycle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renewalInfo && (
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={cn('text-sm', renewalInfo.className)}>{renewalInfo.text}</span>
          </div>
        )}
        {subscription.notes && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{subscription.notes}</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(subscription)} className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(subscription)} className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

