'use client'

import { useState } from 'react'
import { Download, BarChart3, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'

const reportTypes = [
  { value: 'donation', label: 'Donation Report' },
  { value: 'volunteer', label: 'Volunteer Report' },
  { value: 'event', label: 'Event Report' },
  { value: 'sponsorship', label: 'Sponsorship Report' },
  { value: 'financial', label: 'Financial Summary' },
]

const donationData = [
  { month: 'Jul 2024', total: 1200000, count: 8 },
  { month: 'Aug 2024', total: 1800000, count: 12 },
  { month: 'Sep 2024', total: 1500000, count: 10 },
  { month: 'Oct 2024', total: 2200000, count: 15 },
  { month: 'Nov 2024', total: 1900000, count: 11 },
  { month: 'Dec 2024', total: 2800000, count: 18 },
  { month: 'Jan 2025', total: 2100000, count: 14 },
  { month: 'Feb 2025', total: 2400000, count: 16 },
]

const donationByMethod = [
  { name: 'Mobile', value: 45 },
  { name: 'Card', value: 30 },
  { name: 'Bank', value: 25 },
]

const COLORS = ['#F59E0B', '#0F2D5C', '#10B981', '#8B5CF6', '#EF4444']

const volunteerData = [
  { month: 'Jul', applications: 5, approved: 3 },
  { month: 'Aug', applications: 8, approved: 6 },
  { month: 'Sep', applications: 4, approved: 3 },
  { month: 'Oct', applications: 10, approved: 8 },
  { month: 'Nov', applications: 6, approved: 4 },
  { month: 'Dec', applications: 12, approved: 9 },
]

const sponsorshipData = [
  { month: 'Jul', active: 15, new: 3 },
  { month: 'Aug', active: 18, new: 4 },
  { month: 'Sep', active: 20, new: 3 },
  { month: 'Oct', active: 23, new: 5 },
  { month: 'Nov', active: 25, new: 4 },
  { month: 'Dec', active: 28, new: 6 },
]

const financialData = [
  { category: 'Donations', income: 15900000, expenses: 0 },
  { category: 'Programs', income: 0, expenses: 8500000 },
  { category: 'Operations', income: 0, expenses: 3200000 },
  { category: 'Fundraising', income: 0, expenses: 1500000 },
  { category: 'Admin', income: 0, expenses: 2100000 },
]

export default function ReportsModule() {
  const [reportType, setReportType] = useState('donation')
  const [dateFrom, setDateFrom] = useState('2024-07-01')
  const [dateTo, setDateTo] = useState('2025-03-01')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setGenerating(true)
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setGenerated(true)
    setGenerating(false)
    toast({ title: 'Report Generated', description: `${reportTypes.find((r) => r.value === reportType)?.label} generated successfully` })
  }

  const handleExportPDF = () => {
    toast({ title: 'Export', description: 'PDF export initiated (placeholder)' })
  }

  const handleExportExcel = () => {
    const headers = ['Month', 'Amount (TZS)']
    const data = donationData.map((d) => [d.month, d.total.toString()])
    const csv = [headers, ...data].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-report.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Exported', description: 'Report exported as CSV' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F2D5C]">Reports</h2>
        <p className="text-gray-500 text-sm">Generate and view reports</p>
      </div>

      {/* Report Config */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(v) => { setReportType(v); setGenerated(false) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="bg-orange hover:bg-orange-dark text-white">
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {generated && (
        <>
          {/* Export Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleExportPDF} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </div>

          {/* Donation Report */}
          {reportType === 'donation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#0F2D5C]">Monthly Donations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={donationData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                          <Tooltip formatter={(value: number) => [`TZS ${value.toLocaleString()}`, 'Total']} />
                          <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#0F2D5C]">By Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donationByMethod} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {donationByMethod.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Total (TZS)</TableHead><TableHead>Count</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {donationData.map((d) => (
                        <TableRow key={d.month}>
                          <TableCell className="font-medium">{d.month}</TableCell>
                          <TableCell>TZS {d.total.toLocaleString()}</TableCell>
                          <TableCell>{d.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Volunteer Report */}
          {reportType === 'volunteer' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#0F2D5C]">Volunteer Applications vs Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={volunteerData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="applications" stroke="#0F2D5C" strokeWidth={2} />
                        <Line type="monotone" dataKey="approved" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Applications</TableHead><TableHead>Approved</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {volunteerData.map((d) => (
                        <TableRow key={d.month}>
                          <TableCell className="font-medium">{d.month}</TableCell>
                          <TableCell>{d.applications}</TableCell>
                          <TableCell>{d.approved}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Event Report */}
          {reportType === 'event' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-[#0F2D5C]">Event Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">5</p>
                    <p className="text-sm text-gray-500">Total Events</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">2</p>
                    <p className="text-sm text-gray-500">Upcoming</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-600">3</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sponsorship Report */}
          {reportType === 'sponsorship' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#0F2D5C]">Sponsorship Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sponsorshipData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="active" fill="#0F2D5C" radius={[4, 4, 0, 0]} name="Active Sponsorships" />
                        <Bar dataKey="new" fill="#F59E0B" radius={[4, 4, 0, 0]} name="New Sponsorships" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Active</TableHead><TableHead>New</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {sponsorshipData.map((d) => (
                        <TableRow key={d.month}>
                          <TableCell className="font-medium">{d.month}</TableCell>
                          <TableCell>{d.active}</TableCell>
                          <TableCell>{d.new}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Financial Report */}
          {reportType === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">TZS 15.9M</p>
                    <p className="text-sm text-gray-500">Total Income</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">TZS 15.3M</p>
                    <p className="text-sm text-gray-500">Total Expenses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#0F2D5C]">TZS 0.6M</p>
                    <p className="text-sm text-gray-500">Net Balance</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#0F2D5C]">Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="category" />
                        <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                        <Tooltip formatter={(value: number) => [`TZS ${value.toLocaleString()}`]} />
                        <Legend />
                        <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                        <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Income (TZS)</TableHead><TableHead>Expenses (TZS)</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {financialData.map((d) => (
                        <TableRow key={d.category}>
                          <TableCell className="font-medium">{d.category}</TableCell>
                          <TableCell className={d.income > 0 ? 'text-green-600' : 'text-gray-400'}>{d.income > 0 ? `TZS ${d.income.toLocaleString()}` : '—'}</TableCell>
                          <TableCell className={d.expenses > 0 ? 'text-red-500' : 'text-gray-400'}>{d.expenses > 0 ? `TZS ${d.expenses.toLocaleString()}` : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {!generated && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Generate a Report</h3>
            <p className="text-sm text-gray-400">Select a report type and date range, then click Generate</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
