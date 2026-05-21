import os
import sys
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client, Client
from github_analyzer import analyze_single_repository, fetch_recent_commits
from urllib.parse import urlparse

def parse_repo_info(repo_url):
    """GitHub URL에서 username과 repo_name을 추출합니다."""
    path = urlparse(repo_url).path.strip('/')
    parts = path.split('/')
    if len(parts) >= 2:
        return parts[0], parts[1]
    return None, None

def main():
    # 1. 인자 확인
    if len(sys.argv) < 2:
        print("❌ 사용법: python SOA_LLM_Model.py <github_url>")
        return
    
    TARGET_URL = sys.argv[1]
    USERNAME, REPO_NAME = parse_repo_info(TARGET_URL)
    
    if not USERNAME or not REPO_NAME:
        print("❌ 오류: 유효한 GitHub URL이 아닙니다.")
        return

    print(f"🚀 Soft On-boarding Agent [DB 데이터 적재 파이프라인] 시작")
    print(f"👉 대상 레포지토리: {USERNAME}/{REPO_NAME}\n")
    
    # 2. 환경변수 로드
    env_path = Path(__file__).parent / ".env"
    load_dotenv(dotenv_path=env_path)
    
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    SUPABASE_URL = os.getenv("SUPABASE_URL") 
    SUPABASE_KEY = os.getenv("SUPABASE_KEY") 

    if not GITHUB_TOKEN or not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ 오류: .env 파일 설정을 확인해주세요.")
        return

    # 3. Supabase 클라이언트 초기화
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # 4. 분석 및 적재
    print(f"🔍 [로직 A] '{REPO_NAME}' 구조 분석 중...")
    categorized_files = analyze_single_repository(USERNAME, GITHUB_TOKEN, REPO_NAME)
    
    components_data = []
    for category, files in categorized_files.items():
        for file_path in files:
            components_data.append({
                "repo_name": REPO_NAME,
                "category": category,
                "file_path": file_path
            })
            
    if components_data:
        try:
            supabase.table("ComponentNodes").insert(components_data).execute()
            print(f"  ✅ [로직 A] ComponentNodes 적재 완료!")
        except Exception as e:
            print(f"  ❌ [로직 A] 적재 실패: {e}")

    print(f"🔍 [로직 B] '{REPO_NAME}' 커밋 분석 중...")
    recent_commits = fetch_recent_commits(USERNAME, GITHUB_TOKEN, REPO_NAME, limit=100)
    
    commits_data = []
    if recent_commits:
        for commit_data in recent_commits:
            sha = commit_data.get('sha', '')[:7]
            info = commit_data.get('commit', {})
            msg = info.get('message', '').split('\n')[0]
            date = info.get('author', {}).get('date', '')[:10]
            author = info.get('author', {}).get('name', '')
            commits_data.append({
                "repo_name": REPO_NAME,
                "commit_sha": sha,
                "message": msg,
                "commit_date": date,
                "author": author
            })

    if commits_data:
        try:
            supabase.table("CommitHistory").insert(commits_data).execute()
            print(f"  ✅ [로직 B] CommitHistory 적재 완료!")
        except Exception as e:
            print(f"  ❌ [로직 B] 적재 실패: {e}")

    # ==========================================
    # 5. [필수 확인] DB 데이터 검증 로직
    # ==========================================
    print("\n🔍 [데이터 검증] Supabase에 데이터가 진짜로 들어갔는지 확인합니다...")
    try:
        response = supabase.table("ComponentNodes").select("*", count='exact').limit(1).execute()
        print(f"✅ 데이터 확인 성공! 현재 ComponentNodes 테이블의 총 데이터 개수: {len(response.data) if response.data else '0개 (또는 조회 불가)'}")
        print(f"💡 만약 여기서 개수가 나오는데 웹에서 안 보인다면, 웹 프로젝트 주소를 다시 확인하세요!")
    except Exception as e:
        print(f"❌ 데이터 조회 실패: {e} (테이블 이름이나 권한을 확인하세요)")

if __name__ == "__main__":
    main()
