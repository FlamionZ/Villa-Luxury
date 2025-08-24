#!/bin/bash

# Villa Paradise Database Backup Script
# Run this script daily via cron job

# Load environment variables
source .env.local

# Create backup directory
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="villa_paradise_backup_$TIMESTAMP.sql"

# Create database backup
echo "Creating database backup..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"

# Optional: Upload to cloud storage (uncomment and configure)
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.gz" s3://your-backup-bucket/
# rclone copy "$BACKUP_DIR/$BACKUP_FILE.gz" remote:backups/