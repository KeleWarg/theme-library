/**
 * Chunk 9.05 — Token Sync API
 * 
 * Handles token sync from Figma plugin to admin dashboard.
 * Imports tokens and creates/updates themes in the database.
 */

/**
 * Flatten nested DTCG token structure into flat token array
 * 
 * @param {object} data - Nested token data in DTCG format
 * @param {string} themeId - Theme ID to associate tokens with
 * @param {string[]} path - Current path in the token tree
 * @returns {Array} Flat array of token objects
 */
export function flattenTokens(data, themeId, path = []) {
  const tokens = [];
  
  for (const [key, value] of Object.entries(data)) {
    // Check if this is a token (has $type and $value)
    if (value && typeof value === 'object' && '$type' in value && '$value' in value) {
      const category = path[0] || 'other';
      const subcategory = path[1] || null;
      const groupName = path.slice(2).join('-') || null;
      
      // Build CSS variable name
      const cssPath = [...path, key]
        .map(p => p.toLowerCase().replace(/\s+/g, '-'))
        .join('-');
      
      tokens.push({
        theme_id: themeId,
        category,
        subcategory,
        group_name: groupName,
        name: key,
        value: typeof value.$value === 'object' 
          ? JSON.stringify(value.$value) 
          : String(value.$value),
        css_variable: `--${cssPath}`,
        sort_order: tokens.length,
      });
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested objects
      tokens.push(...flattenTokens(value, themeId, [...path, key]));
    }
  }
  
  return tokens;
}

/**
 * Extract theme name from filename
 * 
 * @param {string} filename - The export filename (e.g., "Health_-_SEM_tokens.json")
 * @returns {string} Clean theme name
 */
export function extractThemeName(filename) {
  return filename
    .replace(/_tokens\.json$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+-\s+/g, ' - ')
    .trim();
}

/**
 * Generate URL-friendly slug from theme name
 * 
 * @param {string} name - Theme name
 * @returns {string} URL-friendly slug
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Handle POST /api/tokens - Sync tokens from Figma plugin
 * 
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {object} supabase - Supabase client instance
 * @param {string} expectedApiKey - Expected API key for auth (optional)
 */
export async function handleTokenSync(req, res, supabase, expectedApiKey = null) {
  // Check authorization if API key is configured
  if (expectedApiKey) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ') || auth.slice(7) !== expectedApiKey) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }

  try {
    const { tokens, timestamp, source } = req.body;

    if (!tokens || !Array.isArray(tokens)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid tokens array' 
      });
    }

    console.log('\n🔄 Token sync from Figma plugin:');
    console.log(`   Source: ${source || 'unknown'}`);
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   Files: ${tokens.length}`);

    const results = [];

    for (const file of tokens) {
      const themeName = extractThemeName(file.name);
      const slug = generateSlug(themeName);

      console.log(`\n   Processing: ${file.name}`);
      console.log(`   → Theme: ${themeName} (${slug})`);

      if (!supabase) {
        console.log('   ⚠️  No database - skipping save');
        results.push({ name: themeName, slug, status: 'skipped' });
        continue;
      }

      // Parse the token content
      let tokenData;
      try {
        tokenData = typeof file.content === 'string' 
          ? JSON.parse(file.content) 
          : file.content;
      } catch (parseError) {
        console.error(`   ❌ Failed to parse ${file.name}:`, parseError.message);
        results.push({ name: themeName, slug, status: 'error', error: parseError.message });
        continue;
      }

      // Upsert theme
      const { data: theme, error: themeError } = await supabase
        .from('themes')
        .upsert(
          { 
            name: themeName, 
            slug, 
            source: source || 'figma-plugin',
            source_file_name: file.name,
            status: 'draft',
            updated_at: timestamp || new Date().toISOString(),
          }, 
          { onConflict: 'slug' }
        )
        .select()
        .single();

      if (themeError) {
        console.error(`   ❌ Theme upsert error:`, themeError.message);
        results.push({ name: themeName, slug, status: 'error', error: themeError.message });
        continue;
      }

      console.log(`   ✓ Theme upserted: ${theme.id}`);

      // Flatten and upsert tokens
      const flatTokens = flattenTokens(tokenData, theme.id);
      console.log(`   → Tokens: ${flatTokens.length}`);

      if (flatTokens.length > 0) {
        // Delete existing tokens for this theme before inserting new ones
        const { error: deleteError } = await supabase
          .from('theme_tokens')
          .delete()
          .eq('theme_id', theme.id);

        if (deleteError) {
          console.error(`   ⚠️  Failed to clear old tokens:`, deleteError.message);
        }

        // Insert new tokens in batches (Supabase has limits on bulk inserts)
        const batchSize = 100;
        for (let i = 0; i < flatTokens.length; i += batchSize) {
          const batch = flatTokens.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from('theme_tokens')
            .insert(batch);

          if (insertError) {
            console.error(`   ❌ Token insert error (batch ${i}):`, insertError.message);
          }
        }
      }

      results.push({ 
        name: themeName, 
        slug, 
        themeId: theme.id,
        tokenCount: flatTokens.length,
        status: 'success' 
      });
      console.log(`   ✅ Synced ${flatTokens.length} tokens`);
    }

    console.log('\n✅ Sync complete');

    return res.json({ 
      success: true, 
      results,
      syncedThemes: results.filter(r => r.status === 'success').length,
      totalTokens: results.reduce((sum, r) => sum + (r.tokenCount || 0), 0),
    });

  } catch (error) {
    console.error('❌ Token sync error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

