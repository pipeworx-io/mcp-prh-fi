# mcp-prh-fi

Finnish Patent and Registration Office (PRH) — YTJ open data MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_companies` | Search the Finnish business register (PRH / YTJ) by company name and/or filters. Results under {totalResults, companies:[...]}. Each company has businessId (Y-tunnus), names[], mainBusinessLine, companyForms[], addresses[], status. e.g. {name:"Nokia"} or {name:"Oy", location:"Helsinki", companyForm:"17"}. Use businessId here for an exact single-company lookup, or call get_company. |
| `get_company` | Full register record for one Finnish company by businessId (Y-tunnus, format NNNNNNN-N). e.g. {businessId:"0112038-9"} (Nokia Oyj). Returns names[] (with history), addresses[], companyForms[], mainBusinessLine, registeredEntries[], tradeRegisterStatus, status, registrationDate, lastModified. Multi-language descriptions: languageCode 1=Finnish, 2=Swedish, 3=English. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "prh-fi": {
      "url": "https://gateway.pipeworx.io/prh-fi/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Prh Fi data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
