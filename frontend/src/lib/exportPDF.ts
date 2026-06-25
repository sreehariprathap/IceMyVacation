import jsPDF from 'jspdf'
import type { ItineraryResponse } from './api'

function fmt(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export interface TripMeta {
  name: string
  destination: string
  startDate: string
  endDate: string
  numPeople: number
  transportMode: string
  userBudget?: number | null
  userBudgetCurrency?: string
}

export function exportItineraryPDF(itinerary: ItineraryResponse, meta: TripMeta) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 48
  const contentW = pageW - margin * 2
  let y = margin

  function checkNewPage(needed = 40) {
    if (y + needed > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  function hRule(color = '#E5E7EB') {
    checkNewPage(10)
    doc.setDrawColor(color)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 14
  }

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor('#1E293B')
  doc.text('IceMyVacation Itinerary', margin, y)
  y += 28

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor('#3B82F6')
  doc.text(meta.destination, margin, y)
  y += 22

  // Trip meta block
  hRule()
  doc.setFontSize(10)
  doc.setTextColor('#374151')
  const metaLines = [
    `Traveller: ${meta.name}`,
    `Dates: ${meta.startDate} to ${meta.endDate}`,
    `People: ${meta.numPeople}`,
    `Transport: ${meta.transportMode.replace(/_/g, ' ')}`,
  ]
  for (const line of metaLines) {
    checkNewPage()
    doc.text(line, margin, y)
    y += 16
  }
  y += 8

  // Day-by-day
  for (const day of itinerary.days) {
    checkNewPage(52)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor('#1E293B')
    doc.text(`Day ${day.day} — ${day.date}`, margin, y)
    y += 18
    hRule('#D1D5DB')

    for (const act of day.activities) {
      checkNewPage(80)

      // Time + cost row
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor('#6B7280')
      doc.text(act.time, margin, y)
      doc.setTextColor('#374151')
      doc.text(fmt(act.estimated_cost, itinerary.currency), pageW - margin, y, { align: 'right' })
      y += 14

      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor('#111827')
      const titleLines = doc.splitTextToSize(act.title, contentW) as string[]
      doc.text(titleLines, margin, y)
      y += titleLines.length * 14

      // Description
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor('#4B5563')
      const descLines = doc.splitTextToSize(act.description, contentW) as string[]
      for (const line of descLines) {
        checkNewPage()
        doc.text(line, margin, y)
        y += 13
      }

      // Location
      doc.setTextColor('#6B7280')
      const locLines = doc.splitTextToSize(`Location: ${act.location}`, contentW) as string[]
      for (const line of locLines) {
        checkNewPage()
        doc.text(line, margin, y)
        y += 13
      }

      // Transport note
      if (act.transport_note) {
        const tnLines = doc.splitTextToSize(`Transport: ${act.transport_note}`, contentW) as string[]
        for (const line of tnLines) {
          checkNewPage()
          doc.text(line, margin, y)
          y += 13
        }
      }

      y += 10
    }
    y += 6
  }

  // Budget breakdown
  checkNewPage(120)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor('#1E293B')
  doc.text('Budget Overview', margin, y)
  y += 18
  hRule()

  const budgetRows: [string, number][] = [
    ['Accommodation', itinerary.budget_breakdown.accommodation],
    ['Food', itinerary.budget_breakdown.food],
    ['Activities', itinerary.budget_breakdown.activities],
    ['Transport', itinerary.budget_breakdown.transport],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  for (const [label, amount] of budgetRows) {
    checkNewPage()
    doc.setTextColor('#374151')
    doc.text(label, margin, y)
    doc.text(fmt(amount, itinerary.currency), pageW - margin, y, { align: 'right' })
    y += 16
  }

  hRule('#D1D5DB')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor('#111827')
  doc.text('Total Estimated Cost', margin, y)
  doc.text(fmt(itinerary.total_estimated_cost, itinerary.currency), pageW - margin, y, { align: 'right' })
  y += 18

  if (meta.userBudget != null && meta.userBudgetCurrency) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#6B7280')
    doc.text('Your Budget', margin, y)
    doc.text(fmt(meta.userBudget, meta.userBudgetCurrency), pageW - margin, y, { align: 'right' })
    y += 16
  }

  // Disclaimer
  y += 10
  checkNewPage(36)
  doc.setFont('helvetica', 'oblique')
  doc.setFontSize(8.5)
  doc.setTextColor('#92400E')
  const disclaimer =
    'Note: A buffer of +/-10-15% should be expected due to local price variations.'
  const dLines = doc.splitTextToSize(disclaimer, contentW) as string[]
  for (const line of dLines) {
    doc.text(line, margin, y)
    y += 12
  }

  const filename = `IceMyVacation-${meta.destination.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
  doc.save(filename)
}
