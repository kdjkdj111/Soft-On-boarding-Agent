import requests
from llm_engine import categorize_files_with_gemini

def analyze_single_repository(username, token, repo_name):
    """
    레포지토리의 진짜 기본 브랜치(master/main)를 자동 감지하여 4-Way View로 분류합니다.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    categorized_files = {
        "Interface": [],
        "Functional": [],
        "Data": [],
        "Process": []
    }

    # 🔥 [핵심 수정 포인트] 레포지토리 정보를 찔러서 진짜 기본 브랜치 이름을 먼저 알아냅니다.
    repo_url = f"https://api.github.com/repos/{username}/{repo_name}"
    repo_info = requests.get(repo_url, headers=headers)
    
    if repo_info.status_code != 200:
        print(f"❌ API 오류: 레포지토리를 찾을 수 없습니다. (권한이나 이름을 확인하세요)")
        return categorized_files
        
    # 'master'인지 'main'인지 알아냄 (실패하면 기본값 'main')
    real_default_branch = repo_info.json().get('default_branch', 'main')
    
    # 알아낸 진짜 브랜치 이름으로 Tree API를 호출합니다.
    tree_url = f"https://api.github.com/repos/{username}/{repo_name}/git/trees/{real_default_branch}?recursive=1"
    response = requests.get(tree_url, headers=headers)

    if response.status_code != 200:
        return categorized_files
        
    tree = response.json().get('tree', [])
    
    # 1. 파일 경로만 쫙 뽑아내기
    file_paths = [item['path'] for item in tree if item['type'] == 'blob']
    
    if not file_paths:
        return categorized_files

    # 2. LLM 엔진에 통째로 던져서 분류 결과 받아오기
    categorized_files = categorize_files_with_gemini(file_paths)
            
    return categorized_files

def fetch_recent_commits(username, token, repo_name, limit=100):
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    commits_url = f"https://api.github.com/repos/{username}/{repo_name}/commits?per_page={limit}"
    response = requests.get(commits_url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    return []