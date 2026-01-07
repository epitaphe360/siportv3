# Test Fixtures

This directory contains sample files used for E2E testing.

## Required Files

The following files should be placed in this directory for tests to work properly:

### Images
- `avatar.jpg` - Sample avatar image (300x300px recommended)
- `avatar-mobile.jpg` - Sample mobile avatar (300x300px)
- `product.jpg` - Sample product image (800x600px)
- `logo.png` - Sample company logo (400x400px)
- `logo-hd.png` - High-resolution logo (1200x1200px)
- `partner-logo.png` - Partner logo (600x600px)
- `hero-banner.jpg` - Hero banner image (1920x1080px)

### Documents
- `document.pdf` - Sample PDF document
- `floor-plan.pdf` - Sample floor plan PDF

## Creating Sample Files

You can create sample image files using ImageMagick:

```bash
# Create a simple colored rectangle as placeholder
convert -size 300x300 xc:blue avatar.jpg
convert -size 300x300 xc:green avatar-mobile.jpg
convert -size 800x600 xc:red product.jpg
convert -size 400x400 xc:yellow logo.png
convert -size 1200x1200 xc:cyan logo-hd.png
convert -size 600x600 xc:magenta partner-logo.png
convert -size 1920x1080 xc:orange hero-banner.jpg
```

Or use online services like:
- https://placeholder.com
- https://via.placeholder.com
- https://dummyimage.com

## PDF Files

For PDF files, you can create simple test PDFs using:
- LibreOffice (export to PDF)
- Online PDF generators
- Or download sample PDFs from https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf

## Usage in Tests

Tests reference these files like:
```typescript
await fileInput.setInputFiles('./tests/fixtures/avatar.jpg');
```

Make sure the paths match the files you create.
