# App Icons

The `icon.svg` file is the source icon for Chief of Staff.

## Generate PNG icons from SVG

You can generate the required PNG icons using any of these methods:

### Option 1: Online converter
1. Visit https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Convert to PNG at these sizes:
   - 192x192 → save as `icon-192.png`
   - 512x512 → save as `icon-512.png`
   - 512x512 (with 10% padding) → save as `icon-maskable.png`

### Option 2: Using ImageMagick (command line)
```bash
# Install ImageMagick if needed
brew install imagemagick

# Generate icons
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
convert icon.svg -resize 512x512 -bordercolor transparent -border 51 icon-maskable.png
```

### Option 3: Using Inkscape (command line)
```bash
# Install Inkscape if needed
brew install inkscape

# Generate icons
inkscape icon.svg --export-type=png --export-filename=icon-192.png -w 192 -h 192
inkscape icon.svg --export-type=png --export-filename=icon-512.png -w 512 -h 512
inkscape icon.svg --export-type=png --export-filename=icon-maskable.png -w 512 -h 512
```

## Required icon files
- ✅ `icon.svg` - Source SVG (any size, scalable)
- ⏳ `icon-192.png` - 192x192 PNG
- ⏳ `icon-512.png` - 512x512 PNG
- ⏳ `icon-maskable.png` - 512x512 PNG with padding for adaptive icons

The PWA will work with just the SVG for now, but PNG files provide better compatibility across all devices.
