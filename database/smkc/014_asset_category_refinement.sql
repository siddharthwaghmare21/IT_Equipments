-- IT Equipment Management - refined asset categories
-- Keeps existing asset tags/serial numbers unchanged.

USE it_equipment_management_smkc;

UPDATE assets
SET category = 'All In One',
    asset_name = REPLACE(asset_name, 'AIO Desktop', 'All In One'),
    specifications = REPLACE(COALESCE(specifications, ''), 'AIO desktop', 'All In One desktop')
WHERE model = 'AIO'
  AND category = 'Desktop';

UPDATE assets
SET category = 'Inkjet Printer',
    asset_name = CASE
      WHEN asset_name LIKE '%Printer%' THEN REPLACE(asset_name, 'Printer', 'Inkjet Printer')
      ELSE CONCAT(asset_name, ' Inkjet Printer')
    END,
    specifications = 'Inkjet printer model from source summary'
WHERE asset_tag LIKE 'PRINTER-%'
  AND category <> 'Inkjet Printer'
  AND (
    model LIKE 'M-%'
    OR model LIKE 'L-%'
    OR brand = 'Epson'
    OR asset_name LIKE 'M-%'
    OR asset_name LIKE 'Epson%'
  );

UPDATE assets
SET category = 'Dot Matrix Printer',
    asset_name = CASE
      WHEN asset_name LIKE '%Printer%' THEN REPLACE(asset_name, 'Printer', 'Dot Matrix Printer')
      ELSE CONCAT(asset_name, ' Dot Matrix Printer')
    END,
    specifications = 'Dot Matrix printer model from source summary'
WHERE asset_tag LIKE 'PRINTER-%'
  AND category <> 'Dot Matrix Printer'
  AND model LIKE 'LX-%';

UPDATE assets
SET category = 'Laser Printer',
    asset_name = CASE
      WHEN asset_name LIKE '%Printer%' THEN REPLACE(asset_name, 'Printer', 'Laser Printer')
      ELSE CONCAT(asset_name, ' Laser Printer')
    END,
    specifications = 'Laser printer from source summary'
WHERE asset_tag LIKE 'PRINTER-%'
  AND category <> 'Laser Printer'
  AND (
    brand IN ('Canon', 'Cannon', 'HP')
    OR asset_name LIKE 'Canon%'
    OR asset_name LIKE 'Cannon%'
    OR asset_name LIKE 'HP%'
  );

UPDATE assets
SET category = 'Xerox Machine',
    asset_name = 'Xerox WorkCentre',
    specifications = 'Xerox machine from source summary'
WHERE asset_tag LIKE 'PRINTER-%'
  AND category <> 'Xerox Machine'
  AND (
    brand = 'Xerox'
    OR asset_name LIKE 'Xerox%'
  );
