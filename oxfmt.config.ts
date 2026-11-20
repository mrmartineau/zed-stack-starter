import kit from '@mrmartineau/kit/oxfmt' with { type: 'json' }

export default { ...kit, ignorePatterns: ['**/dist', 'src/routeTree.gen.ts', 'worker-configuration.d.ts', 'drizzle', 'public', '**/*.md', '**/*.mdx', '**/*.yml', '**/*.yaml', '**/*.html'] }
