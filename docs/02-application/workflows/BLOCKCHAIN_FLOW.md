# Flujo Blockchain - FuturaTickets (v2)

## 1. Despliegue de contratos por evento

1. Promotor crea el evento desde el panel (`futura-tickets-admin`).
2. `futura-tickets-admin-api` valida que el evento tenga `isBlockchain = true` y que existan:
   - `BLOCKCHAIN_FACTORY_ADDRESS`
   - `BLOCKCHAIN_RPC_URL` / `BLOCKCHAIN_WS_URL`
   - Credenciales del promotor (private key generada en onboarding)
3. Se envía la transacción `createNew(owner, eventName, maxSupply, baseURI)` al `FuturaEventFactory` (contrato v2).
4. Al confirmarse la transacción se actualiza el evento con:
   - `address` del contrato específico
   - `hash` y `blockNumber`
   - Estado `HOLD` (queda listo para lanzar boletos)
5. Si falta configuración o la transacción falla, el backend registra el evento sin datos on-chain y el flujo continúa en modo “off-chain”.

## 2. Mint de tickets (venta primaria)

1. Cada orden confirmada dispara `AdminEventService.mintTicket`.
2. Se obtiene la wallet del promotor (owner del contrato) y se asegura la wallet del comprador.
3. Se ejecuta `mintNFT(price, buyer, royalty, timestamp, status)` desde la cuenta del promotor.
4. El backend espera la transacción y procesa el evento `TokenMinted` para adjuntar `tokenId`, `blockNumber` y `hash` a la venta.
5. Si ocurre un error (gas, RPC, credenciales), el sistema registra la venta off-chain y deja trazas en el historial para retry manual.

## 3. Transferencias y reventa

- **Reventa:**
  - El comprador indica precio → `setNFTPrice(tokenId, price)` en contrato.
  - Cancelación → `cancelResale(tokenId)`.
- **Transferencias (mercado secundario):**
  - Se ejecuta `transferNFT(tokenId, newOwner)` firmada por el dueño actual.
  - Después de la confirmación, el backend sincroniza historia y ownership.

## 4. Configuración necesaria

| API / Frontend | Variables obligatorias | Notas |
|----------------|------------------------|-------|
| `futura-tickets-admin-api` | `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_WS_URL`, `BLOCKCHAIN_FACTORY_ADDRESS`, `BLOCKCHAIN_CHAIN_ID`, `BLOCKCHAIN_METADATA_BASE_URI`, `BLOCKCHAIN_DEFAULT_GAS_LIMIT` | Sin estas variables el flujo vuelve automáticamente a modo off-chain. |
| `futura-market-place-api` | `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_WS_URL` *(solo lectura)* | Permite consultar estado de tickets on-chain (roadmap). |
| Frontends (`market-place-v2`, `admin`) | `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_FACTORY_ADDRESS` *(opcional)* | Solo lectura para herramientas de monitoreo / exploradores. |

## 5. Fallback / resiliencia

- Todos los caminos envían actualizaciones a `SalesService`. Si no hay datos on-chain se registran eventos tradicionales.
- El historial de cada venta incluye motivo y hash (cuando existe) para facilitar auditorías.
- Los logs del servicio (`AdminEventService`) registran cuándo se entra en fallback y cuál fue el error devuelto por el RPC o la wallet.

## 6. Próximos pasos sugeridos

1. **Webhook de eventos on-chain**: enganchar un listener (o cron) que sincronice transferencias realizadas fuera de la plataforma.
2. **Caches de lectura**: exponer endpoints en `market-place-api` para consultar estado directo del contrato (owner actual, estado resale, etc.).
3. **Hardening de claves**: migrar `key` de promotores a un vault (Azure Key Vault, AWS KMS) con firma delegada.
4. **Tests end-to-end**: ejecutar Hardhat/Foundry para validar `createNew` + `mintNFT` + `transferNFT` dentro del CI.
