import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Boxes, Palette, Paintbrush, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/components', icon: Boxes, label: 'Components' },
  { to: '/foundations', icon: Palette, label: 'Foundations' },
  { to: '/themes', icon: Paintbrush, label: 'Themes' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside
      style={{
        width: '240px',
        height: '100vh',
        backgroundColor: 'var(--color-bg-header)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--color-fg-stroke-ui-inverse)',
        }}
      >
        <h1
          style={{
            color: 'var(--color-fg-heading-inverse)',
            fontSize: 'var(--font-size-title-md)',
            fontWeight: 'var(--font-weight-bold)',
            margin: 0,
          }}
        >
          Design System
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: isActive
                ? 'var(--color-btn-primary-text)'
                : 'var(--color-fg-body-inverse)',
              backgroundColor: isActive
                ? 'var(--color-btn-primary-bg)'
                : 'transparent',
              marginBottom: '4px',
              fontSize: 'var(--font-size-body-md)',
              fontWeight: isActive
                ? 'var(--font-weight-semibold)'
                : 'var(--font-weight-regular)',
              transition: 'background-color 0.2s, color 0.2s',
            })}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

