/**
 * 🎧 EVENT MONITORING EXAMPLE
 *
 * Ejemplos de cómo integrar el sistema de monitoreo de eventos blockchain
 * en tus backends de FuturaTickets.
 *
 * CASOS DE USO:
 * 1. Escuchar nuevos contratos creados → Registrar en BD
 * 2. Escuchar tickets minteados → Actualizar Sale con tokenId
 * 3. Escuchar cambios de precio → Sincronizar mercado secundario
 * 4. Escuchar transferencias → Actualizar ownership en BD
 * 5. Histórico de eventos → Sincronización inicial o recuperación
 */

import { EventMonitor, NETWORKS, CONTRACT_ADDRESSES } from "../lib";

// ==================== CONFIGURACIÓN ====================

const RPC_URL = NETWORKS.hardhat.rpcUrl;
const FACTORY_ADDRESS = CONTRACT_ADDRESSES.hardhat.factoryAddress;

console.log("🚀 Iniciando Event Monitor Example...");
console.log(`📡 RPC: ${RPC_URL}`);
console.log(`🏭 Factory: ${FACTORY_ADDRESS}`);
console.log("");

// ==================== EJEMPLO 1: ESCUCHAR NUEVOS EVENTOS ====================

async function example1_ListenToNewEvents() {
  console.log("📋 EJEMPLO 1: Escuchar Nuevos Contratos de Eventos");
  console.log("─────────────────────────────────────────────────");

  const monitor = new EventMonitor({
    rpcUrl: RPC_URL,
    factoryAddress: FACTORY_ADDRESS,
  });

  // Escuchar cuando se crea un nuevo contrato de evento
  monitor.onFactoryEventCreated(async (event) => {
    console.log("🆕 Nuevo evento creado:");
    console.log(`   📍 Address: ${event.eventAddress}`);
    console.log(`   🔢 Block: ${event.blockNumber}`);
    console.log(`   📅 Timestamp: ${new Date(event.timestamp * 1000).toISOString()}`);
    console.log(`   🔗 Tx: ${event.transactionHash}`);

    // INTEGRACIÓN CON BACKEND:
    /*
    await Event.updateOne(
      { promoter: promoterId },
      {
        address: event.eventAddress,
        blockNumber: event.blockNumber,
        deploymentTxHash: event.transactionHash
      }
    );
    */
  });

  console.log("👂 Escuchando FuturaEventCreated...");
  console.log("   (Crear un nuevo evento para ver resultados)");
  console.log("");
}

// ==================== EJEMPLO 2: ESCUCHAR TICKETS MINTEADOS ====================

async function example2_ListenToTicketsMinted() {
  console.log("📋 EJEMPLO 2: Escuchar Tickets Minteados");
  console.log("─────────────────────────────────────────────────");

  const monitor = new EventMonitor({
    rpcUrl: RPC_URL,
    factoryAddress: FACTORY_ADDRESS,
  });

  // Dirección de un contrato de evento específico
  const eventContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  monitor.onTokenMinted(eventContractAddress, async (event) => {
    console.log("🎫 Ticket minteado:");
    console.log(`   👤 Cliente: ${event.client}`);
    console.log(`   🔢 TokenID: ${event.tokenId}`);
    console.log(`   📅 Timestamp: ${new Date(event.timestamp * 1000).toISOString()}`);
    console.log(`   🔗 Tx: ${event.transactionHash}`);

    // INTEGRACIÓN CON BACKEND:
    /*
    await Sale.updateOne(
      { clientAddress: event.client, tokenId: null },
      {
        tokenId: event.tokenId,
        mintedAt: new Date(event.timestamp * 1000),
        blockNumber: event.blockNumber,
        mintTxHash: event.transactionHash
      }
    );
    */
  });

  console.log(`👂 Escuchando TokenMinted en ${eventContractAddress}...`);
  console.log("");
}

// ==================== EJEMPLO 3: AUTO-REGISTRO DE EVENTOS ====================

async function example3_AutoRegisterNewEvents() {
  console.log("📋 EJEMPLO 3: Auto-Registro de Nuevos Eventos");
  console.log("─────────────────────────────────────────────────");

  const monitor = new EventMonitor({
    rpcUrl: RPC_URL,
    factoryAddress: FACTORY_ADDRESS,
  });

  // Registrar automáticamente listeners para nuevos eventos
  await monitor.autoRegisterNewEvents(async (eventAddress) => {
    console.log(`🤖 Auto-registrando listeners para ${eventAddress}...`);

    // Escuchar todos los eventos del nuevo contrato
    monitor.onAllEvents(eventAddress, {
      onMinted: async (event) => {
        console.log(`  ├─ 🎫 Ticket ${event.tokenId} minteado para ${event.client}`);
      },
      onPriced: async (event) => {
        console.log(`  ├─ 💰 Ticket ${event.tokenId} precio: ${event.price} Wei`);
      },
      onCancel: async (event) => {
        console.log(`  ├─ ❌ Venta cancelada: ticket ${event.tokenId}`);
      },
      onTransfer: async (event) => {
        console.log(`  └─ 📦 Transfer: ticket ${event.tokenId} de ${event.from} a ${event.to}`);
      },
    });
  });

  console.log("🤖 Auto-registro activado. Los nuevos eventos se registrarán automáticamente.");
  console.log("");
}

// ==================== EJEMPLO 4: HISTÓRICO DE EVENTOS ====================

async function example4_GetHistoricalEvents() {
  console.log("📋 EJEMPLO 4: Obtener Histórico de Eventos");
  console.log("─────────────────────────────────────────────────");

  const monitor = new EventMonitor({
    rpcUrl: RPC_URL,
    factoryAddress: FACTORY_ADDRESS,
  });

  // Obtener todos los eventos creados desde el bloque 0
  console.log("📜 Obteniendo histórico de eventos creados...");
  const factoryEvents = await monitor.getFactoryEventsHistory(0);

  console.log(`✅ Encontrados ${factoryEvents.length} eventos:`);
  factoryEvents.forEach((event, index) => {
    console.log(`   ${index + 1}. ${event.eventAddress} (bloque ${event.blockNumber})`);
  });

  if (factoryEvents.length > 0) {
    // Obtener histórico de tickets minteados del primer evento
    const firstEventAddress = factoryEvents[0].eventAddress;
    console.log(`\n📜 Obteniendo tickets minteados del evento ${firstEventAddress}...`);

    const mintedTickets = await monitor.getTokenMintedHistory(
      firstEventAddress,
      0
    );

    console.log(`✅ Encontrados ${mintedTickets.length} tickets minteados:`);
    mintedTickets.forEach((ticket, index) => {
      console.log(
        `   ${index + 1}. Token #${ticket.tokenId} → ${ticket.client} (${new Date(ticket.timestamp * 1000).toISOString()})`
      );
    });

    // Obtener histórico de transferencias
    console.log(`\n📜 Obteniendo transferencias del evento...`);
    const transfers = await monitor.getTransferHistory(firstEventAddress, 0);

    console.log(`✅ Encontradas ${transfers.length} transferencias:`);
    transfers.forEach((transfer, index) => {
      // Filtrar mint transfers (from = 0x0)
      if (transfer.from !== "0x0000000000000000000000000000000000000000") {
        console.log(
          `   ${index + 1}. Token #${transfer.tokenId}: ${transfer.from} → ${transfer.to}`
        );
      }
    });
  }

  console.log("");
}

// ==================== EJEMPLO 5: BACKEND INTEGRATION COMPLETO ====================

async function example5_FullBackendIntegration() {
  console.log("📋 EJEMPLO 5: Integración Backend Completa");
  console.log("─────────────────────────────────────────────────");

  const monitor = new EventMonitor({
    rpcUrl: RPC_URL,
    factoryAddress: FACTORY_ADDRESS,
    reconnectAttempts: 10, // Más intentos en producción
    pollingInterval: 2000, // Polling cada 2 segundos
  });

  // PASO 1: Sincronizar histórico al iniciar
  console.log("🔄 PASO 1: Sincronizando histórico de eventos...");
  const historicalEvents = await monitor.getFactoryEventsHistory(0);

  for (const factoryEvent of historicalEvents) {
    console.log(`   Sincronizando evento ${factoryEvent.eventAddress}...`);

    // Guardar evento en BD si no existe
    /*
    await Event.findOneAndUpdate(
      { address: factoryEvent.eventAddress },
      {
        address: factoryEvent.eventAddress,
        blockNumber: factoryEvent.blockNumber,
        deploymentTxHash: factoryEvent.transactionHash
      },
      { upsert: true }
    );
    */

    // Sincronizar tickets del evento
    const tickets = await monitor.getTokenMintedHistory(
      factoryEvent.eventAddress,
      0
    );

    for (const ticket of tickets) {
      console.log(
        `     └─ Ticket #${ticket.tokenId} → ${ticket.client.slice(0, 10)}...`
      );

      // Actualizar Sale con tokenId
      /*
      await Sale.updateOne(
        { clientAddress: ticket.client, tokenId: null },
        {
          tokenId: ticket.tokenId,
          mintedAt: new Date(ticket.timestamp * 1000),
          blockNumber: ticket.blockNumber
        }
      );
      */
    }
  }

  console.log("✅ Sincronización completada\n");

  // PASO 2: Escuchar eventos en tiempo real
  console.log("🔊 PASO 2: Activando listeners en tiempo real...");

  // Listener para nuevos eventos
  monitor.onFactoryEventCreated(async (event) => {
    console.log(`\n🆕 Nuevo evento detectado: ${event.eventAddress}`);

    // Guardar en BD
    /*
    await Event.create({
      address: event.eventAddress,
      blockNumber: event.blockNumber,
      deploymentTxHash: event.transactionHash
    });
    */

    // Auto-registrar listeners para el nuevo evento
    monitor.onAllEvents(event.eventAddress, {
      onMinted: async (mintEvent) => {
        console.log(`   🎫 Ticket ${mintEvent.tokenId} minteado`);
        // Actualizar Sale
      },
      onPriced: async (priceEvent) => {
        console.log(`   💰 Precio actualizado: ticket ${priceEvent.tokenId}`);
        // Actualizar ResaleSale
      },
      onCancel: async (cancelEvent) => {
        console.log(`   ❌ Venta cancelada: ticket ${cancelEvent.tokenId}`);
        // Actualizar ResaleSale status
      },
      onTransfer: async (transferEvent) => {
        console.log(
          `   📦 Transfer: ticket ${transferEvent.tokenId} de ${transferEvent.from.slice(0, 10)}... a ${transferEvent.to.slice(0, 10)}...`
        );
        // Actualizar ownership en BD
      },
    });
  });

  // Listeners para eventos existentes
  for (const factoryEvent of historicalEvents) {
    monitor.onAllEvents(factoryEvent.eventAddress, {
      onMinted: async (event) => {
        console.log(`🎫 [${factoryEvent.eventAddress.slice(0, 10)}...] Ticket ${event.tokenId} minteado`);
      },
      onPriced: async (event) => {
        console.log(`💰 [${factoryEvent.eventAddress.slice(0, 10)}...] Precio ticket ${event.tokenId}: ${event.price} Wei`);
      },
    });
  }

  console.log("✅ Todos los listeners activados\n");

  // PASO 3: Monitoreo de salud
  console.log("💓 PASO 3: Monitoreo de salud activado");

  setInterval(() => {
    const status = monitor.getStatus();
    console.log(`   [${new Date().toISOString()}] Status:`);
    console.log(`     └─ Conectado: ${status.connected ? "✅" : "❌"}`);
    console.log(`     └─ Contratos monitoreados: ${status.trackedContracts}`);
  }, 30000); // Cada 30 segundos

  console.log("✅ Sistema de monitoreo completamente operacional\n");
}

// ==================== EJEMPLO 6: ERROR HANDLING ====================

async function example6_ErrorHandling() {
  console.log("📋 EJEMPLO 6: Manejo de Errores y Reconexión");
  console.log("─────────────────────────────────────────────────");

  const monitor = new EventMonitor({
    rpcUrl: RPC_URL,
    factoryAddress: FACTORY_ADDRESS,
    reconnectAttempts: 3,
    reconnectDelay: 2000,
  });

  // El monitor maneja reconexión automáticamente
  monitor.onFactoryEventCreated(async (event) => {
    console.log("✅ Evento recibido correctamente");

    try {
      // Simulación de operación de BD que puede fallar
      // await saveToDatabase(event);

      console.log("✅ Guardado en BD exitoso");
    } catch (error) {
      console.error("❌ Error guardando en BD:", error);
      // Log a sistema de monitoring (Sentry, etc.)
    }
  });

  // Monitoreo de estado
  setInterval(() => {
    const status = monitor.getStatus();
    if (!status.connected) {
      console.error("⚠️ Monitor desconectado, intentando reconectar...");
    }
  }, 5000);

  console.log("✅ Error handling configurado\n");
}

// ==================== EJECUTAR EJEMPLOS ====================

async function main() {
  try {
    // Descomentar el ejemplo que quieras ejecutar:

    // await example1_ListenToNewEvents();
    // await example2_ListenToTicketsMinted();
    // await example3_AutoRegisterNewEvents();
    await example4_GetHistoricalEvents();
    // await example5_FullBackendIntegration();
    // await example6_ErrorHandling();

    // Mantener el proceso corriendo para escuchar eventos
    console.log("⏳ Proceso activo. Presiona Ctrl+C para salir.\n");

    // Evitar que el proceso termine
    // await new Promise(() => {});
  } catch (error) {
    console.error("❌ Error en el ejemplo:", error);
    process.exit(1);
  }
}

// Ejecutar si es invocado directamente
if (require.main === module) {
  main();
}

export { main };
