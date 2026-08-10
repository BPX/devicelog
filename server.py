#!/usr/bin/env python3
"""Trackstack — serves .html for clean URLs. /dashboard → dashboard.html"""
import http.server, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_GET(self):
        # Strip query string for routing
        p = self.path.split('?')[0].rstrip('/')
        if not p or p == '/':
            p = '/index.html'
        elif '.' not in p.split('/')[-1]:
            html = os.path.join(DIR, (p + '.html').lstrip('/'))
            if os.path.isfile(html):
                self.path = p + '.html' + ('?' + self.path.split('?')[1] if '?' in self.path else '')
        super().do_GET()

if __name__ == '__main__':
    print(f'Trackstack → http://localhost:{PORT}')
    http.server.HTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
