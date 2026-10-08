import { VERSION } from "./version.js";

/** Published GitHub distribution; no npm registry publication is implied. */
export function releaseInfo(api = "https://agentswap.forge-3.workers.dev") {
  const github = "https://github.com/pu0238/agentswap/releases";
  return {
    version: VERSION, publishedAt: "2026-10-09", npmPublished: false,
    url: `${github}/tag/v${VERSION}`,
    packageUrl: `${github}/download/v${VERSION}/agentswap-client-${VERSION}.tgz`,
    checksumUrl: `${github}/download/v${VERSION}/SHA256SUMS-v${VERSION}.txt`,
    notes: `${api}/releases/v${VERSION}.md`,
  };
}
