import socket
import threading
import os
import urllib.parse
import json

HOST = 'localhost'
PORT = 8086
WEB_ROOT = 'public'


def check_user_credentials(username, password):
    try:
        with open('user.txt', 'r') as f:
            for line in f:
                line = line.strip()
                if not line or ':' not in line:
                    continue
                user, pwd = line.split(':', 1)
                if user == username and pwd == password:
                    return True
        return False
    except FileNotFoundError:
        print("user.txt file not found.")
        return False


def load_student_data():
    try:
        with open('students.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        print("Failed to load student data:", e)
        return {}


def safe_join(base, *paths):
    final_path = os.path.normpath(os.path.join(base, *paths))
    if not os.path.abspath(final_path).startswith(os.path.abspath(base)):
        return None
    return final_path


def recv_all(conn, length):
    data = b""
    while len(data) < length:
        more = conn.recv(length - len(data))
        if not more:
            break
        data += more
    return data


def parse_cookies(cookie_header):
    cookies = {}
    if not cookie_header:
        return cookies
    parts = cookie_header.split(';')
    for part in parts:
        if '=' in part:
            key, val = part.strip().split('=', 1)
            cookies[key] = val
    return cookies


def handle_client(conn, addr):
    thread_name = threading.current_thread().name
    print(f"[{thread_name}] Connected by {addr}")

    try:
        request = conn.recv(8192)
        if not request:
            conn.close()
            return

        request_text = request.decode(errors='ignore')
        headers_part = request_text.split('\r\n\r\n')[0]
        headers_lines = headers_part.split('\r\n')
        if len(headers_lines) == 0 or len(headers_lines[0].split()) < 2:
            conn.close()
            return

        method, path = headers_lines[0].split()[0], headers_lines[0].split()[1]
        print(f"[{thread_name}] {method} {path}")

        headers = {}
        for line in headers_lines[1:]:
            if ':' in line:
                key, val = line.split(':', 1)
                headers[key.strip().lower()] = val.strip()

        cookies = parse_cookies(headers.get('cookie', ''))

        # API: Get student data
        if method == "GET" and path.startswith("/studentdata"):
            parsed_url = urllib.parse.urlparse(path)
            query_params = urllib.parse.parse_qs(parsed_url.query)
            user = query_params.get('user', [''])[0].lower()
            students = load_student_data()
            student_info = students.get(user)

            if student_info:
                response_body = json.dumps({
                    "status": "success",
                    "student": student_info
                })
                response = (
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: application/json\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "\r\n" + response_body
                ).encode()
                conn.sendall(response)
            else:
                response_body = json.dumps({
                    "status": "error",
                    "message": "Student not found"
                })
                response = (
                    "HTTP/1.1 404 Not Found\r\n"
                    "Content-Type: application/json\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "\r\n" + response_body
                ).encode()
                conn.sendall(response)
            conn.close()
            print(f"[{thread_name}] Connection closed")
            return

        # Serve static files
        if method == "GET":
            if path == '/':
                path = '/index.html'

            safe_path = safe_join(WEB_ROOT, path.lstrip('/'))
            if not safe_path or not os.path.exists(safe_path) or not os.path.isfile(safe_path):
                print(f"[{thread_name}] File not found: {path}")
                response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n<h1>404 Not Found</h1>".encode()
                conn.sendall(response)
                return

            with open(safe_path, 'rb') as f:
                response_body = f.read()

            if safe_path.endswith('.html'):
                content_type = 'text/html'
            elif safe_path.endswith('.css'):
                content_type = 'text/css'
            elif safe_path.endswith('.js'):
                content_type = 'application/javascript'
            elif safe_path.endswith('.png'):
                content_type = 'image/png'
            elif safe_path.endswith('.jpg') or safe_path.endswith('.jpeg'):
                content_type = 'image/jpeg'
            else:
                content_type = 'application/octet-stream'

            response_headers = (
                f"HTTP/1.1 200 OK\r\n"
                f"Content-Type: {content_type}\r\n"
                f"Cache-Control: no-cache, no-store, must-revalidate\r\n"
                f"Pragma: no-cache\r\n"
                f"Expires: 0\r\n"
                f"\r\n"
            ).encode()
            conn.sendall(response_headers + response_body)

        # Login POST
        elif method == "POST" and path == "/login":
            content_length = int(headers.get('content-length', 0))
            body = request.split(b'\r\n\r\n', 1)[1] if b'\r\n\r\n' in request else b''

            if len(body) < content_length:
                body += recv_all(conn, content_length - len(body))

            body_str = body.decode()
            params = urllib.parse.parse_qs(body_str)
            username = params.get('username', [''])[0]
            password = params.get('password', [''])[0]

            if check_user_credentials(username, password):
                students = load_student_data()
                student_info = students.get(username.lower(), {})

                response_body = json.dumps({
                    "status": "success",
                    "student": student_info
                })
                response = (
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: application/json\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "\r\n" + response_body
                ).encode()
                conn.sendall(response)
            else:
                response_body = json.dumps({
                    "status": "error",
                    "message": "Invalid username or password."
                })
                response = (
                    "HTTP/1.1 401 Unauthorized\r\n"
                    "Content-Type: application/json\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "\r\n" + response_body
                ).encode()
                conn.sendall(response)
        else:
            response = "HTTP/1.1 405 Method Not Allowed\r\n\r\n".encode()
            conn.sendall(response)

    except Exception as e:
        print(f"[{thread_name}] Error: {e}")
    finally:
        conn.close()
        print(f"[{thread_name}] Connection closed")


def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(5)
        print(f"Server running on http://{HOST}:{PORT} ...")

        while True:
            conn, addr = s.accept()
            thread = threading.Thread(target=handle_client, args=(conn, addr), name=f"ClientThread-{addr[1]}")
            thread.start()


if __name__ == "__main__":
    main()


