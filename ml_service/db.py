"""PostgreSQL and SQLite data layer.

If DATABASE_URL is set and psycopg2 is installed, connects to PostgreSQL.
Otherwise, falls back seamlessly to a local SQLite database file (minesafe.sqlite)
so user registration, authentication, and file uploads work out-of-the-box locally.
"""

import os
import sqlite3
import threading
from contextlib import contextmanager
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

try:
    import psycopg2
    import psycopg2.extras
    from psycopg2 import pool as pg_pool
except ImportError:
    psycopg2 = None
    pg_pool = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_DB_PATH = os.path.join(BASE_DIR, 'minesafe.sqlite')


class DatabaseNotConfigured(RuntimeError):
    """Raised when database cannot be initialized."""


_pool = None
_pool_lock = threading.Lock()


def _use_postgres():
    return psycopg2 is not None and bool(os.environ.get('DATABASE_URL'))


def _normalise_url(raw):
    parsed = urlparse(raw)
    if parsed.scheme == 'postgres':
        parsed = parsed._replace(scheme='postgresql')

    query = dict(parse_qsl(parsed.query))
    query.setdefault('sslmode', 'require')

    return urlunparse(parsed._replace(query=urlencode(query)))


def _get_pool():
    global _pool

    if _pool is not None:
        return _pool

    with _pool_lock:
        if _pool is not None:
            return _pool

        raw_url = os.environ.get('DATABASE_URL')
        if not raw_url or psycopg2 is None:
            return None

        _pool = pg_pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=int(os.environ.get('DB_MAX_CONNECTIONS', '5')),
            dsn=_normalise_url(raw_url),
        )
        return _pool


class SQLiteCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, sql, params=()):
        sql_sqlite = sql.replace('%s', '?')
        sql_sqlite = (
            sql_sqlite
            .replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .replace('BYTEA', 'BLOB')
            .replace('TIMESTAMPTZ NOT NULL DEFAULT NOW()', 'TEXT DEFAULT CURRENT_TIMESTAMP')
            .replace('TIMESTAMPTZ DEFAULT NOW()', 'TEXT DEFAULT CURRENT_TIMESTAMP')
            .replace('DOUBLE PRECISION', 'REAL')
        )
        if not params and ';' in sql_sqlite:
            self.cursor.executescript(sql_sqlite)
        else:
            self.cursor.execute(sql_sqlite, params)
        return self

    def fetchone(self):
        row = self.cursor.fetchone()
        return dict(row) if row is not None else None

    def fetchall(self):
        rows = self.cursor.fetchall()
        return [dict(r) for r in rows]


@contextmanager
def get_cursor(commit=False):
    if _use_postgres():
        pool = _get_pool()
        conn = pool.getconn()
        try:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                yield cur
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            pool.putconn(conn)
    else:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        wrapper = SQLiteCursorWrapper(cur)
        try:
            yield wrapper
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    full_name      TEXT        NOT NULL,
    email          TEXT        NOT NULL,
    password_hash  TEXT        NOT NULL,
    user_role      TEXT,
    mine_location  TEXT,
    phone_number   TEXT,
    latitude       DOUBLE PRECISION,
    longitude      DOUBLE PRECISION,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key
    ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS uploads (
    id           SERIAL PRIMARY KEY,
    user_email   TEXT        NOT NULL,
    filename     TEXT        NOT NULL,
    content_type TEXT,
    size_bytes   INTEGER     NOT NULL,
    data         BYTEA       NOT NULL,
    uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS uploads_user_email_idx
    ON uploads (LOWER(user_email), uploaded_at DESC);
"""


def init_schema():
    with get_cursor(commit=True) as cur:
        cur.execute(SCHEMA)


USER_PUBLIC_FIELDS = (
    'full_name', 'email', 'user_role', 'mine_location',
    'phone_number', 'latitude', 'longitude',
)


def _to_profile(row):
    if row is None:
        return None

    return {
        'fullName': row['full_name'],
        'email': row['email'],
        'userRole': row['user_role'],
        'mineLocation': row['mine_location'],
        'phoneNumber': row['phone_number'],
        'latitude': row['latitude'],
        'longitude': row['longitude'],
    }


def find_user_by_email(email):
    with get_cursor() as cur:
        cur.execute('SELECT * FROM users WHERE LOWER(email) = LOWER(%s)', (email,))
        return cur.fetchone()


def create_user(*, full_name, email, password_hash, user_role,
                mine_location, phone_number, latitude=None, longitude=None):
    with get_cursor(commit=True) as cur:
        try:
            cur.execute(
                """
                INSERT INTO users (full_name, email, password_hash, user_role,
                                   mine_location, phone_number, latitude, longitude)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (full_name, email, password_hash, user_role,
                 mine_location, phone_number, latitude, longitude),
            )
            return _to_profile(cur.fetchone())
        except Exception as err:
            if 'unique' in str(err).lower() or 'duplicate' in str(err).lower() or 'integrityerror' in str(err).lower():
                return None
            raise


def user_profile(row):
    return _to_profile(row)


def save_upload(*, user_email, filename, content_type, data):
    binary_data = psycopg2.Binary(data) if (_use_postgres() and psycopg2) else data
    with get_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO uploads (user_email, filename, content_type, size_bytes, data)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, filename, content_type, size_bytes, uploaded_at
            """,
            (user_email, filename, content_type, len(data), binary_data),
        )
        return cur.fetchone()


def list_uploads(user_email, limit=50):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT id, filename, content_type, size_bytes, uploaded_at
            FROM uploads
            WHERE LOWER(user_email) = LOWER(%s)
            ORDER BY uploaded_at DESC
            LIMIT %s
            """,
            (user_email, limit),
        )
        return cur.fetchall()


def get_upload(upload_id, user_email):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT filename, content_type, data
            FROM uploads
            WHERE id = %s AND LOWER(user_email) = LOWER(%s)
            """,
            (upload_id, user_email),
        )
        return cur.fetchone()
