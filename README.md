# Vibe Studio 🏎️

> **The Ferrari of AI-Powered IDEs**
> 
> A next-generation code editor with AI completion, visual debugging, and split-view preview. Built with Tauri for native performance.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

---

## ✨ Features

### 🤖 AI-Powered Development
- **AI Code Completion** - Tab-to-accept inline suggestions (Ollama + OpenAI)
- **Cmd+K Quick Edits** - Natural language code transformations with diff preview
- **Context-Aware Chat** - AI assistant with full codebase understanding
- **Streaming Responses** - First token in <100ms for instant feedback

### 💻 Professional IDE Features
- **LSP Support** - TypeScript, JavaScript, Python, JSON with IntelliSense
- **Visual Debugger** - Breakpoints, variables, call stack inspection
- **Git Integration** - Visual diff viewer, stage, commit, push/pull
- **Multi-Terminal** - Multiple terminal tabs with split support
- **Split View Preview** - Live HTML/React preview with desktop/mobile toggle

### 🎨 Premium Experience
- **5 IDE Themes** - Dark+, Monokai, Dracula, GitHub Dark, Nord
- **Code Snippets** - Quick templates for React, TypeScript, Zustand
- **Quick Actions** - Format, refactor, optimize, generate docs
- **Performance Monitoring** - Real-time metrics and P95 tracking

### 🔒 Privacy & Security
- **Local-First AI** - Ollama support for 100% private coding
- **Secure API Keys** - OS keychain integration (no plaintext storage)
- **No Telemetry** - Your code stays on your machine

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Rust 1.70+ (for Tauri)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/joshsegatt/VibeCodeStudio.git
cd VibeCodeStudio

# Install dependencies
npm install

# Run development server
npm run tauri dev

# Build for production
npm run tauri build
```

### First Launch

1. **Set up AI Provider** (choose one):
   - **Ollama (Recommended)**: Install from [ollama.ai](https://ollama.ai), then `ollama pull codellama:7b`
   - **OpenAI**: Add API key in Settings → API Keys

2. **Open a Project**: File → Open Folder

3. **Start Coding**: AI completion works automatically as you type!

---

## 📖 Usage

### AI Code Completion
- Type code and wait ~150ms
- **Tab** to accept suggestion
- **Esc** to dismiss

### Cmd+K Quick Edits
1. Select code
2. Press **Cmd+K** (or Ctrl+K)
3. Describe changes in natural language
4. Review diff and apply

### Debugger
1. Click gutter to set breakpoint (red dot)
2. Click **Start** in Debug panel
3. Inspect variables and call stack

### Split View Preview
1. Click **Preview** button (👁️)
2. Toggle Desktop/Mobile
3. Open Console for errors

---

## 🎯 vs Cursor IDE

| Feature | Cursor | Vibe Studio |
|---------|--------|-------------|
| AI Completion | ✅ | ✅ |
| Cmd+K Edits | ✅ | ✅ |
| Split Preview | ✅ | ✅ |
| Local AI (Ollama) | ❌ | ✅ **Better** |
| Multi-Provider | ❌ | ✅ **Better** |
| Price | $20/month | ✅ **Free** |
| Privacy | Cloud-based | ✅ **Local-first** |
| Open Source | ❌ | ✅ **Yes** |

---

## 🏗️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Monaco Editor (VS Code engine)
- Zustand (state management)
- Tailwind CSS + Framer Motion

**Backend:**
- Tauri (Rust)
- Native OS integration
- Secure keychain storage

**AI Integration:**
- Ollama (local models)
- OpenAI API
- Anthropic Claude (coming soon)

---

## 📁 Project Structure

```
vibe-studio/
├── src/
│   ├── services/          # AI completion, quick edit, LSP
│   ├── stores/            # Zustand state management
│   ├── ui/
│   │   ├── editor/        # Monaco wrapper, multi-tab
│   │   ├── debug/         # Debugger panel
│   │   ├── preview/       # Split view preview
│   │   └── completion/    # Inline AI completion
│   └── utils/             # Performance, error handling
├── src-tauri/
│   ├── src/
│   │   ├── search.rs      # File search (Rust)
│   │   ├── keychain.rs    # Secure storage
│   │   └── main.rs
│   └── Cargo.toml
└── package.json
```

---

## 🔧 Configuration

### AI Models

**Ollama (Local):**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull codellama:7b        # Code completion
ollama pull qwen2.5-coder:1.5b  # Fast responses
```

**OpenAI:**
- Settings → API Keys → Add OpenAI key
- Automatically falls back if Ollama unavailable

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save File | Ctrl+S |
| Close Tab | Ctrl+W |
| Find | Ctrl+F |
| Quick Edit | Cmd+K / Ctrl+K |
| Go to Definition | F12 |
| Accept Completion | Tab |
| Dismiss Completion | Esc |

---

## 🤝 Contributing

This is proprietary software. Contributions are not accepted at this time.

For bug reports or feature requests, please contact: josh@vibestudio.dev

---

## 📄 License

**Copyright © 2024 Josh Segatt. All Rights Reserved.**

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Monaco Editor team at Microsoft
- Tauri framework contributors
- Ollama for local AI models
- The open-source community

---

## 📞 Support

- **Email**: support@vibestudio.dev
- **GitHub Issues**: [Report a bug](https://github.com/joshsegatt/VibeCodeStudio/issues)
- **Documentation**: [docs.vibestudio.dev](https://docs.vibestudio.dev)

---

**Built with ❤️ by Josh Segatt**

*Vibe Studio - Code at the speed of thought* 🏎️✨
