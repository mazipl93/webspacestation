-- RBAC: add enum values (must be committed before use — no DEFAULT in this file)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MODERATOR';
