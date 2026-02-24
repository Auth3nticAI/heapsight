/**
 * Parses AddressSanitizer output from stderr into student-friendly messages.
 * ASan errors appear in printErr callback lines starting with "[stderr]".
 */

export interface AsanReport {
  type: string;
  summary: string;
  location: string | null;
}

const ASAN_PATTERNS: { pattern: RegExp; type: string; explain: string }[] = [
  {
    pattern: /heap-buffer-overflow/,
    type: "Buffer Overflow",
    explain: "Your code accessed memory past the end of an array. Check array index bounds.",
  },
  {
    pattern: /stack-buffer-overflow/,
    type: "Stack Buffer Overflow",
    explain: "Your code wrote past the end of a local array. Check array sizes and indices.",
  },
  {
    pattern: /heap-use-after-free/,
    type: "Use After Free",
    explain: "Your code used memory after it was freed with delete/delete[]. Don't access pointers after freeing them.",
  },
  {
    pattern: /stack-use-after-return/,
    type: "Dangling Pointer",
    explain: "Your code returned a pointer to a local variable. Local variables are destroyed when the function ends.",
  },
  {
    pattern: /double-free/,
    type: "Double Free",
    explain: "Your code freed the same memory twice. Only call delete/delete[] once per allocation.",
  },
  {
    pattern: /alloc-dealloc-mismatch/,
    type: "Mismatched Free",
    explain: "Used delete on memory from new[] (or vice versa). Match new with delete and new[] with delete[].",
  },
  {
    pattern: /SEGV|null.*pointer|null.*dereference/i,
    type: "Null Pointer",
    explain: "Your code tried to use a null pointer. Check that pointers are initialized before use.",
  },
];

/**
 * Parse console output lines for ASan reports.
 * Returns parsed reports or empty array if no ASan output detected.
 */
export function parseAsanOutput(lines: string[]): AsanReport[] {
  const stderrLines = lines
    .filter((l) => l.startsWith("[stderr]"))
    .map((l) => l.replace("[stderr] ", ""));

  const fullText = stderrLines.join("\n");
  if (!fullText.includes("ERROR: AddressSanitizer") && !fullText.includes("ASAN")) {
    return [];
  }

  const reports: AsanReport[] = [];

  for (const { pattern, type, explain } of ASAN_PATTERNS) {
    if (pattern.test(fullText)) {
      // Try to find the source location
      const locMatch = fullText.match(/student\.cpp:(\d+)/);
      const location = locMatch ? `Line ${locMatch[1]}` : null;

      reports.push({ type, summary: explain, location });
    }
  }

  if (reports.length === 0 && fullText.includes("ERROR:")) {
    reports.push({
      type: "Memory Error",
      summary: "AddressSanitizer detected a memory error. Run in debug mode for details.",
      location: null,
    });
  }

  return reports;
}
