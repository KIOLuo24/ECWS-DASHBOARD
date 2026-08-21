diff --git a/server.js b/server.js
new file mode 100644
index 0000000000000000000000000000000000000000..729b62c5668c0912988ca11599a2ca314194edc9
--- /dev/null
+++ b/server.js
@@ -0,0 +1,18 @@
+import { createServer } from 'node:http';
+import { readFile } from 'node:fs/promises';
+import { extname, join, normalize } from 'node:path';
+
+const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
+const port = Number(process.env.PORT || 5173);
+createServer(async (req, res) => {
+  try {
+    const safePath = normalize(req.url === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname).replace(/^\.\.(\/|\\|$)/, '');
+    const filePath = join(process.cwd(), safePath);
+    const body = await readFile(filePath);
+    res.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream' });
+    res.end(body);
+  } catch {
+    res.writeHead(404);
+    res.end('Not found');
+  }
+}).listen(port, '0.0.0.0', () => console.log(`KIOwork dashboard: http://localhost:${port}`));
