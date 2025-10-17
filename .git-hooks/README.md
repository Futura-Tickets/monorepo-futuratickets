# Git Hooks para FuturaTickets

Este directorio contiene templates de git hooks para mejorar la calidad del código.

## 🚀 Instalación Rápida

```bash
# Activar pre-commit hook
cp .git-hooks/pre-commit.template .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 📋 Hooks Disponibles

### Pre-commit Hook

**Qué hace:**
- ✅ Detecta secrets hardcodeados (API keys, tokens, passwords)
- ✅ Verifica tamaño de archivos (max 5 MB)
- ✅ Ejecuta ESLint en archivos modificados
- ⚠️ Advierte sobre `console.log` statements
- 🚫 Bloquea archivos `.env` sensibles

**Activación:**
```bash
cp .git-hooks/pre-commit.template .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Desactivación temporal:**
```bash
git commit --no-verify -m "mensaje"
```

**Desactivación permanente:**
```bash
rm .git/hooks/pre-commit
```

## 🔧 Personalización

### Agregar TypeScript checking

Edita `.git/hooks/pre-commit` y descomenta la línea:

```bash
# check_typescript || exit 1  # Uncomment to enforce type checking
```

### Cambiar límite de tamaño de archivo

En `check_file_size()`:

```bash
MAX_SIZE=$((10 * 1024 * 1024)) # 10 MB en vez de 5 MB
```

### Hacer console.log bloqueante

En `check_console_logs()`, cambia:

```bash
return 0  # Cambiar a: return 1
```

## 🐛 Troubleshooting

### "Permission denied"
```bash
chmod +x .git/hooks/pre-commit
```

### "npx: command not found"
Asegúrate de tener Node.js instalado:
```bash
node --version
npm --version
```

### Hook muy lento
Desactiva checks pesados editando el hook:
```bash
# check_linting || exit 1  # Comentar para desactivar
```

## 💡 Best Practices

1. **Commits pequeños:** Los hooks corren más rápido con menos archivos
2. **Auto-fix antes de commit:** `npm run lint -- --fix`
3. **Test local:** Corre tests antes de commit para evitar CI failures
4. **Bypass solo cuando necesario:** `--no-verify` es una excepción, no la regla

## 🔮 Futuros Hooks

**Post-checkout:** Recordar instalar dependencias si package.json cambió
**Pre-push:** Ejecutar test suite completa antes de push
**Commit-msg:** Validar formato de commit messages (Conventional Commits)

---

**Nota:** Estos hooks son **opcionales** pero **recomendados** para todo el equipo.
