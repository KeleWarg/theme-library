export default function PropsTable({ props = [], onChange, readOnly = false }) {
  const handlePropChange = (index, field, value) => {
    if (readOnly || !onChange) return
    const newProps = [...props]
    newProps[index] = { ...newProps[index], [field]: value }
    onChange(newProps)
  }

  const handleAddProp = () => {
    if (readOnly || !onChange) return
    onChange([...props, { name: '', type: 'string', default: '', description: '' }])
  }

  const handleRemoveProp = (index) => {
    if (readOnly || !onChange) return
    onChange(props.filter((_, i) => i !== index))
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border-default)' }}>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Default</th>
            <th style={{ textAlign: 'left', padding: '8px', color: 'var(--color-fg-heading)' }}>Description</th>
            {!readOnly && <th style={{ width: '40px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {props.length === 0 && (
            <tr>
              <td colSpan={readOnly ? 4 : 5} style={{ padding: '16px', textAlign: 'center', color: 'var(--color-fg-caption)' }}>
                No props defined
              </td>
            </tr>
          )}
          {props.map((prop, index) => (
            <tr key={index} style={{ borderBottom: '1px solid var(--color-bg-neutral-light)' }}>
              <td style={{ padding: '8px' }}>
                {readOnly ? (
                  <code style={{ fontSize: '13px' }}>{prop.name}</code>
                ) : (
                  <input
                    value={prop.name}
                    onChange={e => handlePropChange(index, 'name', e.target.value)}
                    placeholder="propName"
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-border-default)', borderRadius: '4px' }}
                  />
                )}
              </td>
              <td style={{ padding: '8px' }}>
                {readOnly ? (
                  <code style={{ fontSize: '13px', color: 'var(--color-fg-caption)' }}>{prop.type}</code>
                ) : (
                  <input
                    value={prop.type}
                    onChange={e => handlePropChange(index, 'type', e.target.value)}
                    placeholder="string"
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-border-default)', borderRadius: '4px' }}
                  />
                )}
              </td>
              <td style={{ padding: '8px' }}>
                {readOnly ? (
                  <code style={{ fontSize: '13px' }}>{prop.default || '-'}</code>
                ) : (
                  <input
                    value={prop.default || ''}
                    onChange={e => handlePropChange(index, 'default', e.target.value)}
                    placeholder="default"
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-border-default)', borderRadius: '4px' }}
                  />
                )}
              </td>
              <td style={{ padding: '8px', color: 'var(--color-fg-body)' }}>
                {readOnly ? (
                  prop.description
                ) : (
                  <input
                    value={prop.description || ''}
                    onChange={e => handlePropChange(index, 'description', e.target.value)}
                    placeholder="Description"
                    style={{ width: '100%', padding: '4px', border: '1px solid var(--color-border-default)', borderRadius: '4px' }}
                  />
                )}
              </td>
              {!readOnly && (
                <td style={{ padding: '8px' }}>
                  <button
                    onClick={() => handleRemoveProp(index)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-fg-feedback-error)', fontSize: '18px' }}
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {!readOnly && (
        <button
          onClick={handleAddProp}
          style={{
            marginTop: '8px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px dashed var(--color-border-default)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--color-fg-caption)',
          }}
        >
          + Add Prop
        </button>
      )}
    </div>
  )
}



