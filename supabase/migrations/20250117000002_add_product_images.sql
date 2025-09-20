-- Add images column to products table to support multiple images
-- This will store an array of image URLs as JSON
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance when querying images
CREATE INDEX IF NOT EXISTS idx_products_images ON public.products USING GIN (images);

-- Update existing products to move single image to images array
UPDATE public.products 
SET images = jsonb_build_array(image)
WHERE images IS NULL OR images = '[]'::jsonb;

-- Add video column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video TEXT;

-- Create function to validate images array
CREATE OR REPLACE FUNCTION validate_product_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure images is always an array
  IF NEW.images IS NULL THEN
    NEW.images = '[]'::jsonb;
  END IF;
  
  -- Ensure images array contains only strings
  IF jsonb_typeof(NEW.images) != 'array' THEN
    RAISE EXCEPTION 'Images must be an array';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate images
DROP TRIGGER IF EXISTS validate_product_images_trigger ON public.products;
CREATE TRIGGER validate_product_images_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_images();
