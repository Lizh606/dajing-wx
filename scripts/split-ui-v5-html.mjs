#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const DEFAULT_INPUT = '/Users/lizehang/Downloads/AI质享平台小程序UI-十页面版v5.0.html'
const DEFAULT_OUTPUT = path.resolve(process.cwd(), 'docs/ui-v5/split-pages')

const inputFile = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT
const outputDir = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUTPUT

const rawHtml = readFileSync(inputFile, 'utf8')
const head = extractHead(rawHtml)
const sections = extractSections(rawHtml)

mkdirSync(outputDir, { recursive: true })

for (const { id, markup } of sections) {
  const filename = `${id}.html`
  const outputFile = path.join(outputDir, filename)
  writeFileSync(outputFile, buildStandaloneDoc(head, markup), 'utf8')
}

console.log(`split complete: ${sections.length} pages -> ${outputDir}`)

if (sections.length !== 19) {
  console.warn(`warning: expected 19 pages, got ${sections.length}`)
}

function extractHead(html) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)

  if (!headMatch) {
    return ''
  }

  return headMatch[1]
    .replace(/<script[^>]*src=["']file:[^"']+["'][^>]*>\s*<\/script>\s*/gi, '')
    .replace(/<link[^>]*href=["']chrome-extension:[^"']+["'][^>]*>\s*/gi, '')
}

function extractSections(html) {
  const matches = []
  const regex = /<section id="(page-\d{2})">[\s\S]*?<\/section>/gi

  let result = regex.exec(html)
  while (result) {
    matches.push({
      id: result[1],
      markup: result[0],
    })
    result = regex.exec(html)
  }

  return matches
}

function buildStandaloneDoc(headMarkup, sectionMarkup) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
${headMarkup}
<style>
  .split-page-shell {
    min-height: 100vh;
    padding: 24px;
    box-sizing: border-box;
  }

  .split-page-stage {
    display: flex;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="split-page-shell">
    <div class="split-page-stage">
${sectionMarkup}
    </div>
  </div>
</body>
</html>
`
}
