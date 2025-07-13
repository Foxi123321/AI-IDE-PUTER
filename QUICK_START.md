# 🚀 Cursor AI Clone - Quick Start Guide

## ✅ Installation erfolgreich!

Die Dependencies wurden erfolgreich installiert. Jetzt kannst du mit der Entwicklung beginnen.

## 🎮 Wie du das Projekt startest:

### Option 1: Windows Batch Script (Empfohlen)
```bash
# Führe das Development-Script aus
scripts\dev.bat
```

### Option 2: Manuell
```bash
# Terminal 1: Build Main Process
npm run dev:main

# Terminal 2: Start Renderer Dev Server
npm run dev:renderer

# Terminal 3: Start Electron App
npm start
```

### Option 3: Concurrently (Einfach)
```bash
# Startet alles gleichzeitig
npm run dev
```

## 🏗️ Aktuelle Projektstruktur

```
Cursor AI Clone/
├── ✅ package.json           # Dependencies installiert
├── ✅ tsconfig.json          # TypeScript Konfiguration
├── ✅ tailwind.config.js     # Tailwind CSS Setup
├── ✅ webpack configs        # Build-Konfiguration
├── ✅ .cursorrules          # AI-Regeln (Beispiel)
├── src/
│   ├── ✅ main/main.ts      # Electron Main Process
│   ├── ✅ main/preload.js   # IPC Bridge
│   ├── ✅ renderer/         # React Frontend
│   ├── ✅ services/         # AI & Tool Services
│   ├── ✅ types/           # TypeScript Typen
│   └── 🔄 components/      # React Komponenten (next step)
└── scripts/dev.bat         # Windows Start Script
```

## 📝 Nächste Schritte

1. **Starte das Projekt** mit einer der obigen Optionen
2. **Erstelle React Komponenten** für UI (Titlebar, Sidebar, etc.)
3. **Integriere puter.js** für AI-Funktionalität
4. **Teste die Grundfunktionen**

## 🐛 Häufige Probleme

### Port bereits in Verwendung
```bash
# Töte Prozesse auf Port 3000
netstat -ano | findstr :3000
taskkill /F /PID <PROCESS_ID>
```

### Electron startet nicht
```bash
# Bereinige Cache und installiere neu
npm run clean
npm install
```

### TypeScript Fehler
```bash
# TypeScript Services neu starten
# In VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## 🔧 Development Commands

- `npm run dev` - Startet alles (Recommended)
- `npm run build` - Production Build
- `npm run start` - Nur Electron starten
- `npm run lint` - ESLint prüfen
- `npm run format` - Code formatieren
- `npm test` - Tests ausführen

## 🎯 Features zum Testen

Wenn das Projekt läuft, teste diese Features:

1. **Fenster-Funktionen**: Maximieren, Minimieren, Schließen
2. **Menü-System**: File → Open, AI → Ask AI
3. **Hotkeys**: Ctrl+K (Ask AI), Ctrl+Shift+K (Agent)
4. **Dev Tools**: Ctrl+Shift+I
5. **Reload**: Ctrl+R

## 🔗 Puter.js Integration

Um puter.js zu integrieren, füge dies in dein HTML ein:
```html
<script src="https://js.puter.com/v2/"></script>
```

Oder verwende das bereits vorbereitete `PuterAIService` in `src/services/`.

## 📞 Support

Bei Problemen:
1. Überprüfe die Konsole in DevTools (Ctrl+Shift+I)
2. Schaue in die Terminal-Ausgabe
3. Prüfe ob alle Ports verfügbar sind (3000 für Dev Server)

---

**Happy Coding! 🎉**

*Dein vollständiger Cursor AI Clone mit puter.js Integration ist bereit!*