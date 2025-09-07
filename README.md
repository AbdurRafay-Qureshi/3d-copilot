# Real Circuit Image Copilot

Transform natural language prompts into realistic circuit diagrams, breadboard layouts, PCBs, 3D renders, and assembly guides using AI and open-source EDA tools.

## 🎯 Features

- **Natural Language Input**: Describe your circuit in plain English
- **AI-Powered Generation**: Uses Tambo AI to generate structured circuit specifications
- **Multiple Views**: Schematic, breadboard, PCB, and 3D visualizations
- **Export Options**: PDF, PNG, SVG, STL, and OBJ formats
- **Assembly Guide**: Step-by-step instructions with progress tracking
- **Open Source**: Built entirely with free and open-source tools

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** for components
- **React Three Fiber** for 3D rendering

### AI Integration
- **Tambo AI** for circuit specification generation
- **Ollama** as local LLM fallback
- **Zod** for data validation

### EDA Integration
- **KiCad** for PCB design and footprints
- **netlistsvg** for schematic generation
- **Fritzing** for breadboard layouts
- **Three.js** for 3D visualization

### Export & Processing
- **pdfkit** for PDF generation
- **Sharp.js** for image processing
- **Canvas API** for image compositing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-circuit-image-copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```
   TAMBO_API_KEY=your_tambo_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── circuit/          # Circuit-specific components
├── lib/                  # Utility libraries
│   ├── ai/               # AI integration
│   ├── circuit/          # EDA tools integration
│   └── utils/            # General utilities
└── types/                # TypeScript type definitions
```

## 🎨 Usage

### Basic Workflow

1. **Describe your circuit**: Enter a natural language description like "Build a 555 LED blinker circuit"

2. **Review the specification**: Check the generated components, connections, and assembly steps

3. **View different representations**:
   - **Schematic**: Electronic circuit diagram
   - **Breadboard**: Physical layout for prototyping
   - **PCB**: Printed circuit board design
   - **3D**: Interactive 3D visualization

4. **Follow assembly guide**: Step-by-step instructions with progress tracking

5. **Export your design**: Download in various formats (PDF, PNG, SVG, STL, OBJ)

### Example Prompts

- "Build a 555 LED blinker circuit"
- "Create an Arduino temperature sensor with LCD display"
- "Design a simple audio amplifier using LM386"
- "Make a basic power supply with voltage regulation"
- "Build a digital clock with 7-segment displays"

## 🔧 Configuration

### AI Models

The app supports multiple AI providers:

- **Tambo AI** (primary): Cloud-based AI service
- **Ollama** (fallback): Local LLM for offline use

### EDA Tools

- **KiCad**: For PCB footprints and 3D models
- **Fritzing**: For breadboard layouts
- **netlistsvg**: For schematic generation

### Export Formats

- **PDF**: Complete assembly guide with all diagrams
- **PNG**: High-quality images for sharing
- **SVG**: Vector graphics for editing
- **STL**: 3D models for printing
- **OBJ**: 3D models for CAD software

## 🧪 Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tambo AI** for AI-powered circuit generation
- **KiCad** for PCB design tools
- **Fritzing** for breadboard layouts
- **netlistsvg** for schematic generation
- **Three.js** for 3D visualization
- **shadcn/ui** for beautiful UI components

## 🐛 Known Issues

- 3D rendering requires WebGL support
- Some complex circuits may not generate perfectly
- Export functionality requires modern browsers

## 🔮 Roadmap

- [ ] Support for more complex circuits
- [ ] Integration with more EDA tools
- [ ] Real-time collaboration
- [ ] Mobile app version
- [ ] Plugin system for custom components
- [ ] Integration with PCB manufacturing services

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Built with ❤️ using Next.js, TypeScript, and open-source EDA tools.
