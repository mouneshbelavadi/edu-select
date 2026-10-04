const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { marked } = require('marked');

const rootDir = path.resolve(__dirname, '..');
const mdPath = path.join(rootDir, 'ARCHITECTURE.md');
const htmlPath = path.join(rootDir, 'architecture_preview.html');
const pdfPath = path.join(rootDir, 'ARCHITECTURE.pdf');

if (!fs.existsSync(mdPath)) {
  console.error('ARCHITECTURE.md not found at', mdPath);
  process.exit(1);
}

const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Custom renderer for marked
const renderer = new marked.Renderer();

renderer.code = function({ text, lang }) {
  if (lang === 'mermaid') {
    return `\n<div class="mermaid-container">\n  <pre class="mermaid">\n${text}\n  </pre>\n</div>\n`;
  }
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `\n<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>\n`;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: false
});

const parsedHtml = marked.parse(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EduSelect — System Architecture & Engineering Blueprint</title>
  
  <!-- Mermaid.js for rendering diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.6;
      font-size: 13px;
      margin: 0;
      padding: 20px 24px;
    }

    /* Document Title */
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 12px;
      margin-top: 0;
      margin-bottom: 14px;
      letter-spacing: -0.02em;
    }

    h2 {
      font-size: 17px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 28px;
      margin-bottom: 12px;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #2563eb;
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 10px;
      color: #334155;
    }

    blockquote {
      margin: 12px 0;
      padding: 10px 16px;
      background-color: #f0f7ff;
      border-left: 4px solid #2563eb;
      color: #1e3a8a;
      font-size: 12.5px;
      border-radius: 0 6px 6px 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px 0;
      font-size: 11.5px;
      page-break-inside: avoid;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
    }

    thead {
      background-color: #f1f5f9;
    }

    th {
      padding: 8px 10px;
      text-align: left;
      font-weight: 700;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      font-size: 11.5px;
    }

    td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
      word-break: break-word;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Code & Pre */
    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 11px;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 11px;
      line-height: 1.45;
      margin: 12px 0;
      page-break-inside: avoid;
    }

    pre code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
    }

    /* Mermaid Diagrams Styling */
    .mermaid-container {
      background: #ffffff;
      border: 1.5px solid #94a3b8;
      border-radius: 8px;
      padding: 16px 12px;
      margin: 18px 0;
      text-align: center;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .mermaid {
      display: inline-block;
      width: 100%;
      text-align: center;
      font-family: 'Inter', sans-serif !important;
    }

    .mermaid svg {
      max-width: 100% !important;
      height: auto !important;
      margin: 0 auto;
    }

    /* Lists */
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
    }

    hr {
      border: 0;
      border-top: 1.5px solid #e2e8f0;
      margin: 24px 0;
    }

    a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }

    .toc {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>

  ${parsedHtml}

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
      sequence: { useMaxWidth: true, showSequenceNumbers: true },
      er: { useMaxWidth: true }
    });

    // Wait until diagrams are converted to SVG
    window.addEventListener('load', async () => {
      try {
        await mermaid.run({ querySelector: '.mermaid' });
        console.log('All mermaid diagrams rendered!');
      } catch (e) {
        console.warn('Mermaid rendering notice:', e);
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
console.log('Pre-rendered HTML saved to:', htmlPath);

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

let selectedBrowser = chromeCandidates.find(fs.existsSync);
if (!selectedBrowser) {
  console.error('Neither Google Chrome nor Edge found on system');
  process.exit(1);
}

console.log('Rendering PDF via:', selectedBrowser);
const fileUrl = 'file:///' + htmlPath.replace(/\\\\/g, '/');

const printCmd = `"${selectedBrowser}" --headless=new --disable-gpu --virtual-time-budget=6000 --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${fileUrl}"`;

try {
  execSync(printCmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log('\n========================================');
    console.log('✅ SUCCESS! PDF generated successfully:');
    console.log(pdfPath);
    console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('========================================\n');
  }
} catch (err) {
  console.error('PDF Generation Error:', err.message);
  process.exit(1);
}
