-- Database Schema
-- This project does not use a database.
-- All data is stored in Chrome's sync storage API.

-- Chrome Storage Structure (Key-Value Store)
-- ==========================================

-- Key: "shortcutKey"
-- Type: String
-- Default: "="
-- Max Length: 20 characters
-- Description: User's preferred keyboard shortcut for random song selection
-- Example: "=", "r", "Space", "ArrowRight"

-- Key: "debug"
-- Type: Boolean
-- Default: false
-- Description: Whether debug mode is enabled (shows console logs)
-- Example: true, false

-- Storage Limits
-- ===============
-- Chrome Sync Storage Limits:
-- - Total: 100KB
-- - Per item: 8KB
-- - Max items: 512
--
-- Current usage: ~50 bytes (well within limits)

-- No SQL database, no migrations, no schema versioning needed.
