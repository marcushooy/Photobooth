from rembg import remove
from PIL import Image
import sys

input_path = 'src/assets/character.png'
output_path = 'src/assets/character_nobg_v2.png'

try:
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    print("Successfully removed background")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
