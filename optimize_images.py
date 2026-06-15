from PIL import Image
import os

# Optimize bison-skull-pile-edit-2.jpg (9.9MB -> ~300KB)
img_path = "/home/bayard_devries/buffalo-counter-v2/images/bison-skull-pile-edit-2.jpg"
img = Image.open(img_path)
print(f"Original: {img.size}, mode: {img.mode}")

# Resize to max 1600px wide, maintain aspect ratio
max_width = 1600
ratio = max_width / img.width
new_size = (max_width, int(img.height * ratio))
img_resized = img.resize(new_size, Image.Resampling.LANCZOS)

# Save as WebP (smaller) and also optimized JPEG
webp_path = "/home/bayard_devries/buffalo-counter-v2/images/bison-skull-pile-edit-2.webp"
jpg_path = "/home/bayard_devries/buffalo-counter-v2/images/bison-skull-pile-edit-2-opt.jpg"

img_resized.save(webp_path, "WEBP", quality=85, method=6)
img_resized.save(jpg_path, "JPEG", quality=85, optimize=True)

print(f"Resized to: {new_size}")
print(f"WebP size: {os.path.getsize(webp_path) / 1024:.1f} KB")
print(f"JPG size: {os.path.getsize(jpg_path) / 1024:.1f} KB")

# Also optimize the gull-lake image
img2_path = "/home/bayard_devries/buffalo-counter-v2/images/gull-lake-saskatchewan-1890-768x637.jpg"
img2 = Image.open(img2_path)
print(f"\nGull Lake original: {img2.size}")
img2.save(img2_path + ".webp", "WEBP", quality=85, method=6)
print(f"Gull Lake WebP size: {os.path.getsize(img2_path + '.webp') / 1024:.1f} KB")

# Convert buffalo-hunt-taylor-county-1874.webp to JPEG fallback
img3_path = "/home/bayard_devries/buffalo-counter-v2/images/buffalo-hunt-taylor-county-1874.webp"
img3 = Image.open(img3_path)
print(f"\nTaylor County original: {img3.size}")
jpg3_path = img3_path.replace('.webp', '.jpg')
img3.save(jpg3_path, "JPEG", quality=85, optimize=True)
print(f"Taylor County JPG size: {os.path.getsize(jpg3_path) / 1024:.1f} KB")