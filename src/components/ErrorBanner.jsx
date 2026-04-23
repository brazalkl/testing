function ErrorBanner({ message }) {
  return (
    <div className="error-banner" role="alert">
      <div aria-hidden="true">!</div>
      <div>
        <strong>Action needed</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}

export default ErrorBanner
