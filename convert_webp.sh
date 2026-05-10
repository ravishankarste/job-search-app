#!/bin/bash

# ==============================================================================
# UDYOG MARG: SOVEREIGN VIDEO CONVERTER (V3 - UNIVERSAL)
# ==============================================================================
# This script converts WebP, MOV, or MP4 files to Facebook-ready MP4 files.
# It automatically chooses the best engine for the file type.
# ==============================================================================

# 1. Locate the Engines
MAGICK_PATH=$(which magick)
FFMPEG_PATH=$(which ffmpeg)

if [ -z "$FFMPEG_PATH" ]; then
    echo "❌ ERROR: ffmpeg engine not found."
    echo "💡 FIX: Run 'brew install ffmpeg' to install the professional standard."
    exit 1
fi

# 2. Check Input
if [ -z "$1" ]; then
    echo "❓ USAGE: ./convert_webp.sh <filename.webp|mov|mp4>"
    exit 1
fi

INPUT="$1"
OUTPUT="${1%.*}_converted.mp4"
EXTENSION="${INPUT##*.}"

echo "🚀 DETECTED: $EXTENSION file"

# 3. Intelligent Engine Selection
if [[ "$EXTENSION" == "webp" ]]; then
    if [ -n "$MAGICK_PATH" ]; then
        echo "🎨 Using ImageMagick Coalesce Engine (Robust)..."
        # We use a temp directory to ensure clean frame extraction
        mkdir -p temp_frames
        magick "$INPUT" -coalesce temp_frames/frame_%04d.png
        ffmpeg -framerate 10 -i temp_frames/frame_%04d.png -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart "$OUTPUT" -y
        rm -rf temp_frames
    else
        echo "❌ ERROR: ImageMagick (magick) is required for animated WebP."
        echo "💡 FIX: Run 'brew install imagemagick'."
        exit 1
    fi
else
    echo "🎞️ Using Direct ffmpeg Engine (Fast)..."
    ffmpeg -i "$INPUT" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUTPUT" -y
fi

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: $OUTPUT is ready for Facebook."
else
    echo "❌ CONVERSION FAILED."
fi
