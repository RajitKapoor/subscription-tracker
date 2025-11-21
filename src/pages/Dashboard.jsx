import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Plus, Bell, TrendingUp, DollarSign } from 'lucide-react'
import { format, differenceInDays, isAfter, startOfMonth, endOfMonth } from 'date-fns'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/**
 * Dashboard page with analytics and upcoming renewals
 */
export function Dashboard() {
  const { user } = useAuth()
  const { subscriptions, loading } = useSubscriptions()

  // Calculate totals
  const monthlyTotal = subscriptions.reduce((total, sub) => {
    if (sub.cycle === 'monthly') {
      return total + parseFloat(sub.price)
    } else {
      return total + parseFloat(sub.price) / 12
    }
  }, 0)

  const yearlyTotal = subscriptions.reduce((total, sub) => {
    if (sub.cycle === 'yearly') {
      return total + parseFloat(sub.price)
    } else {
      return total + parseFloat(sub.price) * 12
    }
  }, 0)

  // Get upcoming renewals (next 30 days)
  const upcomingRenewals = subscriptions
    .filter((sub) => {
      if (!sub.renewal_date) return false
      const renewalDate = new Date(sub.renewal_date)
      const daysUntil = differenceInDays(renewalDate, new Date())
      return daysUntil >= 0 && daysUntil <= 30
    })
    .sort((a, b) => {
      const dateA = new Date(a.renewal_date)
      const dateB = new Date(b.renewal_date)
      return dateA - dateB
    })
    .slice(0, 5)

  // Prepare monthly spend data for chart
  const monthlySpendData = subscriptions.map((sub) => ({
    name: sub.name,
    amount: sub.cycle === 'monthly' ? parseFloat(sub.price) : parseFloat(sub.price) / 12,
  }))
  monthlySpendData.sort((a, b) => b.amount - a.amount)

  // Prepare category breakdown data
  const categoryData = subscriptions.reduce((acc, sub) => {
    const category = sub.category || 'Uncategorized'
    const monthlyAmount = sub.cycle === 'monthly' ? parseFloat(sub.price) : parseFloat(sub.price) / 12
    if (acc[category]) {
      acc[category] += monthlyAmount
    } else {
      acc[category] = monthlyAmount
    }
    return acc
  }, {})

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.email}</p>
        </div>
        <Link to="/subscriptions">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Projection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${yearlyTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRenewals.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Spend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spend by Subscription</CardTitle>
            <CardDescription>Top subscriptions by monthly cost</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlySpendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySpendData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Monthly breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardDescription>Subscriptions renewing in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length > 0 ? (
            <div className="space-y-4">
              {upcomingRenewals.map((subscription) => {
                const daysUntil = differenceInDays(new Date(subscription.renewal_date), new Date())
                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{subscription.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(subscription.renewal_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${parseFloat(subscription.price).toFixed(2)}/{subscription.cycle === 'yearly' ? 'yr' : 'mo'}
                      </p>
                      <p className={`text-sm ${daysUntil <= 7 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                        {daysUntil === 0
                          ? 'Renews today'
                          : daysUntil === 1
                          ? 'Renews tomorrow'
                          : `Renews in ${daysUntil} days`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No upcoming renewals in the next 30 days</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

