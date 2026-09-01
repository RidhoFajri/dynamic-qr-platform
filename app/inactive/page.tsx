export default function InactivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center p-6 border rounded-lg shadow-sm bg-card">
        <h1 className="text-2xl font-bold mb-2">QR Code is Paused</h1>
        <p className="text-muted-foreground">
          The owner has temporarily paused this QR code. Please try again later.
        </p>
      </div>
    </div>
  )
}
