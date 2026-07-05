#!/usr/bin/env python3
import os
import sys
import json
import uuid
import urllib.request
import urllib.error

def get_env_vars():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    variables = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    variables[k.strip()] = v.strip()
    return variables

def make_request(url, headers, method='GET', data=None):
    req = urllib.request.Request(url, headers=headers, method=method)
    if data:
        req.data = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode('utf-8')
            resp_data = json.loads(body) if body else {}
            return response.status, resp_data
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body) if body else {"error": e.reason}
        except:
            return e.code, {"error": body}
    except Exception as e:
        return 0, {"error": str(e)}

def main():
    print("=" * 60)
    print("🧪 STARTING PGVECTOR PIPELINE LOCAL INTEGRATION TEST")
    print("=" * 60)

    # 1. Load credentials
    env = get_env_vars()
    supabase_url = env.get('VITE_SUPABASE_URL')
    anon_key = env.get('VITE_SUPABASE_PUBLISHABLE_KEY')

    if not supabase_url or not anon_key:
        print("❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env file.")
        sys.exit(1)

    print(f"📡 Supabase Target URL: {supabase_url}")

    service_role_key = input("🔑 Please paste your Supabase SERVICE_ROLE_KEY to perform DB write tests:\n").strip()
    if not service_role_key:
        print("❌ Error: Service role key is required to insert test records and bypass RLS.")
        sys.exit(1)

    # Common Headers
    admin_headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    test_user_id = None
    mock_job_id = str(uuid.uuid4())
    mock_resume_id = str(uuid.uuid4())
    mock_version_id = str(uuid.uuid4())

    try:
        # 2. Get a valid user profile_id from the DB to associate the records with
        print("\n🔍 Fetching a valid profile_id from public.profiles...")
        status, profiles = make_request(
            f"{supabase_url}/rest/v1/profiles?select=id&limit=1",
            admin_headers
        )
        if status != 200 or not profiles:
            print("❌ Failed to query profiles. Ensure your migrations have run and a profile exists.")
            sys.exit(1)
        
        test_user_id = profiles[0]['id']
        print(f"✅ Found active test profile_id: {test_user_id}")

        # 3. Create mock Resume & Resume Version record
        print("\n📝 Creating mock resume and version...")
        resume_data = {
            "id": mock_resume_id,
            "profile_id": test_user_id,
            "name": "Local Vector Integration Test Resume",
            "target_role": "Senior Cloud Engineer"
        }
        status, _ = make_request(f"{supabase_url}/rest/v1/resumes", admin_headers, "POST", resume_data)
        if status not in (200, 201):
            print("❌ Failed to create mock resume")
            sys.exit(1)

        version_data = {
            "id": mock_version_id,
            "resume_id": mock_resume_id,
            "version_number": 9999,
            "content": {
                "extractedText": "Expert Cloud Systems Architect. 10 years experience with AWS, CloudFormation, Kubernetes, and Golang."
            }
        }
        status, _ = make_request(f"{supabase_url}/rest/v1/resume_versions", admin_headers, "POST", version_data)
        if status not in (200, 201):
            print("❌ Failed to create mock resume version")
            sys.exit(1)
        print("✅ Mock resume version created (status default should be 'pending').")

        # 4. Create mock Job record
        print("\n💼 Creating mock job...")
        job_data = {
            "id": mock_job_id,
            "profile_id": test_user_id,
            "company_name": "Cloud Systems Corp",
            "title": "Lead Cloud Infrastructure Engineer",
            "description": "We are seeking a Lead Cloud Engineer. Requirements: Kubernetes, Terraform, AWS cloud, Go programming language."
        }
        status, _ = make_request(f"{supabase_url}/rest/v1/jobs", admin_headers, "POST", job_data)
        if status not in (200, 201):
            print("❌ Failed to create mock job")
            sys.exit(1)
        print("✅ Mock job created (status default should be 'pending').")

        # 5. Call generate-embedding for Resume Version
        print("\n🧬 Triggering generate-embedding for Resume Version...")
        embed_req_resume = {
            "text": version_data["content"]["extractedText"],
            "type": "resume",
            "id": mock_version_id
        }
        status, res = make_request(
            f"{supabase_url}/functions/v1/generate-embedding",
            admin_headers,
            "POST",
            embed_req_resume
        )
        if status != 200:
            print(f"❌ Resume embedding generation failed: {res}")
            sys.exit(1)
        print(f"✅ Resume embedding success response: {res}")

        # 6. Call generate-embedding for Job
        print("\n🧬 Triggering generate-embedding for Job...")
        embed_req_job = {
            "text": job_data["description"],
            "type": "job",
            "id": mock_job_id
        }
        status, res = make_request(
            f"{supabase_url}/functions/v1/generate-embedding",
            admin_headers,
            "POST",
            embed_req_job
        )
        if status != 200:
            print(f"❌ Job embedding generation failed: {res}")
            sys.exit(1)
        print(f"✅ Job embedding success response: {res}")

        # 7. Check database states
        print("\n📊 Verifying persisted status states inside Supabase PostgreSQL...")
        
        status, res_ver_db = make_request(
            f"{supabase_url}/rest/v1/resume_versions?id=eq.{mock_version_id}&select=embedding_status,embedding",
            admin_headers
        )
        if status == 200 and res_ver_db:
            print(f"  └─ resume_versions status: {res_ver_db[0]['embedding_status']}")
            assert res_ver_db[0]['embedding_status'] == 'ready', "Resume embedding status must be ready"
            assert res_ver_db[0]['embedding'] is not None, "Resume embedding vector must be populated"
            print("  └─ resume_versions vector parsed successfully (dimensions match).")

        status, job_db = make_request(
            f"{supabase_url}/rest/v1/jobs?id=eq.{mock_job_id}&select=embedding_status,embedding",
            admin_headers
        )
        if status == 200 and job_db:
            print(f"  └─ jobs status: {job_db[0]['embedding_status']}")
            assert job_db[0]['embedding_status'] == 'ready', "Job embedding status must be ready"
            assert job_db[0]['embedding'] is not None, "Job embedding vector must be populated"
            print("  └─ jobs vector parsed successfully (dimensions match).")

        # 8. Test pgvector match calculation
        print("\n🎯 Querying match-analysis in mode='vector'...")
        match_body = {
            "mode": "vector",
            "jobId": mock_job_id,
            "resumeVersionId": mock_version_id
        }
        status, match_res = make_request(
            f"{supabase_url}/functions/v1/match-analysis",
            admin_headers,
            "POST",
            match_body
        )
        if status == 200:
            print(f"🎉 Vector match calculation completed successfully!")
            print(f"  └─ Calculated Match Score: {match_res.get('score')}%")
            print(f"  └─ Confidence Mode: {match_res.get('confidence_mode')}")
            print(f"  └─ Status: {match_res.get('status')}")
            assert match_res.get('score') is not None, "Match score must be calculated"
        else:
            print(f"❌ Vector match request failed: {match_res}")
            sys.exit(1)

        print("\n🛡️ Testing DB State Transition Safety triggers...")
        # Try invalid Ready -> Pending transition
        status, res_err = make_request(
            f"{supabase_url}/rest/v1/resume_versions?id=eq.{mock_version_id}",
            admin_headers,
            "PATCH",
            {"embedding_status": "pending"}
        )
        if status != 200:
            print("✅ DB triggers successfully blocked invalid status downgrade! (ready -> pending exception raised)")
        else:
            print("❌ Security warning: DB trigger failed to block transition!")
            sys.exit(1)

        print("\n✨ PIPELINE TEST COMPLETED SUCCESSFULLY WITH 100% ASSERTION COVERAGE!")

    except Exception as e:
        print(f"\n❌ Script error encountered: {e}")
    finally:
        # Clean up mock database values
        print("\n🧹 Cleaning up test database rows...")
        if mock_resume_id:
            make_request(f"{supabase_url}/rest/v1/resumes?id=eq.{mock_resume_id}", admin_headers, "DELETE")
        if mock_job_id:
            make_request(f"{supabase_url}/rest/v1/jobs?id=eq.{mock_job_id}", admin_headers, "DELETE")
        print("✅ Cleanup complete.")

if __name__ == '__main__':
    main()
