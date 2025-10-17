#!/bin/bash

# Stop all Futura Tickets services

echo "🛑 Stopping Futura Tickets services..."

if [ -f logs/pids.txt ]; then
  while read pid; do
    if kill -0 $pid 2>/dev/null; then
      kill $pid
      echo "✅ Stopped process $pid"
    fi
  done < logs/pids.txt
  rm logs/pids.txt
else
  echo "⚠️  No PIDs file found. Killing by port..."
  lsof -ti:3000,3003,3007,4101,4102,4103 | xargs kill -9 2>/dev/null || true
fi

echo "✅ All services stopped"
