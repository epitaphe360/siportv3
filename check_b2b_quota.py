
import os
import json
import requests
import sys

# Configuration
SUPABASE_URL = "https://eqjoqgpbxhsfgcovipgu.supabase.co"
# Use Service Role Key to ensure we can search all users
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def main():

    log_file = open("quota_verification_result.txt", "w", encoding="utf-8")

    def log_print(*args, **kwargs):
        print(*args, **kwargs)
        print(*args, file=log_file, **kwargs)

    log_print("Initializing Supabase check (using requests)...")

    log_print("Searching for user 'Exposant 18m Test'...")
    user_id = None
    
    # 1. Search in public.users (via REST)
    # Filter by some fields if possible using query params or fetch all
    # To filter by text search in Supabase PostgREST:
    # column=ilike.*pattern*
    
    # We'll try to fetch all first as there shouldn't be too many for this test
    try:
        url = f"{SUPABASE_URL}/rest/v1/users?select=*"
        response = requests.get(url, headers=HEADERS)
        
        if response.status_code == 200:
            users = response.json()
            log_print(f"Found {len(users)} users in public.users table.")
            for user in users:
                full_name = user.get('full_name', '') or user.get('name', '') or \
                           (str(user.get('first_name') or '') + ' ' + str(user.get('last_name') or '')).strip()
                
                log_print(f"Checking user: {full_name} (ID: {user.get('id')})")
                
                if "Exposant 18m Test" in full_name:
                    log_print(f"MATCH FOUND in public.users: {full_name}")
                    user_id = user.get('id')
                    break
        else:
            log_print(f"Error querying public.users: {response.status_code} {response.text}")

    except Exception as e:
        log_print(f"Exception querying public.users: {e}")

    # 2. If not found, try auth.users (via Admin API / GoTrue API)
    # Supabase Admin API endpoint: /auth/v1/admin/users
    if not user_id:
        log_print("Searching in auth.users via Admin API...")
        try:
            url = f"{SUPABASE_URL}/auth/v1/admin/users"
            response = requests.get(url, headers=HEADERS)
            
            if response.status_code == 200:
                data = response.json()
                users = data.get('users', [])
                log_print(f"Found {len(users)} users in auth.users.")
                
                for user in users:
                    meta = user.get('user_metadata', {})
                    full_name = meta.get('full_name', '') or meta.get('name', '')
                    email = user.get('email', '')
                    
                    log_print(f"Checking Auth User: {email} | Name: {full_name}")
                    
                    if "Exposant 18m Test" in full_name or "Exposant 18m Test" in email: # Broad check
                        log_print(f"MATCH FOUND in auth.users: {email}")
                        user_id = user.get('id')
                        break
            else:
                 log_print(f"Error querying auth admin: {response.status_code} {response.text}")

        except Exception as e:
            log_print(f"Exception querying auth admin: {e}")

    # 3. Call RPC
    if user_id:
        log_print(f"User ID found: {user_id}")
        log_print("Calling rpc 'check_b2b_quota_available'...")
        
        try:
            url = f"{SUPABASE_URL}/rest/v1/rpc/check_b2b_quota_available"
            payload = {'p_user_id': user_id}
            
            response = requests.post(url, headers=HEADERS, json=payload)
            
            if response.status_code == 200:
                log_print("RPC Result:")
                log_print(json.dumps(response.json(), indent=2))
            else:
                log_print(f"RPC Error: {response.status_code} {response.text}")
                
        except Exception as e:
            log_print(f"Error calling RPC: {e}")
    else:
        log_print("User 'Exposant 18m Test' not found.")
    
    log_file.close()

if __name__ == "__main__":
    main()
