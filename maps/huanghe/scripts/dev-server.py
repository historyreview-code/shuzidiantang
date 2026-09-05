#!/usr/bin/env python3
"""本地预览服务器：带 no-store 缓存头，避免调试时吃到旧 JS。"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"serving :{PORT}")
    httpd.serve_forever()
