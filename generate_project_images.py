# This script generates project image folders with labeled images.
from PIL import Image, ImageDraw, ImageFont
import os

# Define base folder
base_dir = "images"
os.makedirs(base_dir, exist_ok=True)

# Font settings
font_size = 24

# Try to use a default font
try:
    font = ImageFont.truetype("arial.ttf", font_size)
except IOError:
    font = ImageFont.load_default()

# Create 6 project folders with 4 labeled images each
for project_num in range(1, 7):
    folder_name = f"Project {project_num}"
    folder_path = os.path.join(base_dir, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    for img_num in range(1, 5):
        img = Image.new("RGB", (400, 300), color=(220, 240, 220))
        draw = ImageDraw.Draw(img)
        text = f"{folder_name} - Picture {img_num}"

        # Use textbbox instead of deprecated textsize
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        draw.text(
            ((400 - text_width) / 2, (300 - text_height) / 2),
            text,
            fill=(0, 0, 0),
            font=font
        )

        img_path = os.path.join(folder_path, f"{img_num}.jpg")
        img.save(img_path)

print("✅ Project image folders created in 'images/'")
