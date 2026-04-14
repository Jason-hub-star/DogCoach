// Detect arbitrary hex color classes in src and block commits/builds when found.
// This keeps UI palette changes centralized through design tokens.
import { readdirSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);
const IGNORE_DIRS = new Set([".next", "node_modules", ".git", "dist", "build", "coverage"]);
const ARBITRARY_HEX_COLOR_PATTERN = /\[[^\]\n]*#[0-9a-fA-F]{3,8}[^\]\n]*\]/g;

const rootDir = process.cwd();
const srcDir = join(rootDir, "src");
const violations = [];

function walk(dirPath) {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        if (entry.isDirectory()) {
            if (!IGNORE_DIRS.has(entry.name)) {
                walk(fullPath);
            }
            continue;
        }

        const ext = extname(entry.name).toLowerCase();
        if (!TEXT_EXTENSIONS.has(ext)) continue;

        const content = readFileSync(fullPath, "utf8");
        const lines = content.split("\n");

        lines.forEach((line, index) => {
            if (ARBITRARY_HEX_COLOR_PATTERN.test(line)) {
                violations.push(`${fullPath}:${index + 1}`);
            }
            ARBITRARY_HEX_COLOR_PATTERN.lastIndex = 0;
        });
    }
}

walk(srcDir);

if (violations.length > 0) {
    console.error("Arbitrary hex color classes detected. Use design tokens instead:");
    violations.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
}

console.log("Hardcoded arbitrary hex color class check passed.");
