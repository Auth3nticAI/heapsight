/**
 * HeapSight Lesson Audit Script
 *
 * Reads all lesson .ts files in src/data/lessons/ and validates:
 *   - Required fields present and non-empty
 *   - order values unique within each path
 *   - xpReward is one of: 50, 100, 200, 300, 500
 *   - tier is "free" or "pro"
 *   - part1.type is "concept", part2.type is "game_builder"
 *   - part1.tests and part2.tests are non-empty arrays
 *   - part1.hints and part2.hints have 2-3 entries each
 *   - estimatedMinutes in range 3-25
 *
 * Uses regex extraction since lesson files are TypeScript with template literals.
 */

const fs = require("fs");
const path = require("path");

const LESSONS_DIR = path.join(__dirname, "..", "src", "data", "lessons");

const VALID_XP = new Set([50, 100, 200, 300, 500]);
const VALID_TIERS = new Set(["free", "pro"]);
const VALID_PART1_TYPES = new Set(["concept"]);
const VALID_PART2_TYPES = new Set(["game_builder"]);

// Path definitions
const PATHS = [
  { name: "Shooter", pattern: /^lesson-shooter-\d+/ },
  { name: "Platformer", pattern: /^lesson-platformer-\d+/ },
  { name: "RPG", pattern: /^lesson-rpg-\d+/ },
  { name: "Crawler", pattern: /^lesson-crawler-\d+/ },
];

// -------------------------------------------------------------------
// Regex-based field extractors
// -------------------------------------------------------------------

/**
 * Extract a simple string field like: id: "shooter-01-boot-starfield",
 * We look for the field at the top-level object (not nested in part1/part2).
 */
function extractTopLevelString(content, fieldName) {
  // Match field at start of line (with optional whitespace), not inside part1/part2 blocks
  // Strategy: find the field before any `part1:` or `part2:` line
  const topSection = getTopSection(content);
  const re = new RegExp(`${fieldName}:\\s*["'\`]([^"'\`]*)["'\`]`);
  const m = topSection.match(re);
  return m ? m[1] : null;
}

/**
 * Extract a numeric field like: order: 1, or xpReward: 50,
 */
function extractTopLevelNumber(content, fieldName) {
  const topSection = getTopSection(content);
  const re = new RegExp(`${fieldName}:\\s*(-?[\\d.]+)`);
  const m = topSection.match(re);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Get the content before the first `part1:` declaration.
 * This gives us only top-level fields.
 */
function getTopSection(content) {
  const idx = content.indexOf("part1:");
  if (idx === -1) return content;
  return content.substring(0, idx);
}

/**
 * Extract concepts array length. Concepts look like:
 *   concepts: ["a", "b", "c"],
 * They may span multiple lines.
 */
function extractConceptsLength(content) {
  const topSection = getTopSection(content);
  const re = /concepts:\s*\[([^\]]*)\]/s;
  const m = topSection.match(re);
  if (!m) return null;
  const inner = m[1].trim();
  if (inner === "") return 0;
  // Count items by splitting on commas, filtering empty
  const items = inner.split(",").map(s => s.trim()).filter(s => s.length > 0);
  return items.length;
}

/**
 * Extract part1 or part2 block content.
 * Strategy: find `partN: {` and then count brace depth to find the matching `}`.
 * We need to skip braces inside template literals and strings.
 */
function extractPartBlock(content, partName) {
  const marker = `${partName}:`;
  let startIdx = -1;

  // Find the part declaration that's at the top level (not inside a string)
  // Simple approach: scan for `partN: {` or `partN:\n    {`
  const lines = content.split("\n");
  let lineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(marker)) {
      lineIdx = i;
      break;
    }
  }

  if (lineIdx === -1) return null;

  // Find the opening brace
  const fromLine = lines.slice(lineIdx).join("\n");
  const braceIdx = fromLine.indexOf("{");
  if (braceIdx === -1) return null;

  // Now we need to find the matching closing brace.
  // We must handle template literals (backtick strings) carefully.
  const fullFrom = fromLine.substring(braceIdx);
  let depth = 0;
  let inTemplateLiteral = false;
  let inSingleQuoteStr = false;
  let inDoubleQuoteStr = false;
  let endIdx = -1;

  for (let i = 0; i < fullFrom.length; i++) {
    const ch = fullFrom[i];
    const prev = i > 0 ? fullFrom[i - 1] : "";

    // Handle escape sequences
    if (prev === "\\") continue;

    if (inTemplateLiteral) {
      if (ch === "`") inTemplateLiteral = false;
      continue;
    }
    if (inSingleQuoteStr) {
      if (ch === "'") inSingleQuoteStr = false;
      continue;
    }
    if (inDoubleQuoteStr) {
      if (ch === '"') inDoubleQuoteStr = false;
      continue;
    }

    if (ch === "`") { inTemplateLiteral = true; continue; }
    if (ch === "'") { inSingleQuoteStr = true; continue; }
    if (ch === '"') { inDoubleQuoteStr = true; continue; }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) return null;
  return fullFrom.substring(0, endIdx + 1);
}

/**
 * Extract a string field from within a part block.
 */
function extractPartString(partBlock, fieldName) {
  const re = new RegExp(`${fieldName}:\\s*["'\`]([^"'\`]*)["'\`]`);
  const m = partBlock.match(re);
  return m ? m[1] : null;
}

/**
 * Extract a number field from within a part block.
 */
function extractPartNumber(partBlock, fieldName) {
  const re = new RegExp(`${fieldName}:\\s*(-?[\\d.]+)`);
  const m = partBlock.match(re);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Count array items in a field like tests: [...] or hints: [...]
 * For tests, each item is an object { ... }
 * For hints, each item is a string.
 *
 * Strategy: find the field, extract the array content, and count entries.
 */
function extractArrayLength(partBlock, fieldName) {
  // Find `fieldName: [`
  const marker = `${fieldName}:`;
  const idx = partBlock.indexOf(marker);
  if (idx === -1) return null;

  // Find the opening bracket
  const afterMarker = partBlock.substring(idx + marker.length);
  const bracketIdx = afterMarker.indexOf("[");
  if (bracketIdx === -1) return null;

  // Find the matching closing bracket, respecting strings and nested brackets
  const fromBracket = afterMarker.substring(bracketIdx);
  let depth = 0;
  let inTemplateLiteral = false;
  let inSingleQuoteStr = false;
  let inDoubleQuoteStr = false;
  let endIdx = -1;

  for (let i = 0; i < fromBracket.length; i++) {
    const ch = fromBracket[i];
    const prev = i > 0 ? fromBracket[i - 1] : "";

    if (prev === "\\") continue;

    if (inTemplateLiteral) {
      if (ch === "`") inTemplateLiteral = false;
      continue;
    }
    if (inSingleQuoteStr) {
      if (ch === "'") inSingleQuoteStr = false;
      continue;
    }
    if (inDoubleQuoteStr) {
      if (ch === '"') inDoubleQuoteStr = false;
      continue;
    }

    if (ch === "`") { inTemplateLiteral = true; continue; }
    if (ch === "'") { inSingleQuoteStr = true; continue; }
    if (ch === '"') { inDoubleQuoteStr = true; continue; }

    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) return null;

  const arrayContent = fromBracket.substring(1, endIdx).trim();
  if (arrayContent === "") return 0;

  if (fieldName === "tests") {
    // Count objects: count occurrences of `{ id:` or `{id:`
    const matches = arrayContent.match(/\{\s*id\s*:/g);
    return matches ? matches.length : 0;
  }

  if (fieldName === "hints") {
    // Count string entries: split by top-level commas between strings
    // Strategy: count opening quotes at the top level
    let count = 0;
    let inStr = false;
    let strChar = null;
    let d = 0;
    for (let i = 0; i < arrayContent.length; i++) {
      const c = arrayContent[i];
      const p = i > 0 ? arrayContent[i - 1] : "";
      if (p === "\\") continue;

      if (inStr) {
        if (c === strChar) inStr = false;
        continue;
      }

      if (c === "[") { d++; continue; }
      if (c === "]") { d--; continue; }

      if (d === 0 && (c === '"' || c === "'" || c === "`")) {
        inStr = true;
        strChar = c;
        count++;
      }
    }
    return count;
  }

  return null;
}

/**
 * Check if a part block has the given fields present and non-empty.
 */
function checkPartFields(partBlock, partName) {
  const issues = [];

  if (!partBlock) {
    issues.push(`${partName} block is missing or could not be parsed`);
    return { issues, data: null };
  }

  const title = extractPartString(partBlock, "title");
  const type = extractPartString(partBlock, "type");
  const estimatedMinutes = extractPartNumber(partBlock, "estimatedMinutes");
  const testsCount = extractArrayLength(partBlock, "tests");
  const hintsCount = extractArrayLength(partBlock, "hints");

  // Check for starterCode and solutionCode presence (they use template literals)
  const hasStarterCode = /starterCode:\s*`/.test(partBlock);
  const hasSolutionCode = /solutionCode:\s*`/.test(partBlock);
  const hasInstructions = /instructions:\s*`/.test(partBlock);

  const data = { title, type, estimatedMinutes, testsCount, hintsCount, hasStarterCode, hasSolutionCode, hasInstructions };

  if (!title) issues.push(`${partName}.title is missing or empty`);
  if (!type) issues.push(`${partName}.type is missing or empty`);
  if (!hasInstructions) issues.push(`${partName}.instructions is missing`);
  if (!hasStarterCode) issues.push(`${partName}.starterCode is missing`);
  if (!hasSolutionCode) issues.push(`${partName}.solutionCode is missing`);

  return { issues, data };
}

// -------------------------------------------------------------------
// Main audit logic
// -------------------------------------------------------------------

function auditFile(filePath) {
  const issues = [];
  const fileName = path.basename(filePath);

  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    issues.push(`Could not read file: ${e.message}`);
    return { fileName, issues, data: null };
  }

  // Top-level fields
  const id = extractTopLevelString(content, "id");
  const title = extractTopLevelString(content, "title");
  const description = extractTopLevelString(content, "description");
  const order = extractTopLevelNumber(content, "order");
  const xpReward = extractTopLevelNumber(content, "xpReward");
  const tier = extractTopLevelString(content, "tier");
  const conceptsLength = extractConceptsLength(content);

  // Required fields check
  if (!id) issues.push("id is missing or empty");
  if (!title) issues.push("title is missing or empty");
  if (!description) issues.push("description is missing or empty");
  if (order === null || order === undefined) issues.push("order is missing");
  if (xpReward === null || xpReward === undefined) issues.push("xpReward is missing");
  if (!tier) issues.push("tier is missing or empty");
  if (conceptsLength === null) issues.push("concepts array is missing");
  else if (conceptsLength === 0) issues.push("concepts array is empty");

  // Value validations
  if (xpReward !== null && !VALID_XP.has(xpReward)) {
    issues.push(`xpReward=${xpReward} is not one of [50, 100, 200, 300, 500]`);
  }
  if (tier && !VALID_TIERS.has(tier)) {
    issues.push(`tier="${tier}" is not "free" or "pro"`);
  }

  // Part1
  const part1Block = extractPartBlock(content, "part1");
  const part1Result = checkPartFields(part1Block, "part1");
  issues.push(...part1Result.issues);

  if (part1Result.data) {
    const { type, estimatedMinutes, testsCount, hintsCount } = part1Result.data;

    if (type && !VALID_PART1_TYPES.has(type)) {
      issues.push(`part1.type="${type}" is not "concept"`);
    }
    if (testsCount === null) {
      issues.push("part1.tests is missing");
    } else if (testsCount === 0) {
      issues.push("part1.tests is empty (0 tests)");
    }
    if (hintsCount === null) {
      issues.push("part1.hints is missing");
    } else if (hintsCount < 2) {
      issues.push(`part1.hints has ${hintsCount} entries (expected 2-3)`);
    } else if (hintsCount > 3) {
      issues.push(`part1.hints has ${hintsCount} entries (expected 2-3)`);
    }
    if (estimatedMinutes !== null) {
      if (estimatedMinutes < 3) {
        issues.push(`part1.estimatedMinutes=${estimatedMinutes} is below 3`);
      } else if (estimatedMinutes > 25) {
        issues.push(`part1.estimatedMinutes=${estimatedMinutes} is above 25`);
      }
    } else {
      issues.push("part1.estimatedMinutes is missing");
    }
  }

  // Part2
  const part2Block = extractPartBlock(content, "part2");
  const part2Result = checkPartFields(part2Block, "part2");
  issues.push(...part2Result.issues);

  if (part2Result.data) {
    const { type, estimatedMinutes, testsCount, hintsCount } = part2Result.data;

    if (type && !VALID_PART2_TYPES.has(type)) {
      issues.push(`part2.type="${type}" is not "game_builder"`);
    }
    if (testsCount === null) {
      issues.push("part2.tests is missing");
    } else if (testsCount === 0) {
      issues.push("part2.tests is empty (0 tests)");
    }
    if (hintsCount === null) {
      issues.push("part2.hints is missing");
    } else if (hintsCount < 2) {
      issues.push(`part2.hints has ${hintsCount} entries (expected 2-3)`);
    } else if (hintsCount > 3) {
      issues.push(`part2.hints has ${hintsCount} entries (expected 2-3)`);
    }
    if (estimatedMinutes !== null) {
      if (estimatedMinutes < 3) {
        issues.push(`part2.estimatedMinutes=${estimatedMinutes} is below 3`);
      } else if (estimatedMinutes > 25) {
        issues.push(`part2.estimatedMinutes=${estimatedMinutes} is above 25`);
      }
    } else {
      issues.push("part2.estimatedMinutes is missing");
    }
  }

  return {
    fileName,
    issues,
    data: { id, title, order, xpReward, tier, conceptsLength }
  };
}

function main() {
  // Read all files in the lessons directory
  const allFiles = fs.readdirSync(LESSONS_DIR)
    .filter(f => f.endsWith(".ts") && f.startsWith("lesson-"))
    .sort();

  const results = {};

  for (const pathDef of PATHS) {
    results[pathDef.name] = {
      files: [],
      orderMap: new Map(),
      totalIssues: 0,
      fileCount: 0,
      cleanCount: 0,
    };
  }

  // Process each file
  for (const file of allFiles) {
    // Determine which path
    let pathName = null;
    for (const pathDef of PATHS) {
      if (pathDef.pattern.test(file)) {
        pathName = pathDef.name;
        break;
      }
    }
    if (!pathName) {
      console.log(`[UNKNOWN PATH] ${file}`);
      continue;
    }

    const filePath = path.join(LESSONS_DIR, file);
    const result = auditFile(filePath);

    results[pathName].files.push(result);
    results[pathName].fileCount++;
    results[pathName].totalIssues += result.issues.length;
    if (result.issues.length === 0) results[pathName].cleanCount++;

    // Track order for uniqueness check
    if (result.data && result.data.order !== null) {
      const orderMap = results[pathName].orderMap;
      if (orderMap.has(result.data.order)) {
        orderMap.get(result.data.order).push(file);
      } else {
        orderMap.set(result.data.order, [file]);
      }
    }
  }

  // -------------------------------------------------------------------
  // Report
  // -------------------------------------------------------------------

  console.log("=".repeat(80));
  console.log("HEAPSIGHT LESSON AUDIT REPORT");
  console.log("=".repeat(80));
  console.log();

  let grandTotalIssues = 0;
  let grandTotalFiles = 0;
  let grandCleanFiles = 0;

  for (const pathDef of PATHS) {
    const r = results[pathDef.name];
    grandTotalFiles += r.fileCount;
    grandCleanFiles += r.cleanCount;

    console.log("-".repeat(80));
    console.log(`PATH: ${pathDef.name} (${r.fileCount} files, ${r.cleanCount} clean, ${r.fileCount - r.cleanCount} with issues)`);
    console.log("-".repeat(80));

    // Check for duplicate orders
    const duplicateOrders = [];
    for (const [order, files] of r.orderMap) {
      if (files.length > 1) {
        duplicateOrders.push({ order, files });
      }
    }

    if (duplicateOrders.length > 0) {
      console.log();
      console.log("  DUPLICATE ORDER VALUES:");
      for (const dup of duplicateOrders) {
        console.log(`    order=${dup.order}: ${dup.files.join(", ")}`);
        grandTotalIssues++;
        r.totalIssues++;
      }
    }

    // Group issues by type for summary
    const issueCounts = new Map();
    for (const fileResult of r.files) {
      for (const issue of fileResult.issues) {
        // Normalize issue for grouping (remove file-specific values)
        const normalized = issue
          .replace(/=\d+(\.\d+)?/g, "=N")
          .replace(/="[^"]*"/g, '="X"');
        issueCounts.set(normalized, (issueCounts.get(normalized) || 0) + 1);
      }
    }

    if (issueCounts.size > 0) {
      console.log();
      console.log("  ISSUE SUMMARY (count x issue type):");
      const sorted = [...issueCounts.entries()].sort((a, b) => b[1] - a[1]);
      for (const [issue, count] of sorted) {
        console.log(`    ${count}x  ${issue}`);
      }
    }

    // List individual files with issues (only show files with problems)
    const filesWithIssues = r.files.filter(f => f.issues.length > 0);
    if (filesWithIssues.length > 0) {
      console.log();
      console.log("  FILES WITH ISSUES:");
      for (const fileResult of filesWithIssues) {
        console.log(`    ${fileResult.fileName} (${fileResult.issues.length} issues):`);
        for (const issue of fileResult.issues) {
          console.log(`      - ${issue}`);
        }
      }
    } else {
      console.log();
      console.log("  All files passed validation!");
    }

    grandTotalIssues += r.totalIssues;
    console.log();
  }

  // Grand summary
  console.log("=".repeat(80));
  console.log("GRAND SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total files audited: ${grandTotalFiles}`);
  console.log(`Clean files (0 issues): ${grandCleanFiles}`);
  console.log(`Files with issues: ${grandTotalFiles - grandCleanFiles}`);
  console.log(`Total issues found: ${grandTotalIssues}`);
  console.log();

  for (const pathDef of PATHS) {
    const r = results[pathDef.name];
    const pct = r.fileCount > 0 ? ((r.cleanCount / r.fileCount) * 100).toFixed(1) : "N/A";
    console.log(`  ${pathDef.name.padEnd(12)} ${r.fileCount} files, ${r.cleanCount} clean (${pct}%), ${r.totalIssues} total issues`);
  }
  console.log();
}

main();
