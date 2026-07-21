import os
import sys
import json
import pika
import requests
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime, timezone
from urllib.parse import urlparse

# Load env variables
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from github_analyzer import analyze_single_repository, fetch_file_contents, fetch_file_contents_dict
from llm_engine import analyze_functional_view, analyze_interface_view, analyze_data_view, analyze_process_view


def parse_repo_info(repo_url):
    """GitHub URL에서 username과 repo_name을 추출합니다."""
    path = urlparse(repo_url).path.strip('/')
    parts = path.split('/')
    if len(parts) >= 2:
        repo_name = parts[1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
        return parts[0], repo_name
    return None, None


def send_webhook(endpoint, space_id, payload):
    webhook_url = f"http://localhost:8080/api/internal/webhook/{endpoint}/{space_id}"
    webhook_secret = os.getenv("WEBHOOK_SECRET", "my-secret-key-1234")
    
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Secret": webhook_secret
    }
    
    try:
        response = requests.post(webhook_url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"    [OK] Webhook 전송 성공 ({endpoint})")
    except requests.exceptions.RequestException as e:
        print(f"    [FAIL] Webhook 전송 실패 ({endpoint}): {e}")


def process_analysis(space_id, repo_url):
    USERNAME, REPO_NAME = parse_repo_info(repo_url)

    if not USERNAME or not REPO_NAME:
        print("오류: 유효한 GitHub URL이 아닙니다.")
        return

    print(f"\nSoft On-boarding Agent [분석 파이프라인] 시작")
    print(f"  대상 레포지토리: {USERNAME}/{REPO_NAME}")
    print(f"  대상 스페이스 ID: {space_id}\n")

    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

    if not GITHUB_TOKEN:
        print("오류: .env 파일에 GITHUB_TOKEN 설정이 없습니다.")
        return

    # Step 1: 파일 분류
    print(f"[로직 A] '{REPO_NAME}' 파일 분류 중...")
    categorized_files = analyze_single_repository(USERNAME, GITHUB_TOKEN, REPO_NAME)

    # ==========================================
    # Functional View
    # ==========================================
    print("  Functional View 분석 중...")
    func_files = categorized_files.get("Functional", [])
    if func_files:
        func_content_dict = fetch_file_contents_dict(USERNAME, GITHUB_TOKEN, REPO_NAME, func_files)
        if func_content_dict:
            func_data = analyze_functional_view(REPO_NAME, func_content_dict)
            if func_data and isinstance(func_data, list):
                payload = []
                for item in func_data:
                    # Webhook Controller expects FunctionalElementSaveRequestDto format
                    # Spring Boot Admin Service builds from this DTO
                    payload.append({
                        "name": item.get("name"),
                        "element_type": item.get("element_type"),
                        "description": item.get("description"),
                        "file_path": item.get("file_path", ""),
                        "repo_name": REPO_NAME,
                        "temp_id": item.get("temp_id"),
                        "parent_temp_id": item.get("parent_temp_id"),
                        "api_method": item.get("api_method"),
                        "api_url": item.get("api_url")
                    })
                send_webhook("functional", space_id, payload)
            else:
                print("    [WARN] Functional View 데이터가 없거나 형식이 올바르지 않습니다.")
        else:
            print("    [WARN] Functional View 파일 내용을 가져오지 못했습니다.")
    else:
        print("    [WARN] Functional View 대상 파일이 없습니다.")

    # ==========================================
    # Interface View
    # ==========================================
    print("  Interface View 분석 중...")
    iface_files = categorized_files.get("Interface", [])
    if iface_files:
        iface_content = fetch_file_contents(USERNAME, GITHUB_TOKEN, REPO_NAME, iface_files)
        if iface_content:
            iface_data = analyze_interface_view(REPO_NAME, iface_content)
            if iface_data and isinstance(iface_data, list):
                for item in iface_data:
                    item["space_id"] = space_id
                    item["repo_name"] = REPO_NAME
                    item.setdefault("created_at", datetime.now(timezone.utc).isoformat())
                send_webhook("interface", space_id, iface_data)
            else:
                print("    [WARN] Interface View 데이터가 없거나 형식이 올바르지 않습니다.")
        else:
            print("    [WARN] Interface View 파일 내용을 가져오지 못했습니다.")
    else:
        print("    [WARN] Interface View 대상 파일이 없습니다.")

    # ==========================================
    # Data View
    # ==========================================
    print("  Data View 분석 중...")
    data_files = categorized_files.get("Data", [])
    if data_files:
        schema_data = analyze_data_view(REPO_NAME, data_files)
        if schema_data and isinstance(schema_data, list):
            for item in schema_data:
                item["space_id"] = space_id
                item["repo_name"] = REPO_NAME
                item.setdefault("created_at", datetime.now(timezone.utc).isoformat())
            send_webhook("data", space_id, schema_data)
        else:
            print("    [WARN] Data View 데이터가 없거나 형식이 올바르지 않습니다.")
    else:
        print("    [WARN] Data View 대상 파일이 없습니다.")

    # ==========================================
    # Process View
    # ==========================================
    print("  Process View 분석 중...")
    proc_files = categorized_files.get("Process", [])
    if proc_files:
        proc_content = fetch_file_contents(USERNAME, GITHUB_TOKEN, REPO_NAME, proc_files)
        if proc_content:
            proc_data = analyze_process_view(REPO_NAME, proc_content)
            if proc_data and isinstance(proc_data, list):
                for item in proc_data:
                    item["space_id"] = space_id
                    item["repo_name"] = REPO_NAME
                    item.setdefault("created_at", datetime.now(timezone.utc).isoformat())
                send_webhook("process", space_id, proc_data)
            else:
                print("    [WARN] Process View 데이터가 없거나 형식이 올바르지 않습니다.")
        else:
            print("    [WARN] Process View 파일 내용을 가져오지 못했습니다.")
    else:
        print("    [WARN] Process View 대상 파일이 없습니다.")

    print("\n[완료] 파이프라인 처리가 성공적으로 종료되었습니다.")


def on_message(ch, method, properties, body):
    """RabbitMQ 메시지 수신 시 호출되는 콜백"""
    message_str = body.decode('utf-8')
    print(f"[*] Received message: {message_str}")
    
    try:
        data = json.loads(message_str)
        space_id = data.get("space_id")
        repo_url = data.get("repo_url")
        action = data.get("action")
        
        if action == "analyze" and space_id and repo_url:
            process_analysis(space_id, repo_url)
        else:
            print("[!] Invalid message format or missing required fields.")
            
    except json.JSONDecodeError:
        print("[!] Failed to decode JSON message.")
    except Exception as e:
        print(f"[!] Error processing message: {e}")
    finally:
        # 메시지 처리 완료 ACK 전송
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print("[*] Message processing complete.\n")


def start_consumer():
    rabbitmq_host = os.getenv("RABBITMQ_HOST", "localhost")
    rabbitmq_port = int(os.getenv("RABBITMQ_PORT", "5672"))
    rabbitmq_user = os.getenv("RABBITMQ_USER", "guest")
    rabbitmq_pass = os.getenv("RABBITMQ_PASS", "guest")
    
    queue_name = "analysis.queue"
    
    credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
    parameters = pika.ConnectionParameters(
        host=rabbitmq_host, 
        port=rabbitmq_port, 
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300
    )
    
    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # 큐 생성 (이미 존재하면 무시됨)
        channel.queue_declare(queue=queue_name, durable=True)
        
        # 공평한 분배를 위해 prefetch_count 1 설정
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=queue_name, on_message_callback=on_message)
        
        print(f"[*] Waiting for messages in '{queue_name}'. To exit press CTRL+C")
        channel.start_consuming()
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")


if __name__ == "__main__":
    start_consumer()