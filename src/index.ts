interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Finnish Patent and Registration Office (PRH) — YTJ open data MCP.
 * Finland's official business register (Business Information System / YTJ). Keyless.
 *
 * businessId = Finnish Y-tunnus, format NNNNNNN-N (e.g. Nokia Oyj "0112038-9").
 * Records carry multi-language fields (languageCode 1=Finnish, 2=Swedish, 3=English):
 * names[] (type 1=current name, 2=parallel/translation, 3=auxiliary trade name),
 * addresses[], companyForms[] (type code + descriptions, e.g. 17=public limited company),
 * mainBusinessLine (TOL/NACE-style code + descriptions), registeredEntries[],
 * tradeRegisterStatus, status, registrationDate, lastModified.
 */


const BASE = 'https://avoindata.prh.fi/opendata-ytj-api/v3';
const UA = 'pipeworx-mcp-prh-fi/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_companies',
    description:
      'Search the Finnish business register (PRH / YTJ) by company name and/or filters. Results under {totalResults, companies:[...]}. Each company has businessId (Y-tunnus), names[], mainBusinessLine, companyForms[], addresses[], status. e.g. {name:"Nokia"} or {name:"Oy", location:"Helsinki", companyForm:"17"}. Use businessId here for an exact single-company lookup, or call get_company.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Company name search, e.g. "Nokia".' },
        location: { type: 'string', description: 'Registered municipality/city, e.g. "Helsinki".' },
        businessId: { type: 'string', description: 'Exact Finnish Y-tunnus, format NNNNNNN-N, e.g. "0112038-9".' },
        companyForm: { type: 'string', description: 'Company form code, e.g. "17" (public limited company / Oyj), "16" (limited company / Oy).' },
        mainBusinessLine: { type: 'string', description: 'Main business line code (TOL/NACE), e.g. "70100" (head office activities).' },
        page: { type: 'number', description: '1-based page number (default 1).' },
      },
    },
  },
  {
    name: 'get_company',
    description:
      'Full register record for one Finnish company by businessId (Y-tunnus, format NNNNNNN-N). e.g. {businessId:"0112038-9"} (Nokia Oyj). Returns names[] (with history), addresses[], companyForms[], mainBusinessLine, registeredEntries[], tradeRegisterStatus, status, registrationDate, lastModified. Multi-language descriptions: languageCode 1=Finnish, 2=Swedish, 3=English.',
    inputSchema: {
      type: 'object',
      properties: {
        businessId: { type: 'string', description: 'Finnish Y-tunnus, format NNNNNNN-N, e.g. "0112038-9".' },
      },
      required: ['businessId'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_companies': {
      const qs = buildQuery(args, ['name', 'location', 'businessId', 'companyForm', 'mainBusinessLine', 'page']);
      return prhGet(`${BASE}/companies${qs}`);
    }
    case 'get_company':
      return prhGet(`${BASE}/companies?businessId=${encodeURIComponent(businessId(args))}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function prhGet(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`PRH: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function buildQuery(args: Record<string, unknown>, keys: string[]): string {
  const p = new URLSearchParams();
  for (const k of keys) {
    const v = args[k];
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

function businessId(args: Record<string, unknown>): string {
  const v = args.businessId;
  if (typeof v !== 'string' || !v.trim())
    throw new Error('Required argument "businessId" is missing. Pass a Finnish Y-tunnus like "0112038-9".');
  return v.trim();
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
