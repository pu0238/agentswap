"""Free unsigned quote. Python 3 standard library; no wallet or signing."""
import json
import os
import urllib.parse
import urllib.request

base = os.environ.get("AGENTSWAP_API", "https://agentswap.forge-3.workers.dev").rstrip("/")
query = urllib.parse.urlencode({"from": "USDC", "to": "SOL", "amount": "1"})
with urllib.request.urlopen(f"{base}/api/quote?{query}", timeout=30) as response:
    print(json.dumps(json.load(response), indent=2))
