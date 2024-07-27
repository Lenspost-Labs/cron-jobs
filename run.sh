#!/bin/bash
cd /home/ubuntu/cron-jobs
export $(grep -v '^#' .env | xargs)
/usr/bin/node index.js 