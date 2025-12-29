import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children, pageTitle }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Right side - header + main content */}
      <div
        style={{
          marginLeft: '240px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Header pageTitle={pageTitle} />

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: '24px',
            backgroundColor: 'var(--color-bg-neutral-light)',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

