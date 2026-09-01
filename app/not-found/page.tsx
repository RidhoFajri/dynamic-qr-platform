export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center p-6 border rounded-lg shadow-sm bg-card">
        <h1 className="text-2xl font-bold mb-2">QR Code Not Found</h1>
        <p className="text-muted-foreground">
          We couldn't find the QR code you are looking for. It may have been deleted or the URL is incorrect.
        </p>
      </div>
    </div>
  )
}
