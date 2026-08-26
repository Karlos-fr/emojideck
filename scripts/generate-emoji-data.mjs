import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const unicodeVersion = '17.0.0';
const cldrVersion = '48.2.0';
const locales = ['fr', 'en'];
const outputDirectory = fileURLToPath(new URL('../src/data/generated/', import.meta.url));
const checkOnly = process.argv.includes('--check');
const skinToneRange = [0x1f3fb, 0x1f3ff];

const sources = {
  unicode: `https://www.unicode.org/Public/${unicodeVersion}/emoji/emoji-test.txt`,
  cldr(locale, derived = false) {
    const packageName = derived
      ? 'cldr-annotations-derived-full/annotationsDerived'
      : 'cldr-annotations-full/annotations';
    return `https://raw.githubusercontent.com/unicode-org/cldr-json/${cldrVersion}/cldr-json/${packageName}/${locale}/annotations.json`;
  },
};

const groupCategories = new Map([
  ['Smileys & Emotion', 'faces'],
  ['People & Body', 'faces'],
  ['Animals & Nature', 'animals'],
  ['Food & Drink', 'food'],
  ['Travel & Places', 'objects'],
  ['Activities', 'objects'],
  ['Objects', 'objects'],
  ['Symbols', 'symbols'],
  ['Flags', 'flags'],
]);

// Some toned ZWJ sequences use decomposed people while their neutral emoji has a legacy codepoint.
const variantBaseAliases = new Map([
  ['🫱‍🫲', '🤝'],
  ['🧑‍🐰‍🧑', '👯'],
  ['👨‍🐰‍👨', '👯‍♂️'],
  ['👩‍🐰‍👩', '👯‍♀️'],
  ['🧑‍🫯‍🧑', '🤼'],
  ['👨‍🫯‍👨', '🤼‍♂️'],
  ['👩‍🫯‍👩', '🤼‍♀️'],
  ['👩‍🤝‍👩', '👭'],
  ['👩‍🤝‍👨', '👫'],
  ['👨‍🤝‍👨', '👬'],
  ['🧑‍❤‍💋‍🧑', '💏'],
  ['🧑‍❤‍🧑', '💑'],
]);

const [emojiTest, annotationsByLocale] = await Promise.all([
  fetchText(sources.unicode),
  Promise.all(locales.map(async (locale) => [locale, await loadAnnotations(locale)])),
]);
const annotations = Object.fromEntries(annotationsByLocale);
const parsedRows = parseEmojiTest(emojiTest);
const baseRows = parsedRows.filter((row) => !row.hasSkinTone);
const variantsByBase = collectSkinToneVariants(parsedRows, baseRows);
const ids = createIds(baseRows, annotations.en);
const outputs = new Map();

for (const locale of locales) {
  const entries = baseRows.map((row, index) => {
    const localized = getAnnotation(annotations[locale], row.emoji);
    const fallback = getAnnotation(annotations.en, row.emoji);
    const name = localized?.tts?.[0] ?? fallback?.tts?.[0];
    const keywords = unique(localized?.default ?? fallback?.default ?? []);
    const skinToneVariants = variantsByBase.get(normalizeEmoji(row.emoji)) ?? [];

    return {
      id: ids[index],
      emoji: row.emoji,
      category: row.category,
      name,
      keywords,
      codepoints: row.codepoints.map(formatCodepoint),
      supportsSkinTone: skinToneVariants.length > 0,
      ...(skinToneVariants.length > 0 ? { skinToneVariants } : {}),
    };
  });

  validateEntries(entries, locale);
  outputs.set(
    `emojis.${locale}.json`,
    `${JSON.stringify({ locale, unicodeVersion, cldrVersion, emojis: entries })}\n`,
  );
}

outputs.set(
  'manifest.json',
  `${JSON.stringify({
    unicodeVersion,
    cldrVersion,
    locales,
    emojiCount: baseRows.length,
    skinToneVariantCount: parsedRows.length - baseRows.length,
    sources: [
      sources.unicode,
      ...locales.flatMap((locale) => [sources.cldr(locale), sources.cldr(locale, true)]),
    ],
  }, null, 2)}\n`,
);

await mkdir(outputDirectory, { recursive: true });

for (const [filename, content] of outputs) {
  const outputPath = path.join(outputDirectory, filename);

  if (checkOnly) {
    const current = await readFile(outputPath, 'utf8').catch(() => '');
    if (current !== content) {
      throw new Error(`${filename} is not up to date. Run npm run data:generate.`);
    }
  } else {
    await writeFile(outputPath, content, 'utf8');
  }
}

console.log(
  `${checkOnly ? 'Checked' : 'Generated'} ${baseRows.length} emojis and ${parsedRows.length - baseRows.length} skin-tone variants for ${locales.join(', ')}.`,
);

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function loadAnnotations(locale) {
  const [standard, derived] = await Promise.all([
    fetchJson(sources.cldr(locale)),
    fetchJson(sources.cldr(locale, true)),
  ]);
  const entries = {
    ...derived.annotationsDerived.annotations,
    ...standard.annotations.annotations,
  };

  return new Map(Object.entries(entries).map(([emoji, value]) => [normalizeEmoji(emoji), value]));
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function parseEmojiTest(content) {
  let group = '';
  const rows = [];

  for (const line of content.split(/\r?\n/)) {
    const groupMatch = line.match(/^# group: (.+)$/);
    if (groupMatch) {
      group = groupMatch[1];
      continue;
    }

    const match = line.match(/^([0-9A-F ]+)\s*; fully-qualified\s*#/);
    if (!match) {
      continue;
    }

    const codepoints = match[1].trim().split(/\s+/).map((value) => Number.parseInt(value, 16));
    const category = groupCategories.get(group);
    if (!category) {
      throw new Error(`Unsupported Unicode emoji group: ${group}`);
    }

    rows.push({
      emoji: String.fromCodePoint(...codepoints),
      codepoints,
      category,
      hasSkinTone: codepoints.some(isSkinTone),
    });
  }

  return rows;
}

function collectSkinToneVariants(rows, baseRows) {
  const baseKeys = new Set(baseRows.map((row) => normalizeEmoji(row.emoji)));
  const variants = new Map();

  for (const row of rows.filter((entry) => entry.hasSkinTone)) {
    const decomposedBase = normalizeEmoji(
      String.fromCodePoint(...row.codepoints.filter((codepoint) => !isSkinTone(codepoint))),
    );
    const baseKey = normalizeEmoji(variantBaseAliases.get(decomposedBase) ?? decomposedBase);
    if (!baseKeys.has(baseKey)) {
      throw new Error(`No base emoji found for skin-tone variant ${row.emoji}`);
    }

    variants.set(baseKey, [...(variants.get(baseKey) ?? []), row.emoji]);
  }

  return variants;
}

function createIds(rows, englishAnnotations) {
  const used = new Set();

  return rows.map((row) => {
    const name = getAnnotation(englishAnnotations, row.emoji)?.tts?.[0];
    if (!name) {
      throw new Error(`Missing English name for ${row.emoji}`);
    }

    const baseId = slugify(name);
    const id = used.has(baseId)
      ? `${baseId}-${row.codepoints.map((codepoint) => codepoint.toString(16)).join('-')}`
      : baseId;
    used.add(id);
    return id;
  });
}

function getAnnotation(annotationMap, emoji) {
  return annotationMap.get(normalizeEmoji(emoji));
}

function normalizeEmoji(emoji) {
  return [...emoji].filter((character) => character.codePointAt(0) !== 0xfe0f).join('');
}

function slugify(value) {
  return value
    .toLocaleLowerCase('en')
    .replaceAll('&', ' and ')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatCodepoint(codepoint) {
  return `U+${codepoint.toString(16).toUpperCase()}`;
}

function isSkinTone(codepoint) {
  return codepoint >= skinToneRange[0] && codepoint <= skinToneRange[1];
}

function unique(values) {
  return [...new Set(values)];
}

function validateEntries(entries, locale) {
  if (entries.length < 1_800) {
    throw new Error(`Unexpectedly low emoji count for ${locale}: ${entries.length}`);
  }

  const invalid = entries.filter(
    (entry) =>
      !entry.id ||
      !entry.emoji ||
      !entry.category ||
      !entry.name ||
      entry.keywords.length === 0 ||
      entry.codepoints.length === 0,
  );
  if (invalid.length > 0) {
    throw new Error(`${invalid.length} invalid emoji entries for ${locale}.`);
  }

  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
    throw new Error(`Duplicate emoji IDs detected for ${locale}.`);
  }
}
