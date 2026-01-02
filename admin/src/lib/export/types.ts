export interface ExportableComponent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  jsx_code: string;
  props?: { name: string; type: string; default?: string; description?: string }[];
  variants?: { name: string }[];
  status: 'published' | 'approved' | 'generated' | 'pending';
  code_status?: string;
}

export interface PackageConfig {
  packageName: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
}

export const DEFAULT_PACKAGE_CONFIG: PackageConfig = {
  packageName: '@yourorg/design-system',
  version: '1.0.0',
  description: 'Design system components',
  license: 'MIT',
};

