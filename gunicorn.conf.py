"""
Gunicorn configuration file для SpeakUp на Render
Оптимізовано для Render Starter plan
"""
import multiprocessing
import os

# Bind адреса
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Worker налаштування
# Для Render Starter (512MB RAM): 3-5 workers оптимально
# Формула: workers = (2 * CPU) + 1, але обмежена RAM
workers = int(os.getenv('WEB_CONCURRENCY', '3'))

# Worker class - sync для Django (stable та memory efficient)
worker_class = 'sync'

# Worker connections (для sync worker)
worker_connections = 1000

# Worker lifecycle
# Restart workers після N requests для запобігання memory leaks
max_requests = 1000
max_requests_jitter = 100  # Додає випадковість до max_requests

# Timeouts
timeout = 30  # 30 секунд для request timeout
graceful_timeout = 30  # 30 секунд для graceful shutdown
keepalive = 5  # Keep-alive для browser connections (HTTP/1.1)

# Preload application
# Завантажує Django до forking workers = швидший запуск workers
# ВАЖЛИВО: Вимагає code reloading через SIGHUP для updates
preload_app = True

# Daemon mode - False для Render (Render керує процесом)
daemon = False

# Logging
accesslog = '-'  # stdout
errorlog = '-'   # stderr
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Server hooks для оптимізації
def on_starting(server):
    """
    Викликається перед запуском master process
    """
    print(f"[Gunicorn] Starting with {workers} workers")
    print(f"[Gunicorn] Preload app: {preload_app}")
    print(f"[Gunicorn] Worker class: {worker_class}")
    print(f"[Gunicorn] Max requests per worker: {max_requests}")


def on_reload(server):
    """
    Викликається при reload (SIGHUP)
    """
    print("[Gunicorn] Reloading application")


def worker_int(worker):
    """
    Викликається коли worker отримує SIGINT або SIGQUIT
    """
    print(f"[Gunicorn] Worker {worker.pid} interrupted")


def pre_fork(server, worker):
    """
    Викликається перед fork worker process
    """
    pass


def post_fork(server, worker):
    """
    Викликається після fork worker process
    Корисно для реініціалізації connections (DB, cache)
    """
    print(f"[Gunicorn] Worker {worker.pid} spawned")


def worker_exit(server, worker):
    """
    Викликається коли worker exits
    """
    print(f"[Gunicorn] Worker {worker.pid} exited")
