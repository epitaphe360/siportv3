
import os
import json
import uuid
import sys
# Standard library imports only to ensure it runs everywhere
from urllib import request, parse, error

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

def make_request(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}
    
    req = request.Request(url, method=method)
    for k, v in headers.items():
        req.add_header(k, v)
        
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.data = json_data
        # Ensure Content-Type is set if not already
        if 'Content-Type' not in headers:
            req.add_header('Content-Type', 'application/json')

    try:
        with request.urlopen(req) as r:
            content = r.read().decode('utf-8')
            if content:
                return json.loads(content)
            return None
    except error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        error_content = e.read().decode('utf-8')
        print(error_content)
        return None
    except Exception as e:
        print(f"Request Error: {e}")
        return None

def main():
    print("Initializing Supabase check (using urllib)...")
    print("Searching for user 'Exposant 18m Test'...")
    user_id = None
    
    # 1. Search in public.users
    try:
        url = f"{SUPABASE_URL}/rest/v1/users?select=*"
        users = make_request(url, headers=HEADERS)
        
        if users:
            print(f"Found {len(users)} users in public.users table.")
            for user in users:
                full_name = user.get('full_name', '') or user.get('name', '') or \
                           (str(user.get('first_name') or '') + ' ' + str(user.get('last_name') or '')).strip()
                
                print(f"Checking user: {full_name} (ID: {user.get('id')})")
                
                if "Exposant 18m Test" in full_name:
                    print(f"MATCH FOUND in public.users: {full_name}")
                    user_id = user.get('id')
                    break
        else:
            print("No users returned from public.users or error occurred.")
    except Exception as e:
        print(f"Exception querying public.users: {e}")

    # 2. If not found, try auth.users
    if not user_id:
        print("Searching in auth.users via Admin API...")
        try:
            url = f"{SUPABASE_URL}/auth/v1/admin/users"
            response_data = make_request(url, headers=HEADERS)
            
            if response_data:
                users = response_data.get('users', [])
                print(f"Found {len(users)} users in auth.users.")
                
                for user in users:
                    meta = user.get('user_metadata', {})
                    full_name = meta.get('full_name', '') or meta.get('name', '')
                    email = user.get('email', '')
                    
                    print(f"Checking Auth User: {email} | Name: {full_name}")
                    
                    if "Exposant 18m Test" in full_name or "Exposant 18m Test" in email: 
                        print(f"MATCH FOUND in auth.users: {email}")
                        user_id = user.get('id')
                        break
        except Exception as e:
            print(f"Exception querying auth admin: {e}")

    # 3. Call RPC
    if user_id:
        print(f"User ID found: {user_id}")
        print("Calling rpc 'check_b2b_quota_available'...")
        
        try:
            url = f"{SUPABASE_URL}/rest/v1/rpc/check_b2b_quota_available"
            payload = {'p_user_id': user_id}
            
            result = make_request(url, method='POST', data=payload, headers=HEADERS)
            
            print("RPC Result:")
            print(json.dumps(result, indent=2))
                
        except Exception as e:
            print(f"Error calling RPC: {e}")
    else:
        print("User 'Exposant 18m Test' not found.")

if __name__ == "__main__":
    main()
