# Clerk Interface - Financial Insights Dashboard

A modern, AI-powered financial insights dashboard built with React, TypeScript, and Clerk authentication. This application provides interactive data visualization, AI-generated insights, and SQL query generation for financial data analysis.

## 🚀 Features

### Core Functionality
- **AI-Powered Insights**: Generate intelligent financial insights with confidence scoring
- **Interactive Visualizations**: Dynamic charts (Bar, Line, Pie) with Recharts library
- **SQL Query Generation**: Auto-generated SQL queries for data analysis
- **Real-time Data Processing**: Live data updates and trend analysis
- **Responsive Design**: Mobile-first approach with modern UI/UX

### Dashboard Components
- **Insights Panel**: AI-generated financial risk assessments and recommendations
- **Chart Visualizations**: Interactive charts with hover effects and animations
- **SQL Query Editor**: Copy and run generated SQL queries
- **AI Chat Interface**: Ask questions about your financial data
- **Export & Sharing**: Download insights and share with team members

### Technical Features
- **TypeScript**: Full type safety and modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Smooth animations and transitions
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Theme Support**: Light/dark mode with CSS custom properties

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **Charts**: Recharts (Bar, Line, Pie charts)
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Package Manager**: npm/bun
- **Authentication**: Clerk
- **Routing**: React Router

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clerk-interface
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
   VITE_API_BASE_URL=your_api_url_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Build for production**
   ```bash
   npm run build
   # or
   bun run build
   ```

## 🎯 Usage

### Navigation
- **Home Page**: Main dashboard with spreadsheet interface
- **Insights Page**: AI-generated financial insights and visualizations
- **Sheet Page**: Individual spreadsheet management

### Generating Insights
1. Navigate to the Insights page
2. Select an insight category (All, Warnings, Positive)
3. View detailed analysis with charts and metrics
4. Copy generated SQL queries for data analysis
5. Export insights or share with team members

### AI Chat
- Use the chat interface in the sidebar to ask questions about your data
- Get real-time AI responses and suggestions
- Generate new insights based on your queries

## 🏗️ Project Structure

```
clerk-interface/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── AiCommandBar.tsx
│   │   ├── FABInsights.tsx
│   │   ├── FormulaBar.tsx
│   │   ├── SpreadsheetGrid.tsx
│   │   └── ThemeToggle.tsx
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home dashboard
│   │   ├── InsightsPage.tsx # Financial insights
│   │   ├── SheetPage.tsx   # Spreadsheet view
│   │   └── NotFound.tsx    # 404 page
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Utility functions
│   └── main.tsx           # Application entry point
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Customization

### Theme Configuration
The application uses CSS custom properties for theming. Customize colors in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}
```

### Chart Styling
Charts automatically adapt to the current theme. Customize chart colors in the chart components:

```tsx
// Example: Custom chart colors
<Bar dataKey="value" fill="hsl(var(--primary))" />
```

### Component Styling
All components use Tailwind CSS classes and can be customized through the `tailwind.config.ts` file.

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Adaptive grid layouts
- Touch-friendly interactions
- Responsive typography
- Flexible sidebar navigation

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript strict mode enabled
- Component-based architecture

### State Management
- Zustand for global state management
- React hooks for local state
- Context API for theme management

## 🚀 Deployment

### Build Process
1. Run `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Configure environment variables on your hosting platform

### Recommended Hosting
- Vercel (recommended for React apps)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain responsive design principles
- Add proper error handling
- Include TypeScript types for all props

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples

## 🔮 Roadmap

- [ ] Advanced chart customization
- [ ] Real-time data streaming
- [ ] Multi-language support
- [ ] Advanced AI models integration
- [ ] Team collaboration features
- [ ] API rate limiting and caching
- [ ] Advanced export formats (PDF, Excel)

---

Built with ❤️ using modern web technologies
