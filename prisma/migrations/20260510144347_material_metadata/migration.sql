-- AlterTable
ALTER TABLE "Material"
  ADD COLUMN "fullName"  TEXT   NOT NULL DEFAULT '',
  ADD COLUMN "tempLimit" TEXT   NOT NULL DEFAULT '',
  ADD COLUMN "strength"  TEXT   NOT NULL DEFAULT '',
  ADD COLUMN "longDesc"  TEXT   NOT NULL DEFAULT '',
  ADD COLUMN "props"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "color"     TEXT   NOT NULL DEFAULT '#a7a7a7';

-- Backfill existing well-known materials with the values that lived in
-- MATERIAL_INFO / MATERIAL_DETAILS hard-coded objects on the frontend.
UPDATE "Material" SET
  "fullName"  = 'Polylactic Acid',
  "tempLimit" = 'до 60°C',
  "strength"  = 'Средняя',
  "longDesc"  = 'Лучший выбор для прототипов, декоративных изделий и учебных моделей. Легко печатается, экологичен, широкая цветовая палитра. Не подходит для горячих сред.',
  "props"     = ARRAY['Лёгкий', 'Точный', 'Экологичный'],
  "color"     = '#01aeda'
WHERE "name" = 'PLA';

UPDATE "Material" SET
  "fullName"  = 'Polyethylene Terephthalate Glycol',
  "tempLimit" = 'до 80°C',
  "strength"  = 'Высокая',
  "longDesc"  = 'Сочетает прочность ABS и простоту PLA. Подходит для пищевого контакта, медицины, деталей под нагрузку. Химически стоек, слабо коробится.',
  "props"     = ARRAY['Гибкий', 'Прозрачный', 'Химстойкий'],
  "color"     = '#8100cc'
WHERE "name" = 'PETG';

UPDATE "Material" SET
  "fullName"  = 'Thermoplastic Polyurethane',
  "tempLimit" = 'до 80°C',
  "strength"  = 'Эластичная',
  "longDesc"  = 'Резиноподобный материал для прокладок, защитных чехлов, мягких деталей и изделий с амортизацией. Выдерживает многократный изгиб без трещин.',
  "props"     = ARRAY['Эластичный', 'Ударостойкий', 'Гибкий'],
  "color"     = '#0fe24f'
WHERE "name" = 'TPU';

UPDATE "Material" SET
  "fullName"  = 'Acrylonitrile Butadiene Styrene',
  "tempLimit" = 'до 100°C',
  "strength"  = 'Высокая',
  "longDesc"  = 'Классический инженерный пластик для функциональных деталей, корпусов и изделий под механическую нагрузку. Жёсткий, термостойкий, хорошо шлифуется.',
  "props"     = ARRAY['Прочный', 'Термостойкий', 'Ударопрочный'],
  "color"     = '#d34107'
WHERE "name" = 'ABS';

UPDATE "Material" SET
  "fullName"  = 'Polyamide',
  "tempLimit" = 'до 120°C',
  "strength"  = 'Очень высокая',
  "longDesc"  = 'Инженерный материал для шестерёнок, петель, деталей со скользящим контактом. Высокая усталостная прочность, износостойкий. Гигроскопичен, хранить в сухом месте.',
  "props"     = ARRAY['Износостойкий', 'Гибкий', 'Прочный'],
  "color"     = '#3551f1'
WHERE "name" = 'Nylon';

UPDATE "Material" SET
  "fullName"  = 'Фотополимер',
  "tempLimit" = 'до 60°C',
  "strength"  = 'Средняя (хрупкая)',
  "longDesc"  = 'SLA/LCD печать с точностью 0.05 мм для фигурок, ювелирных моделей, стоматологии и мелких деталей с тончайшими элементами. Идеальная поверхность без следов слоёв.',
  "props"     = ARRAY['Высокая детализация', 'Гладкая поверхность', 'Точный'],
  "color"     = '#a7a7a7'
WHERE "name" = 'Resin';
