const variantStyles = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  generated: { bg: '#DBEAFE', color: '#1E40AF' },
  approved: { bg: '#D1FAE5', color: '#065F46' },
  published: { bg: '#065F46', color: '#FFFFFF' },
  draft: { bg: '#F3F4F6', color: '#6B7280' },
  manual: { bg: '#EDE9FE', color: '#6D28D9' },
  default: { bg: '#F3F4F6', color: '#374151' },
}

export default function Badge({ variant = 'default', children }) {
  const styles = variantStyles[variant] || variantStyles.default
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 500,
      backgroundColor: styles.bg,
      color: styles.color,
    }}>
      {children}
    </span>
  )
}



