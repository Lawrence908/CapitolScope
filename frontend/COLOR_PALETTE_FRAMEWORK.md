# Capitol Scope - Unified Cyberpunk Color Palette Framework

## Overview
This document defines the unified color palette for the Capitol Scope frontend, based on the cyberpunk aesthetic from the hero image with neon teal/cyan and fuchsia/magenta accents, high-contrast lighting, and futuristic styling.

## Color Analysis from Image & Brand Guides

Based on the image description and cross-referencing all brand guides, here are the most accurate colors:

**From Image Description:**
- Background: Very dark, deep blue or black
- Capitol Dome: Vibrant, glowing teal/cyan
- Circuit Patterns & Line Graph: Bright, intense fuchsia/magenta
- Text Glow: Cyan/teal transitioning to deeper blue/teal

**From Brand Guides:**
- Most consistent: `#101626` (Dark Base), `#13c4c3` (Neon Accent), `#e846a8` (Data Viz)
- Secondary: `#1a2332`, `#2a3441`, `#1a6b9f`

## Color Categories

### 1. Background Colors
**Purpose**: Primary background colors for the application
- `bg-primary`: Very dark blue/black background
- `bg-secondary`: Slightly lighter dark background for cards/sections
- `bg-tertiary`: Subtle dark blue for depth and layering

**Hex Values** (unified from all sources):
- `bg-primary`: `#101626` (Very dark blue/black - most consistent across guides)
- `bg-secondary`: `#1a2332` (Lighter dark blue for cards — improved readability)
- `bg-tertiary`: `#2a3441` (Elevated card background / panels)

### 2. Primary Accent Colors (Teal/Cyan)
**Purpose**: Main accent color for primary elements, text, and highlights
- `primary-50`: Lightest teal for subtle backgrounds
- `primary-100`: Light teal for hover states
- `primary-200`: Medium light teal for borders
- `primary-300`: Medium teal for secondary elements
- `primary-400`: Bright teal for interactive elements
- `primary-500`: Main teal/cyan color (vibrant)
- `primary-600`: Darker teal for active states
- `primary-700`: Dark teal for pressed states
- `primary-800`: Very dark teal for shadows
- `primary-900`: Darkest teal for deep shadows

**Hex Values** (unified from all sources):
- `primary-50`: `#e6f7f8` (Lightest teal)
- `primary-100`: `#b3e8ea` (Light teal)
- `primary-200`: `#80d9dc` (Medium light teal)
- `primary-300`: `#4dcace` (Medium teal)
- `primary-400`: `#13c4c3` (Bright teal - main neon accent from brand guide)
- `primary-500`: `#1a6b9f` (Main vibrant teal/cyan - primary UI)
- `primary-600`: `#1a5a8f` (Darker teal)
- `primary-700`: `#1a497f` (Dark teal)
- `primary-800`: `#1a386f` (Very dark teal)
- `primary-900`: `#1a275f` (Darkest teal)

### 3. Secondary Accent Colors (Fuchsia/Magenta)
**Purpose**: Secondary accent for interactive elements, data lines, alerts, and key indicators
- `secondary-50`: Lightest fuchsia for subtle backgrounds
- `secondary-100`: Light fuchsia for hover states
- `secondary-200`: Medium light fuchsia for borders
- `secondary-300`: Medium fuchsia for secondary elements
- `secondary-400`: Bright fuchsia for interactive elements
- `secondary-500`: Main fuchsia/magenta color (bright)
- `secondary-600`: Darker fuchsia for active states
- `secondary-700`: Dark fuchsia for pressed states
- `secondary-800`: Very dark fuchsia for shadows
- `secondary-900`: Darkest fuchsia for deep shadows

**Hex Values** (unified from all sources):
- `secondary-50`: `#fce6f3` (Lightest fuchsia)
- `secondary-100`: `#f7b3d9` (Light fuchsia)
- `secondary-200`: `#f280bf` (Medium light fuchsia)
- `secondary-300`: `#ed4da5` (Medium fuchsia)
- `secondary-400`: `#e846a8` (Bright fuchsia - data viz accent - most consistent)
- `secondary-500`: `#d633a8` (Main bright fuchsia/magenta)
- `secondary-600`: `#c63398` (Darker fuchsia)
- `secondary-700`: `#b63388` (Dark fuchsia)
- `secondary-800`: `#a63378` (Very dark fuchsia)
- `secondary-900`: `#963368` (Darkest fuchsia)

### 4. Neutral Colors
**Purpose**: Text, borders, and neutral UI elements
- `neutral-50`: Lightest neutral (almost white)
- `neutral-100`: Light neutral for subtle backgrounds
- `neutral-200`: Light neutral for borders
- `neutral-300`: Medium light neutral
- `neutral-400`: Medium neutral
- `neutral-500`: Main neutral
- `neutral-600`: Dark neutral
- `neutral-700`: Dark neutral for text
- `neutral-800`: Very dark neutral
- `neutral-900`: Darkest neutral (almost black)

**Hex Values** (cyberpunk-optimized):
- `neutral-50`: `#ffffff` (Lightest neutral - pure white)
- `neutral-100`: `#f8f9fa` (Light neutral)
- `neutral-200`: `#e9ecef` (Light neutral for borders)
- `neutral-300`: `#dee2e6` (Medium light neutral)
- `neutral-400`: `#ced4da` (Medium neutral)
- `neutral-500`: `#adb5bd` (Main neutral)
- `neutral-600`: `#6c757d` (Dark neutral)
- `neutral-700`: `#495057` (Dark neutral for text)
- `neutral-800`: `#343a40` (Very dark neutral)
- `neutral-900`: `#212529` (Darkest neutral)

### 5. Semantic Colors
**Purpose**: Status indicators and semantic meaning
- `success`: Green for success states
- `warning`: Yellow/orange for warning states
- `error`: Red for error states
- `info`: Blue for informational states

**Hex Values** (cyberpunk-optimized):
- `success`: `#00ff88` (Success green - neon)
- `warning`: `#ffaa00` (Warning yellow/orange - neon)
- `error`: `#ff0040` (Error red - neon)
- `info`: `#13c4c3` (Info blue - matches primary neon accent)

### 6. Special Effects Colors
**Purpose**: Glow effects and special visual elements
- `glow-primary`: Teal glow effect
- `glow-secondary`: Fuchsia glow effect
- `glow-white`: White glow effect
- `shadow-primary`: Teal shadow
- `shadow-secondary`: Fuchsia shadow

**Hex Values** (cyberpunk-optimized):
- `glow-primary`: `#13c4c3` (Teal glow - matches primary neon accent)
- `glow-secondary`: `#e846a8` (Fuchsia glow - matches secondary accent)
- `glow-white`: `#ffffff` (White glow)
- `shadow-primary`: `#1a6b9f` (Teal shadow - matches primary UI)
- `shadow-secondary`: `#d633a8` (Fuchsia shadow - matches secondary)

## Usage Guidelines

### Typography
- **Primary Text**: Use `neutral-100` or `neutral-200` for main text
- **Secondary Text**: Use `neutral-400` for secondary text
- **Accent Text**: Use `primary-400` or `secondary-400` for highlighted text
- **Headings**: Use `primary-300` or `secondary-300` for headings

### Interactive Elements
- **Primary Buttons**: `primary-500` background with `primary-400` hover
- **Secondary Buttons**: `secondary-500` background with `secondary-400` hover
- **Links**: `primary-400` with `primary-300` hover
- **Focus States**: Use `primary-400` or `secondary-400` for focus rings

### Data Visualization
- **Bar Charts**: Use `primary-400` to `primary-600` gradient
- **Line Graphs**: Use `secondary-400` to `secondary-600` gradient
- **Circuit Patterns**: Use `secondary-500` for lines, `secondary-400` for nodes

### Cards and Containers
- **Standard Cards**: `bg-secondary` with subtle border `primary-800/20`
- **Elevated/Highlight Cards**: `bg-tertiary` with `primary-600/20` border
- **Card Shadows**: Use `shadow-primary` or `shadow-secondary` for glow accents

## Implementation Notes

1. **Dark Mode**: This palette is designed for dark mode as the primary theme
2. **Glow Effects**: Implement subtle glow effects using box-shadow with the glow colors
3. **Gradients**: Use gradients between primary and secondary colors for visual interest
4. **Transparency**: Use rgba() versions of colors for overlay effects
5. **Animation**: Implement smooth transitions between color states

## Unified Color Palette Summary

### Core Colors (Most Accurate from All Sources):
- **Primary Background**: `#101626` (Dark Base - most consistent across guides)
- **Primary Neon Accent**: `#13c4c3` (Bright teal - from brand guide)
- **Secondary Neon Accent**: `#e846a8` (Bright fuchsia - data viz)
- **Primary UI**: `#1a6b9f` (Mid-blue for interactive elements)
- **Secondary Background (Cards)**: `#1a2332` (Readable, dark blue)
- **Tertiary Background (Elevated Cards/Panels)**: `#2a3441`

### Key Design Principles:
1. **Dark Mode First**: All backgrounds are dark with high contrast
2. **Neon Glow Effects**: Use `#13c4c3` for teal glows, `#e846a8` for fuchsia glows
3. **Data Visualization**: Use `#e846a8` for charts, graphs, and data lines
4. **Interactive Elements**: Use `#13c4c3` for buttons, links, and hover states
5. **Typography**: Light text on dark backgrounds with subtle glows

## Next Steps

1. ✅ Extract hex values from the image using color picker tools
2. ✅ Fill in the hex values in this framework
3. Update Tailwind config with the new color palette
4. Create CSS custom properties for the colors
5. Update component styles to use the new palette
6. Test accessibility and contrast ratios
7. Create a color palette showcase page

---

**Note**: This framework is based on the cyberpunk aesthetic described in the image, featuring high contrast, neon accents, and futuristic styling. The colors should create a cohesive, professional, and visually striking interface that matches the Capitol Scope brand identity.
