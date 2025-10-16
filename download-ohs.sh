#!/bin/bash

# OHS Management System Download Script
# This script provides multiple download options

echo "🚀 OHS Management System v2.5 Download Script"
echo "=============================================="
echo ""

# File information
COMPLETE_FILE="ohs-management-system-v2.5-complete.tar.gz"
PRODUCTION_FILE="ohs-management-system-v2.5-production.tar.gz"
COMPLETE_SIZE="11.6 MB"
PRODUCTION_SIZE="202 KB"

# Server options
SERVERS=(
    "21.0.9.223:8000"
    "21.0.9.223:8080"
    "21.0.9.223:8889"
)

echo "📦 Available Packages:"
echo "1. Complete Package ($COMPLETE_SIZE) - Full source code + documentation"
echo "2. Production Package ($PRODUCTION_SIZE) - Production files only"
echo ""

read -p "Select package (1 or 2): " package_choice

if [ "$package_choice" = "1" ]; then
    FILENAME="$COMPLETE_FILE"
    SIZE_INFO="$COMPLETE_SIZE"
elif [ "$package_choice" = "2" ]; then
    FILENAME="$PRODUCTION_FILE"
    SIZE_INFO="$PRODUCTION_SIZE"
else
    echo "❌ Invalid choice. Please select 1 or 2."
    exit 1
fi

echo ""
echo "🌐 Attempting to download: $FILENAME ($SIZE_INFO)"
echo ""

# Try each server
for server in "${SERVERS[@]}"; do
    echo "🔄 Trying server: $server"
    if curl -o "$FILENAME" "http://$server/$FILENAME" --connect-timeout 10 --max-time 30; then
        echo ""
        echo "✅ Download successful!"
        echo "📁 File saved as: $FILENAME"
        echo "📏 File size: $(ls -lh "$FILENAME" | awk '{print $5}')"
        echo ""
        echo "🎉 OHS Management System v2.5 downloaded successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Extract the file: tar -xzf $FILENAME"
        echo "2. Read the documentation: cd ohs-management-system && cat README.md"
        echo "3. Follow deployment instructions"
        exit 0
    else
        echo "❌ Failed to connect to $server"
        echo ""
    fi
done

echo "🚨 All download attempts failed."
echo ""
echo "💡 Alternative options:"
echo "1. Try SCP: scp z@21.0.9.223:/home/z/my-project/downloads/$FILENAME ."
echo "2. Check your network connection and firewall settings"
echo "3. Contact the system administrator for assistance"
echo ""
exit 1