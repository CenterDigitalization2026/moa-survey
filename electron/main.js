const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

let mainWindow = null;
let serverProcess = null;

// Determine if we are running in dev mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Resolve GOOGLE_SCRIPT_URL
function resolveGoogleScriptUrl() {
  if (process.env.GOOGLE_SCRIPT_URL) {
    return process.env.GOOGLE_SCRIPT_URL;
  }
  const candidatePaths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.next/standalone/.env.local'),
    path.join(process.resourcesPath || '', 'app/.env.local')
  ];
  for (const envPath of candidatePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const text = fs.readFileSync(envPath, 'utf8');
        const match = text.match(/GOOGLE_SCRIPT_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    } catch (e) {
      console.warn('[Electron] Could not read env from', envPath, e);
    }
  }
  return "https://script.google.com/macros/s/AKfycbxqsenftjcEE2Pki7qa5VBL79xnAp1Pm1ts6znTRoYHGV558UaoSWKbeFuKC2BfdnF8cA/exec";
}

// Dynamically find a free port
async function getFreePort() {
  try {
    const getPortModule = await import('get-port');
    const getPort = getPortModule.default;
    return await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005] });
  } catch (err) {
    console.warn('[Electron] get-port dynamic import failed, falling back to net server:', err);
    return new Promise((resolve, reject) => {
      const netServer = require('net').createServer();
      netServer.listen(0, '127.0.0.1', () => {
        const port = netServer.address().port;
        netServer.close(() => resolve(port));
      });
      netServer.on('error', reject);
    });
  }
}

// Locate Next.js standalone server.js
function findStandaloneServer() {
  const possiblePaths = [
    path.join(__dirname, '../.next/standalone/server.js'),
    path.join(__dirname, '../.next/standalone/moa-survey/server.js'),
    path.join(process.resourcesPath || '', 'app/.next/standalone/server.js'),
    path.join(process.resourcesPath || '', 'app/.next/standalone/moa-survey/server.js')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Wait for the HTTP server to respond
function waitForServer(port, timeoutMs = 30000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    function ping() {
      if (Date.now() - startTime > timeoutMs) {
        return reject(new Error(`Standalone server failed to respond within ${timeoutMs}ms on port ${port}`));
      }

      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        // Any HTTP response means the server is up
        res.resume();
        resolve();
      });

      req.on('error', () => {
        setTimeout(ping, 200);
      });

      req.setTimeout(1000, () => {
        req.destroy();
        setTimeout(ping, 200);
      });
    }

    ping();
  });
}

// Terminate child process cleanly (including tree-kill on Windows)
function killServerProcess() {
  if (serverProcess && !serverProcess.killed) {
    console.log('[Electron] Terminating standalone server process PID:', serverProcess.pid);
    try {
      if (process.platform === 'win32' && serverProcess.pid) {
        execSync(`taskkill /pid ${serverProcess.pid} /T /F`);
      } else {
        serverProcess.kill('SIGTERM');
      }
    } catch (e) {
      try {
        serverProcess.kill();
      } catch {}
    }
    serverProcess = null;
  }
}

// Start Next.js standalone server
async function startStandaloneServer(port, googleScriptUrl) {
  const serverPath = findStandaloneServer();
  if (!serverPath) {
    throw new Error('Standalone server.js was not found. Please ensure Next.js build completed.');
  }

  const serverDir = path.dirname(serverPath);
  console.log('[Electron] Starting standalone server from:', serverPath);
  console.log('[Electron] Working dir:', serverDir);

  // In packaged app, process.execPath is the app binary which has Node.js embedded.
  // Setting ELECTRON_RUN_AS_NODE: '1' executes serverPath with embedded Node.
  const isPackaged = app.isPackaged;
  const execCmd = isPackaged ? process.execPath : 'node';

  const env = {
    ...process.env,
    PORT: String(port),
    HOSTNAME: '127.0.0.1',
    GOOGLE_SCRIPT_URL: googleScriptUrl,
    NODE_ENV: 'production',
    ...(isPackaged ? { ELECTRON_RUN_AS_NODE: '1' } : {})
  };

  serverProcess = spawn(execCmd, [serverPath], {
    cwd: serverDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Next.js Server]: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Next.js Server Error]: ${data.toString().trim()}`);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[Electron] Next.js server exited with code: ${code}, signal: ${signal}`);
  });

  await waitForServer(port);
  console.log(`[Electron] Next.js standalone server is ready on http://127.0.0.1:${port}`);
}

async function createWindow() {
  let appUrl = 'http://localhost:3000';

  if (!isDev) {
    const port = await getFreePort();
    const scriptUrl = resolveGoogleScriptUrl();
    try {
      await startStandaloneServer(port, scriptUrl);
      appUrl = `http://localhost:${port}`;
    } catch (err) {
      console.error('[Electron] Failed to start standalone server:', err);
      dialog.showErrorBox(
        'Ошибка запуска сервера',
        `Не удалось запустить локальный сервер приложения:\n${err.message}`
      );
      app.quit();
      return;
    }
  }

  const iconPath = path.join(__dirname, '../public/logo.png');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  console.log('[Electron] Loading application URL:', appUrl);
  await mainWindow.loadURL(appUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
    killServerProcess();
  });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  killServerProcess();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  killServerProcess();
});

app.on('will-quit', () => {
  killServerProcess();
});

process.on('exit', () => {
  killServerProcess();
});
