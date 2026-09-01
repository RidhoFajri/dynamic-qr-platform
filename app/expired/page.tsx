export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center p-6 border rounded-lg shadow-sm bg-card">
        <h1 className="text-2xl font-bold mb-2">QR Code Expired</h1>
        <p className="text-muted-foreground">
          This QR code campaign has expired and is no longer active.
        </p>
      </div>
    </div>
  )
}
