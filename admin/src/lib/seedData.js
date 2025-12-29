import { supabase } from './supabase'

export const mockComponents = [
  {
    name: 'Button',
    slug: 'button',
    description: 'Interactive button with multiple variants',
    category: 'actions',
    variants: [
      { name: 'Primary', props: { variant: 'primary' } },
      { name: 'Secondary', props: { variant: 'secondary' } },
      { name: 'Ghost', props: { variant: 'ghost' } },
    ],
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost'", default: 'primary', description: 'Button style variant', required: false },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: 'Button size', required: false },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state', required: false },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Button content', required: true },
    ],
    linked_tokens: ['btn-primary-bg', 'btn-primary-text', 'btn-secondary-bg', 'btn-ghost-text'],
    code_status: 'approved',
    status: 'published',
    jsx_code: `export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  children, 
  ...props 
}) {
  const baseStyles = {
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 32px' : '12px 24px',
    fontSize: 'var(--font-size-label-md)',
    fontWeight: 'var(--font-weight-semibold)',
    borderRadius: '6px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.2s, transform 0.1s',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-btn-primary-bg)',
      color: 'var(--color-btn-primary-text)',
    },
    secondary: {
      backgroundColor: 'var(--color-btn-secondary-bg)',
      color: 'var(--color-btn-secondary-text)',
      border: '1px solid var(--color-btn-secondary-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-btn-ghost-text)',
    },
  };

  return (
    <button 
      style={{ ...baseStyles, ...variantStyles[variant] }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}`
  },
  {
    name: 'Card',
    slug: 'card',
    description: 'Content container with optional elevation',
    category: 'layout',
    variants: [
      { name: 'Default', props: { elevated: false } },
      { name: 'Elevated', props: { elevated: true } },
    ],
    props: [
      { name: 'elevated', type: 'boolean', default: 'false', description: 'Add shadow elevation', required: false },
      { name: 'padding', type: "'sm' | 'md' | 'lg'", default: 'md', description: 'Internal padding', required: false },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Card content', required: true },
    ],
    linked_tokens: ['bg-white', 'bg-neutral-light'],
    code_status: 'generated',
    status: 'draft',
    jsx_code: null
  },
  {
    name: 'Input',
    slug: 'input',
    description: 'Text input with label and error state',
    category: 'forms',
    variants: [
      { name: 'Default', props: {} },
      { name: 'With Error', props: { error: 'This field is required' } },
    ],
    props: [
      { name: 'label', type: 'string', default: '-', description: 'Input label', required: false },
      { name: 'error', type: 'string', default: '-', description: 'Error message', required: false },
      { name: 'placeholder', type: 'string', default: '-', description: 'Placeholder text', required: false },
    ],
    linked_tokens: ['fg-heading', 'fg-body', 'fg-feedback-error', 'bg-white'],
    code_status: 'pending',
    status: 'draft',
    jsx_code: null
  },
  {
    name: 'Badge',
    slug: 'badge',
    description: 'Status indicator badge',
    category: 'feedback',
    variants: [
      { name: 'Default', props: { variant: 'default' } },
      { name: 'Success', props: { variant: 'success' } },
      { name: 'Warning', props: { variant: 'warning' } },
      { name: 'Error', props: { variant: 'error' } },
    ],
    props: [
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'error'", default: 'default', description: 'Badge variant', required: false },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Badge text', required: true },
    ],
    linked_tokens: ['fg-feedback-success', 'fg-feedback-warning', 'fg-feedback-error'],
    code_status: 'pending',
    status: 'draft',
    jsx_code: null
  },
]

export async function seedDatabase() {
  if (!supabase) {
    console.warn('Supabase not configured. Using mock data.')
    return mockComponents
  }

  // Check if data already exists
  const { data: existing } = await supabase
    .from('components')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('Database already seeded')
    return
  }

  // Insert seed data
  const { data, error } = await supabase
    .from('components')
    .insert(mockComponents)
    .select()

  if (error) throw error
  
  console.log('Database seeded with', data.length, 'components')
  return data
}

export async function clearDatabase() {
  if (!supabase) return

  await supabase.from('sync_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('components').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('Database cleared')
}



