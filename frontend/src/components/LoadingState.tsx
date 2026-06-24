import { Loader2 } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="text-2xl font-semibold">Planning your perfect vacation...</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        AI is crafting your personalized itinerary. This may take 15-30 seconds.
      </p>
    </div>
  )
}
