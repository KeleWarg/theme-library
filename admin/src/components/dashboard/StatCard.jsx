export default function StatCard({ label, value, color = 'var(--color-fg-heading)', icon: Icon }) {
  return (
    <div style={{ background: 'var(--color-bg-white)', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--color-fg-caption)', fontSize: '14px', marginBottom: '8px' }}>{label}</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color }}>{value}</div>
        </div>
        {Icon && <Icon size={24} style={{ color: 'var(--color-fg-caption)' }} />}
      </div>
    </div>
  );
}

