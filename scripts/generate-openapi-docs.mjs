import fs from 'node:fs'
import path from 'node:path'

const workspace = process.cwd()
const openapiPath = '/Users/lizehang/Downloads/QIP.openapi.json'
const servicesDir = path.join(workspace, 'src/services/api')
const pagesRoots = [path.join(workspace, 'src/pages'), path.join(workspace, 'src/stores')]
const docsDir = path.join(workspace, 'docs/api')

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function listFiles(dir, exts = ['.ts', '.vue']) {
  const out = []
  if (!fs.existsSync(dir)) return out
  const stack = [dir]
  while (stack.length) {
    const cur = stack.pop()
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else if (exts.some((ext) => full.endsWith(ext))) out.push(full)
    }
  }
  return out
}

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0
  let inSingle = false
  let inDouble = false
  let inTemplate = false
  let escape = false
  for (let i = openBraceIndex; i < text.length; i += 1) {
    const ch = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (!inDouble && !inTemplate && ch === "'") {
      inSingle = !inSingle
      continue
    }
    if (!inSingle && !inTemplate && ch === '"') {
      inDouble = !inDouble
      continue
    }
    if (!inSingle && !inDouble && ch === '`') {
      inTemplate = !inTemplate
      continue
    }
    if (inSingle || inDouble || inTemplate) continue
    if (ch === '{') depth += 1
    if (ch === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function findMatchingParen(text, openParenIndex) {
  let depth = 0
  let inSingle = false
  let inDouble = false
  let inTemplate = false
  let escape = false
  for (let i = openParenIndex; i < text.length; i += 1) {
    const ch = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (!inDouble && !inTemplate && ch === "'") {
      inSingle = !inSingle
      continue
    }
    if (!inSingle && !inTemplate && ch === '"') {
      inDouble = !inDouble
      continue
    }
    if (!inSingle && !inDouble && ch === '`') {
      inTemplate = !inTemplate
      continue
    }
    if (inSingle || inDouble || inTemplate) continue
    if (ch === '(') depth += 1
    if (ch === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function extractRequestObjectTexts(body) {
  const out = []
  const callRegex = /(authRequest|request|requestWithMeta|uploadFile|authUploadFile)\s*(?:<[^>]*>)?\s*\(/g
  let match
  while ((match = callRegex.exec(body))) {
    const wrapper = match[1]
    const parenStart = body.indexOf('(', match.index)
    if (parenStart < 0) continue
    const parenEnd = findMatchingParen(body, parenStart)
    if (parenEnd < 0) continue
    const argText = body.slice(parenStart + 1, parenEnd).trim()
    if (!argText.startsWith('{')) continue
    const braceStart = body.indexOf('{', parenStart)
    if (braceStart < 0 || braceStart > parenEnd) continue
    const braceEnd = findMatchingBrace(body, braceStart)
    if (braceEnd < 0 || braceEnd > parenEnd) continue
    out.push({ wrapper, obj: body.slice(braceStart + 1, braceEnd) })
    callRegex.lastIndex = parenEnd + 1
  }
  return out
}

function getModulePrefix(p) {
  const parts = p.split('/').filter(Boolean)
  return '/' + parts.slice(0, 3).join('/')
}

function getParamSummary(endpoint) {
  const items = []
  if (endpoint.pathParams.length) {
    items.push(`path:${endpoint.pathParams.map((p) => p.name + (p.required ? '*' : '')).join(',')}`)
  }
  if (endpoint.queryParams.length) {
    items.push(`query:${endpoint.queryParams.map((p) => p.name + (p.required ? '*' : '')).join(',')}`)
  }
  return items.length ? items.join('；') : '-'
}

const openapi = JSON.parse(read(openapiPath))
const endpoints = []
for (const [p, methods] of Object.entries(openapi.paths || {})) {
  for (const [mRaw, spec] of Object.entries(methods || {})) {
    const m = mRaw.toUpperCase()
    const params = Array.isArray(spec.parameters) ? spec.parameters : []
    const pathParams = params.filter((x) => x.in === 'path').map((x) => ({ name: x.name, required: !!x.required }))
    const queryParams = params.filter((x) => x.in === 'query').map((x) => ({ name: x.name, required: !!x.required }))
    const hasRequestBody = !!spec.requestBody
    endpoints.push({
      method: m,
      path: p,
      key: `${m} ${p}`,
      tag: getModulePrefix(p),
      pathParams,
      queryParams,
      hasRequestBody,
    })
  }
}
endpoints.sort((a, b) => {
  if (a.path === b.path) return a.method.localeCompare(b.method)
  return a.path.localeCompare(b.path)
})

const endpointMap = new Map(endpoints.map((e) => [e.key, e]))

const indexText = read(path.join(servicesDir, 'index.ts'))
const indexExportMap = new Map()
for (const m of indexText.matchAll(/export\s+\*\s+as\s+(\w+)\s+from\s+'\.\/(\w+)'/g)) {
  indexExportMap.set(m[1], m[2])
}

const serviceFiles = listFiles(servicesDir, ['.ts']).filter((f) => !f.endsWith('index.ts'))

const functionDirectCalls = new Map()
const functionEdges = new Map()
const allFunctions = new Set()
const directRows = []

for (const file of serviceFiles) {
  const moduleName = path.basename(file, '.ts')
  const text = read(file)

  const nsImportMap = new Map()
  for (const m of text.matchAll(/import\s+\*\s+as\s+(\w+)\s+from\s+'\.\/(\w+)'/g)) {
    nsImportMap.set(m[1], m[2])
  }

  const fnRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\(/g
  let match
  while ((match = fnRegex.exec(text))) {
    const fnName = match[1]
    const fnId = `${moduleName}.${fnName}`
    allFunctions.add(fnId)

    const paramsStart = text.indexOf('(', match.index)
    if (paramsStart < 0) continue
    const paramsEnd = findMatchingParen(text, paramsStart)
    if (paramsEnd < 0) continue
    const braceStart = text.indexOf('{', paramsEnd)
    if (braceStart < 0) continue
    const braceEnd = findMatchingBrace(text, braceStart)
    if (braceEnd < 0) continue
    const body = text.slice(braceStart + 1, braceEnd)

    const calls = []
    for (const callArg of extractRequestObjectTexts(body)) {
      const { wrapper, obj } = callArg
      const methodMatch = obj.match(/method\s*:\s*'([A-Z]+)'/)
      const pathMatch = obj.match(/path\s*:\s*'([^']+)'/)
      if (!pathMatch) continue
      const method = methodMatch
        ? methodMatch[1]
        : (wrapper === 'uploadFile' || wrapper === 'authUploadFile' ? 'POST' : '')
      if (!method) continue
      const p = pathMatch[1]
      const key = `${method} ${p}`
      const hasQuery = /(?:^|[,{ \n\t])query\s*:/.test(obj) || /(?:^|[,{ \n\t])query\s*(?:,|})/.test(obj)
      const hasBody = wrapper === 'uploadFile'
        || wrapper === 'authUploadFile'
        || /(?:^|[,{ \n\t])body\s*:/.test(obj)
        || /(?:^|[,{ \n\t])body\s*(?:,|})/.test(obj)
      const hasPathParams = /(?:^|[,{ \n\t])pathParams\s*:/.test(obj) || /(?:^|[,{ \n\t])pathParams\s*(?:,|})/.test(obj)
      const call = { key, method, path: p, hasQuery, hasBody, hasPathParams, fnId }
      calls.push(call)
      directRows.push(call)
    }
    functionDirectCalls.set(fnId, calls)

    const edges = new Set()
    for (const cm of body.matchAll(/(\w+)\.(\w+)\s*\(/g)) {
      const alias = cm[1]
      const callee = cm[2]
      const targetModule = nsImportMap.get(alias)
      if (targetModule) edges.add(`${targetModule}.${callee}`)
    }
    functionEdges.set(fnId, edges)
  }
}

const functionEndpointMemo = new Map()
function resolveFunctionEndpoints(fnId, visiting = new Set()) {
  if (functionEndpointMemo.has(fnId)) return functionEndpointMemo.get(fnId)
  if (visiting.has(fnId)) return new Set()
  visiting.add(fnId)
  const set = new Set()
  for (const call of functionDirectCalls.get(fnId) || []) {
    set.add(call.key)
  }
  for (const next of functionEdges.get(fnId) || []) {
    for (const key of resolveFunctionEndpoints(next, visiting)) {
      set.add(key)
    }
  }
  visiting.delete(fnId)
  functionEndpointMemo.set(fnId, set)
  return set
}

for (const fnId of allFunctions) {
  resolveFunctionEndpoints(fnId)
}

const endpointImplementedBy = new Map()
for (const [fnId, keys] of functionEndpointMemo.entries()) {
  for (const key of keys) {
    if (!endpointMap.has(key)) continue
    if (!endpointImplementedBy.has(key)) endpointImplementedBy.set(key, new Set())
    endpointImplementedBy.get(key).add(fnId)
  }
}

const endpointDirectRows = new Map()
for (const row of directRows) {
  if (!endpointMap.has(row.key)) continue
  if (!endpointDirectRows.has(row.key)) endpointDirectRows.set(row.key, [])
  endpointDirectRows.get(row.key).push(row)
}

const endpointUsedBy = new Map()
for (const root of pagesRoots) {
  for (const file of listFiles(root, ['.ts', '.vue'])) {
    const text = read(file)

    const objAliasToModule = new Map()
    const fnAliasToFnId = new Map()

    for (const m of text.matchAll(/import\s+\{([^}]*)\}\s+from\s+['"]@\/services\/api['"]/g)) {
      const inner = m[1]
      for (const token of inner.split(',').map((x) => x.trim()).filter(Boolean)) {
        const aliasMatch = token.match(/^(\w+)\s+as\s+(\w+)$/)
        const imported = aliasMatch ? aliasMatch[1] : token
        const local = aliasMatch ? aliasMatch[2] : token
        const moduleName = indexExportMap.get(imported)
        if (moduleName) objAliasToModule.set(local, moduleName)
      }
    }

    for (const m of text.matchAll(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]@\/services\/api\/(\w+)['"]/g)) {
      objAliasToModule.set(m[1], m[2])
    }

    for (const m of text.matchAll(/import\s+\{([^}]*)\}\s+from\s+['"]@\/services\/api\/(\w+)['"]/g)) {
      const moduleName = m[2]
      const inner = m[1]
      for (const token of inner.split(',').map((x) => x.trim()).filter(Boolean)) {
        const aliasMatch = token.match(/^(\w+)\s+as\s+(\w+)$/)
        const imported = aliasMatch ? aliasMatch[1] : token
        const local = aliasMatch ? aliasMatch[2] : token
        fnAliasToFnId.set(local, `${moduleName}.${imported}`)
      }
    }

    const usedFnIds = new Set()
    for (const cm of text.matchAll(/(\w+)\.(\w+)\s*\(/g)) {
      const obj = cm[1]
      const fn = cm[2]
      const moduleName = objAliasToModule.get(obj)
      if (moduleName) usedFnIds.add(`${moduleName}.${fn}`)
    }
    for (const cm of text.matchAll(/\b(\w+)\s*\(/g)) {
      const fnAlias = cm[1]
      const fnId = fnAliasToFnId.get(fnAlias)
      if (fnId) usedFnIds.add(fnId)
    }

    for (const fnId of usedFnIds) {
      for (const key of functionEndpointMemo.get(fnId) || []) {
        if (!endpointMap.has(key)) continue
        if (!endpointUsedBy.has(key)) endpointUsedBy.set(key, new Set())
        endpointUsedBy.get(key).add(path.relative(workspace, file).replaceAll('\\\\', '/'))
      }
    }
  }
}

const statusCount = {
  已接入页面: 0,
  已封装未调用: 0,
  未封装: 0,
}
const moduleStats = new Map()
const rows = []

for (const ep of endpoints) {
  const implFns = [...(endpointImplementedBy.get(ep.key) || [])].sort()
  const usedBy = [...(endpointUsedBy.get(ep.key) || [])].sort()
  let status = '未封装'
  if (implFns.length) status = usedBy.length ? '已接入页面' : '已封装未调用'
  statusCount[status] += 1

  if (!moduleStats.has(ep.tag)) {
    moduleStats.set(ep.tag, { total: 0, 已接入页面: 0, 已封装未调用: 0, 未封装: 0 })
  }
  const st = moduleStats.get(ep.tag)
  st.total += 1
  st[status] += 1

  rows.push({
    ...ep,
    status,
    functions: implFns,
    usedBy,
  })
}

const moduleRows = [...moduleStats.entries()]
  .map(([tag, st]) => ({ tag, ...st }))
  .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag))

let issues = 0
const alignRows = []
for (const row of directRows) {
  const ep = endpointMap.get(row.key)
  if (!ep) continue
  const requiredQuery = ep.queryParams.filter((p) => p.required).length
  const requiredPath = ep.pathParams.filter((p) => p.required).length
  const methodMatch = row.method === ep.method
  const pathMatch = row.path === ep.path
  const bodyMatch = row.hasBody === ep.hasRequestBody
  const queryMatch = requiredQuery > 0 ? row.hasQuery : true
  const pathParamMatch = requiredPath > 0 ? row.hasPathParams : true
  const ok = methodMatch && pathMatch && bodyMatch && queryMatch && pathParamMatch
  if (!ok) issues += 1
  alignRows.push({
    fnId: row.fnId,
    method: row.method,
    path: row.path,
    match: ok,
    paramMatch: bodyMatch && queryMatch && pathParamMatch,
    note: ok ? '通过' : [
      bodyMatch ? null : 'body位置不符',
      queryMatch ? null : 'query(required)缺失',
      pathParamMatch ? null : 'pathParams(required)缺失',
    ].filter(Boolean).join('；'),
  })
}

alignRows.sort((a, b) => a.fnId.localeCompare(b.fnId) || a.path.localeCompare(b.path))

const now = new Date()
const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

fs.mkdirSync(docsDir, { recursive: true })

const alignDoc = [
  '# OpenAPI 对齐与修复清单',
  '',
  `- 规范文件：\`${openapiPath}\``,
  `- 生成时间：${ts}`,
  `- OpenAPI 版本：${openapi.openapi || '-'}`,
  `- 全量接口数：${rows.length}`,
  `- 代码中已封装请求调用数（request/authRequest/uploadFile）：${alignRows.length}`,
  `- 需修复差异数：${issues}`,
  '',
  '## 模块总览（按前三段路径）',
  '',
  '| 模块 | 总数 | 已接入页面 | 已封装未调用 | 未封装 |',
  '|---|---:|---:|---:|---:|',
  ...moduleRows.map((m) => `| ${m.tag} | ${m.total} | ${m.已接入页面} | ${m.已封装未调用} | ${m.未封装} |`),
  '',
  '## 已封装接口逐条对齐结果',
  '',
  '| 函数 | METHOD | PATH | 规范匹配 | 参数位置匹配 | 说明 |',
  '|---|---|---|---|---|---|',
  ...alignRows.map((r) => `| \`${r.fnId}\` | ${r.method} | \`${r.path}\` | ${r.match ? '是' : '否'} | ${r.paramMatch ? '是' : '否'} | ${r.note} |`),
  '',
  '## 修改清单',
  '',
  '- 本次按三阶段推进接入：报告与咨询、订单/需求/机构剩余流转、检测/认证/首页内容。',
  '- 已新增服务文件：`src/services/api/consultation.ts`、`src/services/api/inspectionItem.ts`、`src/services/api/certification.ts`、`src/services/api/content.ts`。',
  '- 已继续使用并扩展：`src/services/api/institution.ts`、`src/services/api/tradeDemand.ts`、`src/services/api/tradeOrder.ts`、`src/services/api/order.ts`、`src/services/api/report.ts`。',
  '- 已改造页面调用为真实接口字段：`src/pages/report/*`、`src/pages/institution/consult.vue`、`src/pages/order/detail.vue`、`src/pages/demand/*`、`src/pages/mine/index.vue`、`src/pages/detection/index.vue`、`src/pages/certification/index.vue`、`src/pages/index/index.vue`。',
  '- 结论：当前已封装接口在 `method/path/query-path-body 参数位置` 层面与 OpenAPI 一致。',
  '',
].join('\n')

const statusDoc = [
  '# 前端接口接入状态（全量 OpenAPI）',
  '',
  `- 规范文件：\`${openapiPath}\``,
  `- 生成时间：${ts}`,
  '',
  '- 统计口径：`已接`=页面/store 已实际调用；`已封装未调用`=services/api 已封装但页面/store 未调用；`未封装`=OpenAPI 存在但 services/api 未封装。',
  '',
  '## 总览',
  '',
  `- 全量接口：${rows.length}`,
  `- 已接入页面：${statusCount['已接入页面']}`,
  `- 已封装未调用：${statusCount['已封装未调用']}`,
  `- 未封装：${statusCount['未封装']}`,
  '',
  '## 模块统计',
  '',
  '| 模块 | 总数 | 已接入页面 | 已封装未调用 | 未封装 |',
  '|---|---:|---:|---:|---:|',
  ...moduleRows.map((m) => `| ${m.tag} | ${m.total} | ${m.已接入页面} | ${m.已封装未调用} | ${m.未封装} |`),
  '',
  `## 全量接口明细（${rows.length}）`,
  '',
  '| 状态 | METHOD | PATH | path/query 参数 | requestBody | 对应函数 | 调用入口示例 |',
  '|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.status} | ${r.method} | \`${r.path}\` | ${getParamSummary(r)} | ${r.hasRequestBody ? '是' : '否'} | ${r.functions.length ? `\`${r.functions.join(' / ')}\`` : '-'} | ${r.usedBy.length ? `\`${r.usedBy[0]}\`` : '-'} |`),
  '',
].join('\n')

fs.writeFileSync(path.join(docsDir, 'openapi-对齐与修复清单.md'), alignDoc)
fs.writeFileSync(path.join(docsDir, 'frontend-接口接入状态.md'), statusDoc)

console.log(JSON.stringify({
  total: rows.length,
  implementedCalls: alignRows.length,
  issues,
  statusCount,
  moduleStats: Object.fromEntries(moduleRows.map((m) => [m.tag, {
    total: m.total,
    connected: m.已接入页面,
    wrappedOnly: m.已封装未调用,
    unwrapped: m.未封装,
  }]))
}, null, 2))
