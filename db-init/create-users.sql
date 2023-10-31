CREATE DATABASE festival;
GRANT ALL ON festival.* TO festival;

-- Prisma Migrate requires the user account to have permission to create databases.
-- https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database#shadow-database-user-permissions
GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO festival;
