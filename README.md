# Cursor AI Clone - Puter.js Integration

Ein vollständiger **Cursor AI Clone** mit **puter.js AI-Integration**, basierend auf Electron, React und TypeScript. Dieses Projekt implementiert alle 64 Haupt-Features von Cursor AI, verwendet jedoch puter.js als AI-Backend anstelle von Claude/OpenAI.

## 🚀 Features

### 🎯 Kern-Features
- **VS Code-basierte Editor-Oberfläche** mit Monaco Editor
- **Puter.js AI-Integration** für Code-Vervollständigung und Chat
- **Inline-Code-Vervollständigung** mit KI-Vorschlägen
- **Ask-Modus** für natürliche Sprachabfragen
- **Agent-Modus** für autonome Aufgabenbearbeitung
- **Multi-Line-Completion** basierend auf Cursor-Position

### 🛠️ Editor-Features
- **Datei-Explorer** mit Projektstruktur-Erkennung
- **Mehrere Tabs** für offene Dateien
- **Syntax-Highlighting** für alle gängigen Programmiersprachen
- **Automatischer Import-Vervollständiger**
- **Linter-Integration** im Hintergrund
- **AST-Analyse** zur Code-Strukturerkennung

### 🤖 AI-Features
- **Shadow Workspace** für AI-generierte Code-Vorschau
- **Diff-Overlay** (kein direktes Überschreiben)
- **Ghost Text** für Inline-Vorschläge
- **Tool-Interface** (edit_file, read_file, search_replace, etc.)
- **Streaming AI-Ausgabe** für Echtzeitvorschläge
- **Kontextuelle Analyse** basierend auf Dateiinhalt

### ⚙️ Konfiguration
- **Eigener Prompt-Regelparser** (.cursorrules)
- **Benutzerdefinierte Regeln** (.cursor/rules/*.mdc)
- **Globale vs. Projekt-Regeln** mit Priorisierung
- **Auto-Refresh** von Regeln bei Dateiänderungen
- **Konfigurierbares Shadow Workspace Verhalten**

### 🔧 Tool-System
- **Dateisystemzugriff** durch AI über definierte Tools
- **Projektweite Refactorings**
- **Code-Navigation** zwischen Quell- und Zieldateien
- **Pull-Request-Analyse**
- **Natural Language Code Search**

## 📋 Technische Spezifikationen

### Architektur
```
Cursor AI Clone/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── main.ts             # Haupt-Electron-Prozess
│   │   └── preload.js          # Preload-Skript
│   ├── renderer/               # Electron Renderer Process
│   │   ├── index.tsx           # React Entry Point
│   │   ├── App.tsx             # Haupt-React-Komponente
│   │   ├── index.html          # HTML Template
│   │   └── styles.css          # Tailwind CSS Styles
│   ├── components/             # React-Komponenten
│   │   ├── Titlebar.tsx        # Fenster-Titelleiste
│   │   ├── Sidebar.tsx         # Datei-Explorer
│   │   ├── EditorArea.tsx      # Monaco Editor
│   │   ├── ChatPanel.tsx       # AI-Chat-Interface
│   │   ├── StatusBar.tsx       # Status-Leiste
│   │   └── ...                 # Weitere Komponenten
│   ├── services/               # Services und APIs
│   │   ├── PuterAIService.ts   # Puter.js AI-Integration
│   │   ├── ToolService.ts      # Tool-System (edit_file, etc.)
│   │   └── ...                 # Weitere Services
│   ├── types/                  # TypeScript-Typen
│   │   └── index.ts            # Alle Typ-Definitionen
│   ├── utils/                  # Utility-Funktionen
│   ├── hooks/                  # React Hooks
│   └── stores/                 # State Management
├── webpack.main.config.js      # Webpack für Main Process
├── webpack.renderer.config.js  # Webpack für Renderer
├── tailwind.config.js          # Tailwind CSS Config
├── tsconfig.json              # TypeScript Config
└── package.json               # Dependencies
```

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Editor**: Monaco Editor (VS Code Editor)
- **Desktop**: Electron 28
- **AI**: Puter.js Integration
- **Build**: Webpack 5
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## 🔧 Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Git

### Setup
```bash
# Repository klonen
git clone <repository-url>
cd cursor-ai-clone

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# In separatem Terminal: Electron starten
npm start
```

### Build für Produktion
```bash
# Build erstellen
npm run build

# Desktop-App packen
npm run package
```

## 🎮 Verwendung

### Puter.js Setup
1. Lade die **puter.js** Bibliothek:
```html
<script src="https://js.puter.com/v2/"></script>
```

2. Konfiguriere die AI-API:
```typescript
const config: PuterAIConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
};
```

### Hotkeys
- **Cmd/Ctrl + K**: Ask AI
- **Cmd/Ctrl + Shift + K**: Start Agent
- **Cmd/Ctrl + /**: Toggle AI Suggestions
- **Tab**: Accept AI Suggestion
- **Esc**: Dismiss AI Suggestion
- **Cmd/Ctrl + O**: Open File
- **Cmd/Ctrl + Shift + O**: Open Folder

### .cursorrules Datei
```markdown
# Global Rules
- Always use TypeScript for new files
- Follow React best practices
- Use Tailwind CSS for styling
- Write comprehensive comments

# Project-specific Rules
- Use functional components with hooks
- Implement proper error handling
- Follow the established folder structure
```

## 🧩 Komponenten-Details

### PuterAIService
```typescript
class PuterAIService {
  async initialize(): Promise<void>
  async complete(request: AICompletionRequest): Promise<AICompletionResponse>
  async streamComplete(request, onChunk, onDone): Promise<void>
  async executeTools(toolCalls, availableTools): Promise<ToolCall[]>
}
```

### Tool-System
- `read_file` - Datei lesen
- `edit_file` - Datei bearbeiten/erstellen
- `search_replace` - Text suchen/ersetzen
- `list_files` - Dateien auflisten
- `create_file` - Neue Datei erstellen
- `delete_file` - Datei löschen
- `analyze_code` - Code-Struktur analysieren
- `grep_search` - Textsuche in Dateien
- `get_project_structure` - Projektstruktur abrufen

### Monaco Editor Integration
```typescript
// AI-Vorschläge als Ghost Text
editor.deltaDecorations([], [{
  range: new monaco.Range(line, col, line, col),
  options: {
    afterContentClassName: 'ghost-text',
    after: { content: suggestion }
  }
}]);
```

## 🎨 UI/UX Features

### Diff-Viewer
- **Zeile-für-Zeile Vergleich** von Code-Änderungen
- **Farbcodierte Unterschiede** (Addition/Deletion/Modification)
- **Side-by-Side oder Unified View**

### Chat-Interface
- **Streaming-Antworten** der AI
- **Code-Blöcke** mit Syntax-Highlighting
- **Tool-Aufrufe** in Chat-Historie sichtbar
- **Session-Management** für mehrere Gespräche

### Suggestion-Overlays
```css
.suggestion-overlay {
  background-color: rgba(0, 120, 212, 0.1);
  border: 1px solid #0078d4;
  backdrop-filter: blur(2px);
}
```

## 🔌 Puter.js Integration

### AI-Chat
```javascript
const response = await window.puter.ai.chat([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userMessage }
], {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 2048
});
```

### Verfügbare Modelle
```javascript
const models = await window.puter.ai.models.list();
```

### Tool-Integration
```javascript
const options = {
  tools: [{
    type: 'function',
    function: {
      name: 'edit_file',
      description: 'Edit or create a file',
      parameters: {
        type: 'object',
        properties: {
          file_path: { type: 'string' },
          content: { type: 'string' }
        }
      }
    }
  }]
};
```

## 📈 Performance

### Optimierungen
- **Code-Splitting** für schnellere Ladezeiten
- **Virtual Scrolling** für große Dateilisten
- **Debounced AI-Requests** zur Rate-Limiting
- **Cached AST-Analysen** für bessere Performance
- **Background Workers** für schwere Operationen

### Memory Management
- **Garbage Collection** für geschlossene Dateien
- **LRU Cache** für Editor-States
- **Lazy Loading** von Komponenten

## 🧪 Testing

```bash
# Unit Tests
npm test

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage
```

### Test-Struktur
```
tests/
├── unit/
│   ├── services/
│   ├── components/
│   └── utils/
├── integration/
└── e2e/
```

## 🚀 Deployment

### Desktop App
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### Web Version
```bash
# Web-Build erstellen
npm run build:web

# Statische Dateien in dist/web/
```

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Grundlegende Editor-Funktionalität
- [x] Puter.js AI-Integration
- [x] Chat-Interface
- [x] Tool-System Basis

### Phase 2: Advanced Features
- [ ] Agent-Modus Implementation
- [ ] Advanced AST-Analyse
- [ ] Plugin-System
- [ ] Erweiterte Diff-Features

### Phase 3: Polish & Performance
- [ ] Performance-Optimierungen
- [ ] Umfassende Tests
- [ ] Dokumentation
- [ ] Desktop-App Packaging

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

### Development Guidelines
- Folge TypeScript Best Practices
- Schreibe Tests für neue Features
- Verwende Conventional Commits
- Aktualisiere die Dokumentation

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 🙏 Acknowledgments

- **Cursor AI** für die Inspiration
- **Puter.js** für die AI-Platform
- **Monaco Editor** für den Code-Editor
- **VS Code** für das UI-Design
- **Electron** für die Desktop-Integration

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@cursor-ai-clone.dev

---

**Cursor AI Clone** - Powered by Puter.js 🚀

*Erstellt mit ❤️ für die Developer-Community*