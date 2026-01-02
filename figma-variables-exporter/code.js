/**
 * Chunk 9.04 + 9.05 — Main Plugin Entry + API Sync
 *
 * Wires up the Figma plugin UI and handles messages.
 * Includes sync functionality to push tokens to admin dashboard.
 */
import { getCollections } from './variableReader';
import { exportVariables } from './exporter';
// Show the plugin UI
figma.showUI(__html__, { width: 340, height: 480 });
// Load collections on startup
loadCollections();
/**
 * Load available variable collections and send to UI
 */
async function loadCollections() {
    const collections = await getCollections();
    figma.ui.postMessage({ type: 'collections', collections });
}
/**
 * Handle messages from the UI
 */
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'cancel') {
        figma.closePlugin();
        return;
    }
    if (msg.type === 'export') {
        try {
            const files = await exportVariables(msg.collections || [], msg.options || { colors: true, typography: true, spacing: true });
            figma.ui.postMessage({
                type: 'export-complete',
                files,
                fileCount: files.length,
            });
        }
        catch (e) {
            figma.ui.postMessage({
                type: 'error',
                message: String(e),
            });
        }
    }
    // Chunk 9.05: Sync handler - push tokens to admin dashboard API
    if (msg.type === 'sync') {
        try {
            figma.ui.postMessage({ type: 'loading', message: 'Syncing...' });
            // Export variables first
            const files = await exportVariables(msg.collections || [], msg.options || { colors: true, typography: true, spacing: true });
            // Send to admin dashboard API
            const response = await fetch(msg.apiUrl || 'http://localhost:3001/api/tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(msg.apiKey ? { 'Authorization': `Bearer ${msg.apiKey}` } : {}),
                },
                body: JSON.stringify({
                    tokens: files,
                    timestamp: new Date().toISOString(),
                    source: 'figma-plugin',
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }
            const result = await response.json();
            figma.ui.postMessage({
                type: 'sync-complete',
                result,
            });
            figma.notify('✓ Synced to dashboard');
        }
        catch (e) {
            figma.ui.postMessage({
                type: 'error',
                message: `Sync failed: ${e}`
            });
            figma.notify('✗ Sync failed', { error: true });
        }
    }
};
