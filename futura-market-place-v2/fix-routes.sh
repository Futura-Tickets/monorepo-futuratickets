#!/bin/bash

# Fix all dynamic routes to use Promise<{ param: string }> for Next.js 15

files=(
  "app/api/resales/[eventId]/route.ts"
  "app/api/sales/profile/[userId]/route.ts"
  "app/api/admin/promoters/[id]/route.ts"
  "app/api/admin/promoters/[id]/events/route.ts"
  "app/api/admin/orders/[id]/refund/route.ts"
  "app/api/admin/reviews/[id]/route.ts"
  "app/api/user/tickets/[userId]/route.ts"
  "app/api/coupon/[code]/route.ts"
  "app/api/promoCode/[code]/route.ts"
  "app/api/orders/[paymentId]/route.ts"
  "app/api/events/[id]/resales/route.ts"
  "app/api/events/[id]/route.ts"
  "app/api/reviews/[eventId]/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    # Extract param name from path
    param=$(echo "$file" | grep -oP '\[\K[^\]]+')
    echo "  Param: $param"
    
    # Backup
    cp "$file" "${file}.backup"
    
    # Fix the type
    sed -i '' "s/{ params }: { params: { $param: string } }/{ params }: { params: Promise<{ $param: string }> }/g" "$file"
    
    # Add await for params
    sed -i '' "s/params\.$param/await params then use $param/g" "$file"
  fi
done

echo "Done! Check files and remove .backup files if OK"
