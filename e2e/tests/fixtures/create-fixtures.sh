#!/bin/bash

# Script to create test fixture files
# This creates minimal valid image files for testing

FIXTURES_DIR="$(dirname "$0")"

echo "Creating test fixtures in $FIXTURES_DIR..."

# Create a simple 1x1 pixel PNG (blue)
# This is a base64 encoded minimal PNG
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > "$FIXTURES_DIR/avatar.jpg"

echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" | base64 -d > "$FIXTURES_DIR/avatar-mobile.jpg"

echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" | base64 -d > "$FIXTURES_DIR/product.jpg"

echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==" | base64 -d > "$FIXTURES_DIR/logo.png"

echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==" | base64 -d > "$FIXTURES_DIR/logo-hd.png"

echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==" | base64 -d > "$FIXTURES_DIR/partner-logo.png"

echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > "$FIXTURES_DIR/hero-banner.jpg"

# Create a minimal PDF file
cat > "$FIXTURES_DIR/document.pdf" << 'EOF'
%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF
EOF

# Create floor-plan.pdf (same as document.pdf for testing)
cp "$FIXTURES_DIR/document.pdf" "$FIXTURES_DIR/floor-plan.pdf"

echo "✅ Test fixtures created successfully!"
echo ""
echo "Files created:"
ls -lh "$FIXTURES_DIR"/*.{jpg,png,pdf} 2>/dev/null || echo "No files found"
