import React from 'react';

const ColorPaletteShowcase: React.FC = () => {
  const colorCategories = [
    {
      name: 'Background Colors',
      colors: [
        { name: 'bg-primary', hex: '#101626', description: 'Very dark blue/black' },
        { name: 'bg-secondary', hex: '#1a2332', description: 'Lighter dark blue for cards' },
        { name: 'bg-tertiary', hex: '#2a3441', description: 'Elevated card background' },
      ]
    },
    {
      name: 'Primary Accent Colors (Teal/Cyan)',
      colors: [
        { name: 'primary-50', hex: '#e6f7f8', description: 'Lightest teal' },
        { name: 'primary-100', hex: '#b3e8ea', description: 'Light teal' },
        { name: 'primary-200', hex: '#80d9dc', description: 'Medium light teal' },
        { name: 'primary-300', hex: '#4dcace', description: 'Medium teal' },
        { name: 'primary-400', hex: '#13c4c3', description: 'Main neon accent' },
        { name: 'primary-500', hex: '#1a6b9f', description: 'Primary UI' },
        { name: 'primary-600', hex: '#1a5a8f', description: 'Darker teal' },
        { name: 'primary-700', hex: '#1a497f', description: 'Dark teal' },
        { name: 'primary-800', hex: '#1a386f', description: 'Very dark teal' },
        { name: 'primary-900', hex: '#1a275f', description: 'Darkest teal' },
      ]
    },
    {
      name: 'Secondary Accent Colors (Fuchsia/Magenta)',
      colors: [
        { name: 'secondary-50', hex: '#fce6f3', description: 'Lightest fuchsia' },
        { name: 'secondary-100', hex: '#f7b3d9', description: 'Light fuchsia' },
        { name: 'secondary-200', hex: '#f280bf', description: 'Medium light fuchsia' },
        { name: 'secondary-300', hex: '#ed4da5', description: 'Medium fuchsia' },
        { name: 'secondary-400', hex: '#e846a8', description: 'Data viz accent' },
        { name: 'secondary-500', hex: '#d633a8', description: 'Main fuchsia' },
        { name: 'secondary-600', hex: '#c63398', description: 'Darker fuchsia' },
        { name: 'secondary-700', hex: '#b63388', description: 'Dark fuchsia' },
        { name: 'secondary-800', hex: '#a63378', description: 'Very dark fuchsia' },
        { name: 'secondary-900', hex: '#963368', description: 'Darkest fuchsia' },
      ]
    },
    {
      name: 'Semantic Colors',
      colors: [
        { name: 'success', hex: '#00ff88', description: 'Success green (neon)' },
        { name: 'warning', hex: '#ffaa00', description: 'Warning yellow/orange (neon)' },
        { name: 'error', hex: '#ff0040', description: 'Error red (neon)' },
        { name: 'info', hex: '#13c4c3', description: 'Info blue (matches primary)' },
      ]
    }
  ];

  const componentExamples = [
    {
      name: 'Buttons',
      components: [
        { type: 'btn-primary', text: 'Primary Button', className: 'btn-primary' },
        { type: 'btn-secondary', text: 'Secondary Button', className: 'btn-secondary' },
        { type: 'btn-outline', text: 'Outline Button', className: 'btn-outline' },
      ]
    },
    {
      name: 'Cards',
      components: [
        { type: 'card', text: 'Standard Card', className: 'card p-6' },
        { type: 'card-glow', text: 'Glow Card', className: 'card-glow p-6' },
        { type: 'card-elevated', text: 'Elevated Card', className: 'card-elevated p-6' },
      ]
    },
    {
      name: 'Text Effects',
      components: [
        { type: 'text-glow-primary', text: 'Primary Glow Text', className: 'text-glow-primary text-2xl font-bold' },
        { type: 'text-glow-secondary', text: 'Secondary Glow Text', className: 'text-glow-secondary text-2xl font-bold' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary circuit-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-glow-primary mb-4">
            Capitol Scope
          </h1>
          <h2 className="text-3xl font-semibold text-neutral-200 mb-2">
            Cyberpunk Color Palette
          </h2>
          <p className="text-neutral-400 text-lg">
            Unified color system for the Capitol Scope frontend
          </p>
        </div>

        {/* Color Categories */}
        <div className="space-y-12">
          {colorCategories.map((category) => (
            <div key={category.name} className="card p-8">
              <h3 className="text-2xl font-bold text-primary-400 mb-6">
                {category.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.colors.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div 
                      className="h-20 rounded-lg border border-neutral-700 shadow-lg"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="font-mono text-sm text-neutral-300">{color.name}</p>
                      <p className="font-mono text-xs text-neutral-500">{color.hex}</p>
                      <p className="text-xs text-neutral-400 mt-1">{color.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Component Examples */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-primary-400 mb-8 text-center">
            Component Examples
          </h3>
          <div className="space-y-12">
            {componentExamples.map((section) => (
              <div key={section.name} className="card p-8">
                <h4 className="text-xl font-bold text-secondary-400 mb-6">
                  {section.name}
                </h4>
                <div className="flex flex-wrap gap-4">
                  {section.components.map((component) => (
                    <div key={component.type} className={component.className}>
                      {component.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Visualization Examples */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-primary-400 mb-8 text-center">
            Data Visualization Examples
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart Example */}
            <div className="card p-8">
              <h4 className="text-xl font-bold text-secondary-400 mb-6">Bar Chart</h4>
              <div className="flex items-end justify-center space-x-2 h-40">
                <div className="chart-bar w-8 h-16 rounded-t"></div>
                <div className="chart-bar w-8 h-24 rounded-t"></div>
                <div className="chart-bar w-8 h-32 rounded-t"></div>
                <div className="chart-bar w-8 h-20 rounded-t"></div>
                <div className="chart-bar w-8 h-28 rounded-t"></div>
                <div className="chart-bar w-8 h-36 rounded-t"></div>
              </div>
            </div>

            {/* Line Chart Example */}
            <div className="card p-8">
              <h4 className="text-xl font-bold text-secondary-400 mb-6">Line Chart</h4>
              <div className="relative h-40">
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  <path
                    d="M 0 120 L 50 80 L 100 60 L 150 40 L 200 20 L 250 10 L 300 5"
                    stroke="#e846a8"
                    strokeWidth="3"
                    fill="none"
                    className="drop-shadow-[0_0_10px_rgba(232,70,168,0.5)]"
                  />
                  <circle cx="50" cy="80" r="4" fill="#e846a8" className="drop-shadow-[0_0_5px_rgba(232,70,168,0.8)]" />
                  <circle cx="100" cy="60" r="4" fill="#e846a8" className="drop-shadow-[0_0_5px_rgba(232,70,168,0.8)]" />
                  <circle cx="150" cy="40" r="4" fill="#e846a8" className="drop-shadow-[0_0_5px_rgba(232,70,168,0.8)]" />
                  <circle cx="200" cy="20" r="4" fill="#e846a8" className="drop-shadow-[0_0_5px_rgba(232,70,168,0.8)]" />
                  <circle cx="250" cy="10" r="4" fill="#e846a8" className="drop-shadow-[0_0_5px_rgba(232,70,168,0.8)]" />
                  <circle cx="300" cy="5" r="4" fill="#e846a8" className="drop-shadow-[0_0_5px_rgba(232,70,168,0.8)]" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-16 card p-8">
          <h3 className="text-3xl font-bold text-primary-400 mb-8 text-center">
            Usage Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-secondary-400 mb-4">Typography</h4>
              <ul className="space-y-2 text-neutral-300">
                <li>• Primary Text: Use <code className="text-primary-400">neutral-100</code> or <code className="text-primary-400">neutral-200</code></li>
                <li>• Secondary Text: Use <code className="text-primary-400">neutral-400</code></li>
                <li>• Accent Text: Use <code className="text-primary-400">primary-400</code> or <code className="text-primary-400">secondary-400</code></li>
                <li>• Headings: Use <code className="text-primary-400">primary-300</code> or <code className="text-primary-400">secondary-300</code></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold text-secondary-400 mb-4">Interactive Elements</h4>
              <ul className="space-y-2 text-neutral-300">
                <li>• Primary Buttons: <code className="text-primary-400">primary-400</code> background</li>
                <li>• Secondary Buttons: <code className="text-primary-400">secondary-400</code> background</li>
                <li>• Links: <code className="text-primary-400">primary-400</code> with hover effects</li>
                <li>• Focus States: Use <code className="text-primary-400">primary-400</code> or <code className="text-primary-400">secondary-400</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteShowcase;
