import { Link } from 'react-router-dom'
import { Package, Sparkles, CheckCircle, Clock, ArrowRight, AlertCircle, Download } from 'lucide-react'
import { useComponents } from '../hooks/useComponents'
import Badge from '../components/ui/Badge'

export default function Dashboard() {
  const { components, loading } = useComponents()
  
  // Calculate stats
  const stats = {
    total: components.length,
    published: components.filter(c => c.status === 'published').length,
    approved: components.filter(c => c.code_status === 'approved').length,
    generated: components.filter(c => c.code_status === 'generated').length,
    pending: components.filter(c => c.code_status === 'pending').length,
  }

  // Components that need attention (pending or generated but not approved)
  const needsAttention = components
    .filter(c => ['pending', 'generated'].includes(c.code_status))
    .slice(0, 5)

  // Recently updated (would need timestamp in real app)
  const recentlyUpdated = components
    .filter(c => c.jsx_code)
    .slice(0, 3)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <p style={{ color: 'var(--color-fg-caption)' }}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: 'var(--color-fg-heading)', 
          fontSize: 'var(--font-size-heading-lg)',
          margin: '0 0 8px'
        }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--color-fg-body)', margin: 0 }}>
          Here's an overview of your design system components.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <StatCard 
          label="Total Components" 
          value={stats.total} 
          icon={<Package size={20} />}
          color="var(--color-fg-heading)"
        />
        <StatCard 
          label="Published" 
          value={stats.published} 
          icon={<CheckCircle size={20} />}
          color="var(--color-fg-feedback-success)"
          subtitle={stats.total > 0 ? `${Math.round((stats.published / stats.total) * 100)}% of total` : null}
        />
        <StatCard 
          label="Ready for Review" 
          value={stats.generated} 
          icon={<Sparkles size={20} />}
          color="#7C3AED"
        />
        <StatCard 
          label="Needs Code" 
          value={stats.pending} 
          icon={<Clock size={20} />}
          color="var(--color-fg-feedback-warning)"
        />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Needs Attention */}
        <section style={{ 
          background: 'var(--color-bg-white)', 
          padding: '24px', 
          borderRadius: '8px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0, color: 'var(--color-fg-heading)' }}>
              Needs Attention
            </h3>
            {needsAttention.length > 0 && (
              <span style={{ 
                background: 'var(--color-fg-feedback-warning)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {needsAttention.length}
              </span>
            )}
          </div>

          {needsAttention.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '32px 16px',
              background: 'var(--color-bg-neutral-light)',
              borderRadius: '8px'
            }}>
              <CheckCircle size={32} color="var(--color-fg-feedback-success)" style={{ marginBottom: '12px' }} />
              <p style={{ color: 'var(--color-fg-body)', margin: 0 }}>
                All components are up to date!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {needsAttention.map(c => (
                <Link 
                  key={c.slug} 
                  to={`/components/${c.slug}`}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 16px', 
                    background: 'var(--color-bg-neutral-light)', 
                    borderRadius: '6px', 
                    textDecoration: 'none', 
                    color: 'inherit',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-neutral-medium)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-neutral-light)'}
                >
                  <div>
                    <span style={{ fontWeight: 500, color: 'var(--color-fg-heading)' }}>{c.name}</span>
                    {c.category && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: 'var(--color-fg-caption)' 
                      }}>
                        {c.category}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={c.code_status}>{c.code_status}</Badge>
                    <ArrowRight size={16} color="var(--color-fg-caption)" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {needsAttention.length > 0 && (
            <Link 
              to="/components" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginTop: '16px',
                padding: '10px',
                color: 'var(--color-fg-body)',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              View all components <ArrowRight size={14} />
            </Link>
          )}
        </section>

        {/* Quick Actions */}
        <section style={{ 
          background: 'var(--color-bg-white)', 
          padding: '24px', 
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--color-fg-heading)' }}>
            Quick Actions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickActionCard
              to="/components"
              icon={<Package size={20} />}
              title="Browse Components"
              description="View and manage all design system components"
            />
            <QuickActionCard
              to="/foundations"
              icon={<Sparkles size={20} />}
              title="View Foundations"
              description="Explore colors, typography, and spacing tokens"
            />
            <QuickActionCard
              to="/settings"
              icon={<Download size={20} />}
              title="Export Package"
              description={`Export ${stats.published} published components as npm package`}
            />
          </div>
        </section>
      </div>

      {/* Component Status Overview */}
      <section style={{ 
        background: 'var(--color-bg-white)', 
        padding: '24px', 
        borderRadius: '8px',
        marginTop: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--color-fg-heading)' }}>
          Component Pipeline
        </h3>
        
        <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          {stats.pending > 0 && (
            <div 
              style={{ 
                flex: stats.pending, 
                background: 'var(--color-fg-feedback-warning)',
                transition: 'flex 0.3s'
              }} 
              title={`${stats.pending} pending`}
            />
          )}
          {stats.generated > 0 && (
            <div 
              style={{ 
                flex: stats.generated, 
                background: '#7C3AED',
                transition: 'flex 0.3s'
              }} 
              title={`${stats.generated} generated`}
            />
          )}
          {stats.approved > 0 && (
            <div 
              style={{ 
                flex: stats.approved, 
                background: '#3B82F6',
                transition: 'flex 0.3s'
              }} 
              title={`${stats.approved} approved`}
            />
          )}
          {stats.published > 0 && (
            <div 
              style={{ 
                flex: stats.published, 
                background: 'var(--color-fg-feedback-success)',
                transition: 'flex 0.3s'
              }} 
              title={`${stats.published} published`}
            />
          )}
          {stats.total === 0 && (
            <div style={{ flex: 1, background: 'var(--color-bg-neutral-medium)' }} />
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '12px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-fg-feedback-warning)' }} />
            <span style={{ color: 'var(--color-fg-caption)' }}>Pending ({stats.pending})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#7C3AED' }} />
            <span style={{ color: 'var(--color-fg-caption)' }}>Generated ({stats.generated})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3B82F6' }} />
            <span style={{ color: 'var(--color-fg-caption)' }}>Approved ({stats.approved})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-fg-feedback-success)' }} />
            <span style={{ color: 'var(--color-fg-caption)' }}>Published ({stats.published})</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, icon, color, subtitle }) {
  return (
    <div style={{ 
      background: 'var(--color-bg-white)', 
      padding: '20px', 
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--color-fg-caption)', fontSize: '14px' }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'var(--font-weight-bold)', 
        color 
      }}>
        {value}
      </div>
      {subtitle && (
        <span style={{ fontSize: '12px', color: 'var(--color-fg-caption)' }}>{subtitle}</span>
      )}
    </div>
  )
}

function QuickActionCard({ to, icon, title, description }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: 'var(--color-bg-neutral-light)',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-neutral-medium)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-neutral-light)'}
    >
      <div style={{ 
        padding: '10px', 
        background: 'var(--color-bg-white)', 
        borderRadius: '8px',
        color: 'var(--color-btn-primary-bg)'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, color: 'var(--color-fg-heading)', marginBottom: '2px' }}>
          {title}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--color-fg-caption)' }}>
          {description}
        </div>
      </div>
      <ArrowRight size={16} color="var(--color-fg-caption)" />
    </Link>
  )
}
