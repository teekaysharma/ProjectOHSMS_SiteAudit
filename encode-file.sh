#!/bin/bash

# Script to encode the OHS Management System file for transfer
echo "🔄 Encoding OHS Management System v2.5 Complete Package..."
echo "This may take a few minutes due to file size..."

# Encode the complete package
echo "📦 Encoding: ohs-management-system-v2.5-complete.tar.gz"
base64 -w 0 /home/z/my-project/downloads/ohs-management-system-v2.5-complete.tar.gz > /home/z/my-project/ohs-complete.b64

echo "✅ Encoding complete!"
echo "📁 Encoded file: ohs-complete.b64"
echo "📏 Size: $(ls -lh /home/z/my-project/ohs-complete.b64 | awk '{print $5}')"
echo ""
echo "📋 To decode and extract the file:"
echo "1. Copy the Base64 content from ohs-complete.b64"
echo "2. Save it locally as ohs-complete.b64"
echo "3. Run: base64 -d ohs-complete.b64 > ohs-management-system-v2.5-complete.tar.gz"
echo "4. Extract: tar -xzf ohs-management-system-v2.5-complete.tar.gz"