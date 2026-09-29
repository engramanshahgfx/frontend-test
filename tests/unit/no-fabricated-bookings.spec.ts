import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * B5 (static guard) — the fabrication engine must not exist in the source tree.
 *
 * The runtime tests in `tests/e2e/b5-no-fabricated-bookings.spec.ts` prove the behaviour.
 * This guard is the cheap, deterministic net that catches a re-introduction in review,
 * because a fabricated booking is normally a silent code path rather than a visible UI bug.
 *
 * NOTE: the stale duplicate checkout at `./frontend-test/` is excluded — it is not the
 * deployed tree. It is reported separately as needing removal.
 */

const ROOT = path.resolve(__dirname, '..', '..');
// `tests` is skipped so the guard does not match its own assertion strings.
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'test-results', 'playwright-report', 'tests', 'frontend-test']);
const SCAN_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectSourceFiles(path.join(dir, entry.name), out);
      continue;
    }
    if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(path.join(dir, entry.name));
    }
  }

  return out;
}

/** Patterns that manufacture a booking the backend never issued. */
const FABRICATION_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'getMockBookingResponse (fake success on network failure)', pattern: /getMockBookingResponse/ },
  { name: "fabricated airline PNR ('PNR' + random)", pattern: /['"]PNR['"]\s*\+/ },
  { name: "fabricated ticket number ('TK-' + random)", pattern: /['"]TK-['"]\s*\+/ },
  { name: 'hardcoded ticket number fallback 712-81709422', pattern: /712-81709422/ },
];

test.describe('B5 — fabrication patterns are absent from the source tree', () => {
  const files = collectSourceFiles(ROOT);

  test('the source tree is discoverable', () => {
    expect(files.length, 'Expected to find source files to scan.').toBeGreaterThan(50);
  });

  for (const { name, pattern } of FABRICATION_PATTERNS) {
    test(`no ${name}`, () => {
      const offenders: string[] = [];

      for (const file of files) {
        const contents = fs.readFileSync(file, 'utf8');
        contents.split('\n').forEach((line, index) => {
          if (pattern.test(line)) {
            offenders.push(`${path.relative(ROOT, file)}:${index + 1}  ${line.trim()}`);
          }
        });
      }

      expect(
        offenders,
        `Fabricated booking data found:\n${offenders.join('\n')}`
      ).toEqual([]);
    });
  }
});
