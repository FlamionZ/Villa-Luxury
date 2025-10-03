-- Add pricing columns to villa_types table
ALTER TABLE villa_types 
ADD COLUMN IF NOT EXISTS weekday_price DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekend_price DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS high_season_price DECIMAL(12,2) DEFAULT 0;

-- Update existing villa data with sample pricing based on current price
UPDATE villa_types 
SET 
  weekday_price = CASE 
    WHEN weekday_price = 0 OR weekday_price IS NULL THEN price 
    ELSE weekday_price 
  END,
  weekend_price = CASE 
    WHEN weekend_price = 0 OR weekend_price IS NULL THEN ROUND(price * 1.2) 
    ELSE weekend_price 
  END,
  high_season_price = CASE 
    WHEN high_season_price = 0 OR high_season_price IS NULL THEN ROUND(price * 1.5) 
    ELSE high_season_price 
  END
WHERE status = 'active';

-- Show updated results
SELECT id, title, price, weekday_price, weekend_price, high_season_price 
FROM villa_types 
WHERE status = 'active' 
LIMIT 5;