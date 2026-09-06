-- Orders from the simple form do not yet have agreed print or delivery parameters.
-- Existing values are preserved.
ALTER TABLE "Order"
    ALTER COLUMN "material" DROP NOT NULL,
    ALTER COLUMN "color" DROP NOT NULL,
    ALTER COLUMN "width" DROP NOT NULL,
    ALTER COLUMN "height" DROP NOT NULL,
    ALTER COLUMN "length" DROP NOT NULL,
    ALTER COLUMN "quantity" DROP NOT NULL,
    ALTER COLUMN "infill" DROP NOT NULL,
    ALTER COLUMN "delivery" DROP NOT NULL;
