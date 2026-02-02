
import os
import json
from urllib import request, error

# Configuration
SUPABASE_URL = "https://eqjoqgpbxhsfgcovipgu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def log(msg):
    print(msg)
    with open("quota_result.txt", "a", encoding="utf-8") as f:
        f.write(str(msg) + "\n")

def make_request(url, method='GET', data=None):
    req = request.Request(url, method=method)
    for k, v in HEADERS.items():
        req.add_header(k, v)
    
    if data:
        req.data = json.dumps(data).encode('utf-8')

    try:
        with request.urlopen(req) as r:
            return json.loads(r.read().decode('utf-8'))
    except error.HTTPError as e:
        log(f"HTTP Error: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        log(f"Error: {e}")
        return None

def main():
    if os.path.exists("quota_result.txt"):
        os.remove("quota_result.txt")
    
    log("Started check...")
    
    # 1. Find User by Email (assuming email pattern or name)
    # Searching users table directly via REST
    url = f"{SUPABASE_URL}/rest/v1/users?select=id,email,raw_user_meta_data&or=(email.ilike.%18m%,raw_user_meta_data->>full_name.ilike.%18m%)"
    users = make_request(url)
    
    target_user = None
    if users:
        for u in users:
            meta = u.get('raw_user_meta_data', {})
            name = meta.get('full_name', '') or meta.get('name', '')
            if 'Exposant 18m Test' in name or '18m' in str(u):
                target_user = u
                break
    
    if not target_user:
        log("User not found via search")
        # Fallback: specific email if known? I recall samye+18...
        return

    log(f"Found User: {target_user['id']}")
    
    # 2. Check Quota RPC
    rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/check_b2b_quota_available"
    payload = {"p_user_id": target_user['id']}
    
    result = make_request(rpc_url, method='POST', data=payload)
    log(f"RPC Result: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    main()
