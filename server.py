#!/usr/bin/env python3
"""Trackstack — serves .html for clean URLs. /dashboard → dashboard.html"""
import http.server, os, sys, posixpath

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def translate_path(self, path):
        path = path.rstrip('/')
        if not path or path == '/': path = '/index.html'
        # If no extension, try .html
        elif '.' not in path.split('/')[-1]:
            html = os.path.join(DIR, (path + '.html').lstrip('/'))
            if os.path.isfile(html): path = path + '.html'
        return super().translate_path(path)

if __name__ == '__main__':
    print(f'Trackstack → http://localhost:{PORT}')
    http.server.HTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
