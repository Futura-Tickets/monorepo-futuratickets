# PRUEBA COMPLETA DEL FLUJO END-TO-END

## 🎯 OBJETIVO
Probar el flujo completo desde la creación del evento hasta la validación del acceso.

---

## ✅ PRE-REQUISITOS

Antes de comenzar, asegúrate de tener:
- [x] Todas las aplicaciones corriendo (usar `./start-all-with-stripe.sh`)
- [x] Stripe configurado con test keys
- [x] Stripe CLI con webhook listener activo
- [x] Evento de prueba creado (ID: `68f1070ea5e5740642adc9d7`)

---

## 🔄 FLUJO COMPLETO (10 Pasos)

### PASO 1: Verificar Evento en Marketplace ✅
**Ya completado en análisis anterior**

```bash
# Verificar que el evento está visible
curl -s http://localhost:3000/api/events | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'Eventos disponibles: {len(data.get(\"events\", []))}')
for e in data.get('events', []):
    if '68f1070ea5e5740642adc9d7' in str(e.get('_id', '')):
        print(f'✅ Evento encontrado: {e.get(\"name\")}')
"
```

---

### PASO 2: Crear/Registrar Usuario para Compra

#### Opción A: Usar marketplace web (Recomendado)
1. Ir a http://localhost:3000
2. Click en "Register"
3. Llenar formulario:
   - Email: comprador@test.com
   - Password: Test123!
   - Nombre: Test Buyer

#### Opción B: Crear vía API
```bash
# Guardar en create-user-api.sh
cat > /tmp/create-user.sh << 'EOF'
#!/bin/bash

curl -X POST http://localhost:3001/accounts/register-google \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "comprador-test@futuratickets.test",
    "name": "Comprador",
    "lastName": "Test",
    "birthdate": "1995-05-15"
  }' | python3 -m json.tool

echo ""
echo "✅ Usuario creado"
echo "Ahora haz login para obtener el token"
EOF

chmod +x /tmp/create-user.sh && /tmp/create-user.sh
```

---

### PASO 3: Login como Usuario Comprador

```bash
cat > /tmp/login-buyer.sh << 'EOF'
#!/bin/bash

# Login
RESPONSE=$(curl -s -X POST http://localhost:3001/accounts/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "comprador-test@futuratickets.test",
    "password": "Test123!"
  }')

echo "$RESPONSE" | python3 -m json.tool > /tmp/buyer-login.json

# Extraer token
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
    echo "❌ Error en login"
    cat /tmp/buyer-login.json
    exit 1
fi

echo "✅ Login exitoso"
echo "Token guardado en /tmp/buyer-token.txt"
echo "$TOKEN" > /tmp/buyer-token.txt

# Mostrar info del usuario
echo ""
echo "Usuario:"
cat /tmp/buyer-login.json | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"  Nombre: {d.get('name')} {d.get('lastName')}\\n  Email: {d.get('email')}\\n  ID: {d.get('_id')}\")"
EOF

chmod +x /tmp/login-buyer.sh && /tmp/login-buyer.sh
```

---

### PASO 4: Crear Orden de Compra

```bash
cat > /tmp/create-order.sh << 'EOF'
#!/bin/bash

TOKEN=$(cat /tmp/buyer-token.txt)

if [ -z "$TOKEN" ]; then
    echo "❌ No se encontró token. Ejecuta primero login-buyer.sh"
    exit 1
fi

echo "🛒 Creando orden de compra..."

curl -s -X POST http://localhost:3001/user/events/create-order \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "contactDetails": {
      "name": "Test",
      "lastName": "Buyer",
      "email": "comprador-test@futuratickets.test",
      "phone": "+34600000000",
      "birthdate": "1995-05-15"
    },
    "event": "68f1070ea5e5740642adc9d7",
    "promoter": "68f0d6e8d6b193242562c625",
    "items": [
      {
        "type": "General",
        "amount": 2,
        "price": 50.00
      }
    ]
  }' | python3 -m json.tool > /tmp/order-created.json

echo ""
echo "✅ Orden creada"
cat /tmp/order-created.json

# Guardar paymentId para el siguiente paso
PAYMENT_ID=$(cat /tmp/order-created.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('paymentId', ''))")
echo "$PAYMENT_ID" > /tmp/payment-id.txt
echo ""
echo "💳 Payment ID: $PAYMENT_ID"
echo "   (guardado en /tmp/payment-id.txt)"
EOF

chmod +x /tmp/create-order.sh && /tmp/create-order.sh
```

**Output Esperado**:
```json
{
  "paymentId": "pi_xxx...",
  "clientSecret": "pi_xxx_secret_yyy",
  "order": {
    "_id": "order_id",
    "status": "PENDING",
    "total": 100.00,
    ...
  }
}
```

---

### PASO 5: Simular Pago con Stripe

#### Opción A: Usar Marketplace Web (Más Real)
1. El frontend debería redirigir a checkout
2. Stripe Elements se carga con el clientSecret
3. Usar tarjeta de prueba: `4242 4242 4242 4242`
4. CVV: cualquier 3 dígitos
5. Fecha: cualquier fecha futura
6. Click "Pay"

#### Opción B: Trigger Manual (Para Testing)
```bash
cat > /tmp/trigger-payment.sh << 'EOF'
#!/bin/bash

PAYMENT_ID=$(cat /tmp/payment-id.txt)

if [ -z "$PAYMENT_ID" ]; then
    echo "❌ No se encontró payment ID"
    exit 1
fi

echo "💳 Simulando pago exitoso para: $PAYMENT_ID"
echo ""
echo "⚠️  Esto requiere que stripe listen esté corriendo"
echo ""

# Trigger evento de pago exitoso
stripe trigger payment_intent.succeeded --override payment_intent:id=$PAYMENT_ID

echo ""
echo "✅ Evento enviado"
echo "   Verifica los logs del servidor para confirmar procesamiento"
EOF

chmod +x /tmp/trigger-payment.sh && /tmp/trigger-payment.sh
```

**Verifica en logs del servidor**:
Deberías ver algo como:
```
[Nest] INFO  [StripeController] Webhook received: payment_intent.succeeded
[Nest] INFO  [EventProcessor] Processing payment for order: xxx
[Nest] INFO  [EventProcessor] Generating 2 tickets...
[Nest] INFO  [QrCodeService] Generated QR code for ticket xxx
[Nest] INFO  [MailProcessor] Sending email with tickets to: xxx@test.com
```

---

### PASO 6: Verificar Tickets Generados

```bash
cat > /tmp/check-tickets.sh << 'EOF'
#!/bin/bash

TOKEN=$(cat /tmp/buyer-token.txt)
PAYMENT_ID=$(cat /tmp/payment-id.txt)

echo "🎫 Verificando tickets generados..."

# Obtener orden por paymentId
curl -s "http://localhost:3001/orders/$PAYMENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool > /tmp/order-details.json

# Mostrar tickets
cat /tmp/order-details.json | python3 -c "
import sys, json
data = json.load(sys.stdin)

if isinstance(data, list):
    order = data[0] if data else {}
else:
    order = data

sales = order.get('sales', [])

print(f'Orden ID: {order.get(\"_id\")}')
print(f'Estado: {order.get(\"status\")}')
print(f'Total: €{order.get(\"total\", 0)}')
print(f'\\nTickets generados: {len(sales)}')
print('')

for i, sale in enumerate(sales, 1):
    print(f'{i}. Ticket {sale.get(\"_id\")}')
    print(f'   Tipo: {sale.get(\"type\")}')
    print(f'   Estado: {sale.get(\"status\")}')
    print(f'   QR Code: {sale.get(\"qrCode\", \"N/A\")[:50]}...')
    print('')
"
EOF

chmod +x /tmp/check-tickets.sh && /tmp/check-tickets.sh
```

---

### PASO 7: Crear Cuenta ACCESS para Validación

```bash
cat > /tmp/create-access-account.sh << 'EOF'
#!/bin/bash

echo "🔐 Creando cuenta ACCESS..."

# Esta cuenta necesita crearse en MongoDB directamente
# o mediante un endpoint de admin

# Usar MongoDB Shell:
mongosh "mongodb://localhost:27017/futuratickets" << 'MONGO'
use futuratickets

// Crear cuenta ACCESS
db.accounts.insertOne({
  name: "Validador",
  lastName: "Prueba",
  email: "validador-test@futuratickets.test",
  password: "$2b$10$xQzWcJZKMx9zLqK7gE.fV.PEWGwJLkZ6H1YdQ1mQ7Nx8PYr3.IJ4O",  // AccessTest!2025
  role: "access",
  promoter: ObjectId("68f0d6e8d6b193242562c625"),
  accessEvent: ObjectId("68f1070ea5e5740642adc9d7"),
  registered: true,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Verificar creación
var account = db.accounts.findOne({email: "validador-test@futuratickets.test"})
print("✅ Cuenta ACCESS creada:")
printjson({
  _id: account._id,
  name: account.name,
  email: account.email,
  role: account.role
})
MONGO

echo ""
echo "✅ Cuenta ACCESS creada"
echo "   Email: validador-test@futuratickets.test"
echo "   Password: AccessTest!2025"
EOF

chmod +x /tmp/create-access-account.sh && /tmp/create-access-account.sh
```

---

### PASO 8: Login con Cuenta ACCESS

```bash
cat > /tmp/login-access.sh << 'EOF'
#!/bin/bash

echo "🔐 Login con cuenta ACCESS..."

curl -s -X POST http://localhost:5001/accounts/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "validador-test@futuratickets.test",
    "password": "AccessTest!2025"
  }' | python3 -m json.tool > /tmp/access-login.json

# Extraer token
TOKEN=$(cat /tmp/access-login.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
    echo "❌ Error en login ACCESS"
    cat /tmp/access-login.json
    exit 1
fi

echo "✅ Login ACCESS exitoso"
echo "$TOKEN" > /tmp/access-token.txt

cat /tmp/access-login.json | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'''
Validador:
  Nombre: {d.get('name')} {d.get('lastName')}
  Email: {d.get('email')}
  Evento asignado: {d.get('accessEvent', {}).get('name')}
''')"
EOF

chmod +x /tmp/login-access.sh && /tmp/login-access.sh
```

---

### PASO 9: Ver Lista de Asistentes

```bash
cat > /tmp/list-attendants.sh << 'EOF'
#!/bin/bash

TOKEN=$(cat /tmp/access-token.txt)
EVENT_ID="68f1070ea5e5740642adc9d7"

echo "📋 Lista de asistentes del evento..."

curl -s "http://localhost:5001/events/attendants/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool > /tmp/attendants.json

cat /tmp/attendants.json | python3 -c "
import sys, json
attendants = json.load(sys.stdin)

print(f'Total asistentes: {len(attendants)}\\n')

for i, att in enumerate(attendants, 1):
    client = att.get('client', {})
    print(f'{i}. {client.get(\"name\")} {client.get(\"lastName\")}')
    print(f'   Email: {client.get(\"email\")}')
    print(f'   Ticket ID: {att.get(\"_id\")}')
    print(f'   Tipo: {att.get(\"type\")}')
    print(f'   Estado: {att.get(\"status\")}')
    print(f'   Precio: €{att.get(\"price\")}')
    print('')
"
EOF

chmod +x /tmp/list-attendants.sh && /tmp/list-attendants.sh
```

---

### PASO 10: Validar Acceso (Check-in)

```bash
cat > /tmp/validate-access.sh << 'EOF'
#!/bin/bash

TOKEN=$(cat /tmp/access-token.txt)

# Obtener primer ticket de la lista
TICKET_ID=$(cat /tmp/attendants.json | python3 -c "import sys, json; print(json.load(sys.stdin)[0].get('_id', ''))")

if [ -z "$TICKET_ID" ]; then
    echo "❌ No se encontraron tickets"
    exit 1
fi

echo "🎫 Validando acceso para ticket: $TICKET_ID"

curl -s -X PATCH http://localhost:5001/events/access \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"sale\": \"$TICKET_ID\"}" \
  | python3 -m json.tool

echo ""
echo "✅ Validación completada"
echo ""
echo "Verificar respuesta:"
echo "  - access: GRANTED = ✅ Acceso permitido"
echo "  - access: DENIED = ❌ Acceso denegado (posible ticket ya usado)"
EOF

chmod +x /tmp/validate-access.sh && /tmp/validate-access.sh
```

**Output Esperado (Primera Vez)**:
```json
{
  "access": "GRANTED",
  "reason": "Access granted",
  "name": "Test Buyer",
  "email": "comprador-test@futuratickets.test",
  "type": "General",
  "price": 50.00
}
```

**Output Esperado (Segunda Vez - Mismo Ticket)**:
```json
{
  "access": "DENIED",
  "reason": "Ticket already used.",
  "name": "Test Buyer",
  "email": "comprador-test@futuratickets.test",
  "type": "General",
  "price": 50.00
}
```

---

## 🎯 SCRIPT MAESTRO: Ejecutar Todo el Flujo

```bash
cat > /tmp/run-full-e2e-test.sh << 'EOF'
#!/bin/bash

echo "🚀 PRUEBA COMPLETA END-TO-END"
echo "=============================="
echo ""

echo "PASO 1: Verificar evento..."
curl -s http://localhost:3000/api/events | python3 -c "import sys, json; print(f'✅ {len(json.load(sys.stdin).get(\"events\", []))} eventos disponibles')"

echo ""
echo "PASO 2: Crear usuario comprador..."
/tmp/create-user.sh

echo ""
echo "PASO 3: Login comprador..."
/tmp/login-buyer.sh

echo ""
echo "PASO 4: Crear orden..."
/tmp/create-order.sh

echo ""
echo "PASO 5: Simular pago..."
/tmp/trigger-payment.sh

echo ""
echo "⏳ Esperando 5 segundos para procesamiento..."
sleep 5

echo ""
echo "PASO 6: Verificar tickets..."
/tmp/check-tickets.sh

echo ""
echo "PASO 7: Crear cuenta ACCESS..."
/tmp/create-access-account.sh

echo ""
echo "PASO 8: Login ACCESS..."
/tmp/login-access.sh

echo ""
echo "PASO 9: Ver asistentes..."
/tmp/list-attendants.sh

echo ""
echo "PASO 10: Validar acceso..."
/tmp/validate-access.sh

echo ""
echo "=============================="
echo "✅ PRUEBA E2E COMPLETADA"
echo "=============================="
EOF

chmod +x /tmp/run-full-e2e-test.sh
```

---

## 📊 CHECKLIST DE VERIFICACIÓN FINAL

Al completar todos los pasos, verifica:

- [ ] Evento visible en marketplace
- [ ] Usuario puede registrarse/login
- [ ] Orden se crea correctamente
- [ ] PaymentIntent se genera en Stripe
- [ ] Webhook de pago se recibe
- [ ] Tickets se generan con QR codes
- [ ] Email se envía (verificar logs)
- [ ] Cuenta ACCESS puede hacer login
- [ ] Lista de asistentes es visible
- [ ] Validación de ticket funciona (GRANTED)
- [ ] Re-validación es rechazada (DENIED)
- [ ] WebSocket emite notificación (verificar logs)

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot POST /user/events/create-order"
- Verificar que el token JWT es válido
- Verificar que el endpoint es correcto (con /user/)
- Verificar que el servidor está corriendo

### Error: "Invalid account"
- Verificar que el usuario existe en BD
- Verificar que el rol es correcto
- Verificar que el token no ha expirado

### Webhook no se recibe
- Verificar que `stripe listen` está corriendo
- Verificar que el STRIPE_WEBHOOK_SECRET está actualizado
- Reiniciar el servidor después de cambiar .env

### Tickets no se generan
- Verificar logs del Event Processor
- Verificar que el webhook se recibió
- Verificar estado del PaymentIntent en Stripe Dashboard

---

## 📚 SIGUIENTE PASO

Una vez completada la prueba E2E:
1. Revisar logs para identificar posibles mejoras
2. Implementar tests automatizados
3. Configurar ambiente de staging
4. Preparar para producción

Ver: `DEPLOYMENT_GUIDE.md` (próximo documento)
