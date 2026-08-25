-- K-Drama — schéma PostgreSQL minimal (voir section 4 du cahier des charges)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  synopsis TEXT,
  poster_url TEXT,
  year INT,
  status TEXT NOT NULL DEFAULT 'En cours', -- 'En cours' | 'Terminé'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS drama_genres (
  drama_id UUID REFERENCES dramas(id) ON DELETE CASCADE,
  genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (drama_id, genre_id)
);

CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drama_id UUID REFERENCES dramas(id) ON DELETE CASCADE,
  number INT NOT NULL,
  UNIQUE (drama_id, number)
);

CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,   -- URL vers une source hébergée légalement
  subtitle_url TEXT,         -- fichier .vtt autorisé
  duration INT,              -- secondes
  UNIQUE (season_id, number)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  drama_id UUID REFERENCES dramas(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, drama_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  progress_seconds INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, episode_id)
);

CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_seasons_drama ON seasons(drama_id);
CREATE INDEX IF NOT EXISTS idx_dramas_slug ON dramas(slug);
