/**
 * Web Summarizer AI - History Management System
 * Local storage-based history with filesize tracking and export functionality
 * Date: November 6, 2025
 */

class HistoryManager {
  constructor() {
    this.storageKey = 'web-summarizer-history';
    this.maxHistorySize = 50; // Maximum number of entries
    this.init();
  }

  init() {
    this.ensureHistoryStructure();
  }

  /**
   * Ensure proper history structure exists in localStorage
   */
  ensureHistoryStructure() {
    let history = this.getHistory();
    if (!history || !Array.isArray(history.entries)) {
      history = {
        entries: [],
        totalSize: 0,
        lastCleared: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      this.saveHistory(history);
    }
  }

  /**
   * Get complete history from localStorage
   */
  getHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading history:', error);
      return null;
    }
  }

  /**
   * Save history to localStorage
   */
  saveHistory(history) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  /**
   * Add new summary to history
   */
  addEntry(entry) {
    const history = this.getHistory();
    const newEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      url: entry.url || window.location.href,
      title: entry.title || document.title,
      content: entry.content,
      summary: entry.summary,
      length: entry.length || 'medium',
      language: entry.language || 'English',
      size: this.calculateSize(entry)
    };

    // Add to beginning of array (most recent first)
    history.entries.unshift(newEntry);

    // Maintain size limit
    if (history.entries.length > this.maxHistorySize) {
      history.entries = history.entries.slice(0, this.maxHistorySize);
    }

    // Update total size
    history.totalSize = this.calculateTotalSize(history.entries);

    this.saveHistory(history);
    return newEntry;
  }

  /**
   * Get all history entries
   */
  getEntries() {
    const history = this.getHistory();
    return history ? history.entries : [];
  }

  /**
   * Get history statistics
   */
  getStats() {
    const history = this.getHistory();
    if (!history) return null;

    return {
      totalEntries: history.entries.length,
      totalSize: history.totalSize,
      totalSizeFormatted: this.formatFileSize(history.totalSize),
      lastCleared: history.lastCleared,
      createdAt: history.createdAt,
      oldestEntry: history.entries[history.entries.length - 1]?.timestamp,
      newestEntry: history.entries[0]?.timestamp
    };
  }

  /**
   * Clear all history
   */
  clearHistory() {
    const newHistory = {
      entries: [],
      totalSize: 0,
      lastCleared: new Date().toISOString(),
      createdAt: this.getHistory()?.createdAt || new Date().toISOString()
    };
    this.saveHistory(newHistory);
    return newHistory;
  }

  /**
   * Delete specific entry
   */
  deleteEntry(entryId) {
    const history = this.getHistory();
    history.entries = history.entries.filter(entry => entry.id !== entryId);
    history.totalSize = this.calculateTotalSize(history.entries);
    this.saveHistory(history);
    return history;
  }

  /**
   * Export history in various formats
   */
  exportHistory(format = 'json') {
    const history = this.getHistory();
    const stats = this.getStats();
    
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportAsCSV(history.entries, stats);
      case 'html':
        return this.exportAsHTML(history.entries, stats);
      case 'markdown':
        return this.exportAsMarkdown(history.entries, stats);
      case 'json':
      default:
        return this.exportAsJSON(history, stats);
    }
  }

  /**
   * Export as CSV
   */
  exportAsCSV(entries, stats) {
    const headers = ['Timestamp', 'Title', 'URL', 'Content Preview', 'Summary', 'Length', 'Language', 'Size (bytes)'];
    const rows = entries.map(entry => [
      entry.timestamp,
      `"${entry.title.replace(/"/g, '""')}"`,
      entry.url,
      `"${(entry.content || '').substring(0, 100).replace(/"/g, '""')}"`,
      `"${(entry.summary || '').replace(/"/g, '""')}"`,
      entry.length,
      entry.language,
      entry.size
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return {
      content: csvContent,
      filename: `web-summarizer-history-${this.formatDateForFilename()}.csv`,
      mimeType: 'text/csv'
    };
  }

  /**
   * Export as HTML
   */
  exportAsHTML(entries, stats) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Summarizer AI - History Export</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #0f380f; padding-bottom: 1rem; margin-bottom: 2rem; }
        .stats { background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 2rem; }
        .entry { border: 1px solid #ddd; margin-bottom: 1rem; border-radius: 6px; overflow: hidden; }
        .entry-header { background: #0f380f; color: white; padding: 1rem; }
        .entry-content { padding: 1rem; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 0.5rem; }
        .summary { background: #f0f8f0; padding: 1rem; border-left: 4px solid #8bac0f; margin: 1rem 0; }
        .content-preview { font-style: italic; color: #666; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Web Summarizer AI - History Export</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <h2>📊 Statistics</h2>
            <ul>
                <li><strong>Total Entries:</strong> ${stats.totalEntries}</li>
                <li><strong>Total Size:</strong> ${stats.totalSizeFormatted}</li>
                <li><strong>Last Cleared:</strong> ${new Date(stats.lastCleared).toLocaleString()}</li>
                <li><strong>Date Range:</strong> ${stats.oldestEntry ? new Date(stats.oldestEntry).toLocaleDateString() : 'N/A'} - ${stats.newestEntry ? new Date(stats.newestEntry).toLocaleDateString() : 'N/A'}</li>
            </ul>
        </div>

        <div class="entries">
            <h2>📝 Summary History</h2>
            ${entries.map(entry => `
                <div class="entry">
                    <div class="entry-header">
                        <h3>${this.escapeHtml(entry.title)}</h3>
                        <div class="meta">
                            ${new Date(entry.timestamp).toLocaleString()} • 
                            ${entry.length} summary • 
                            ${entry.language} • 
                            ${this.formatFileSize(entry.size)}
                        </div>
                    </div>
                    <div class="entry-content">
                        <p><strong>URL:</strong> <a href="${entry.url}" target="_blank">${entry.url}</a></p>
                        ${entry.summary ? `<div class="summary"><strong>Summary:</strong><br>${this.escapeHtml(entry.summary)}</div>` : ''}
                        ${entry.content ? `<div class="content-preview"><strong>Content Preview:</strong><br>${this.escapeHtml(entry.content.substring(0, 300))}${entry.content.length > 300 ? '...' : ''}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    return {
      content: html,
      filename: `web-summarizer-history-${this.formatDateForFilename()}.html`,
      mimeType: 'text/html'
    };
  }

  /**
   * Export as Markdown
   */
  exportAsMarkdown(entries, stats) {
    const markdown = `# 🎮 Web Summarizer AI - History Export

*Generated on ${new Date().toLocaleString()}*

## 📊 Statistics

- **Total Entries:** ${stats.totalEntries}
- **Total Size:** ${stats.totalSizeFormatted}
- **Last Cleared:** ${new Date(stats.lastCleared).toLocaleString()}
- **Date Range:** ${stats.oldestEntry ? new Date(stats.oldestEntry).toLocaleDateString() : 'N/A'} - ${stats.newestEntry ? new Date(stats.newestEntry).toLocaleDateString() : 'N/A'}

## 📝 Summary History

${entries.map(entry => `
### ${entry.title}

**Date:** ${new Date(entry.timestamp).toLocaleString()}  
**URL:** ${entry.url}  
**Summary Type:** ${entry.length} • ${entry.language} • ${this.formatFileSize(entry.size)}

${entry.summary ? `**Summary:**\n> ${entry.summary}\n` : ''}

${entry.content ? `**Content Preview:**\n\`\`\`\n${entry.content.substring(0, 300)}${entry.content.length > 300 ? '...' : ''}\n\`\`\`\n` : ''}

---
`).join('')}

*Export generated by Web Summarizer AI*`;

    return {
      content: markdown,
      filename: `web-summarizer-history-${this.formatDateForFilename()}.md`,
      mimeType: 'text/markdown'
    };
  }

  /**
   * Export as JSON
   */
  exportAsJSON(history, stats) {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        source: 'Web Summarizer AI',
        ...stats
      },
      history: history
    };

    return {
      content: JSON.stringify(exportData, null, 2),
      filename: `web-summarizer-history-${this.formatDateForFilename()}.json`,
      mimeType: 'application/json'
    };
  }

  /**
   * Trigger download of exported file
   */
  downloadExport(format = 'json') {
    const exportData = this.exportHistory(format);
    const blob = new Blob([exportData.content], { type: exportData.mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = exportData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper functions
   */
  generateId() {
    return `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateSize(entry) {
    const text = JSON.stringify(entry);
    return new Blob([text]).size;
  }

  calculateTotalSize(entries) {
    return entries.reduce((total, entry) => total + (entry.size || 0), 0);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDateForFilename() {
    return new Date().toISOString().split('T')[0];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HistoryManager;
} else if (typeof window !== 'undefined') {
  window.HistoryManager = HistoryManager;
}