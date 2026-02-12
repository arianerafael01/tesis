This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Validación de Deployments

Este proyecto incluye comandos para validar el código localmente antes de hacer deploy, evitando errores en Vercel:

### Comandos Disponibles

```bash
# Verificar tipos TypeScript (igual que Vercel)
npm run type-check

# Verificar linting con ESLint
npm run lint

# Auto-corregir problemas de linting
npm run lint:fix

# Ejecutar validación completa (type-check + lint)
npm run validate

# Validación completa + build (simula el proceso de Vercel)
npm run pre-deploy
```

### Workflow Recomendado

1. **Antes de hacer commit:**
   ```bash
   npm run validate
   ```

2. **Antes de hacer deploy a Vercel:**
   ```bash
   npm run pre-deploy
   ```

3. **Si hay errores de build en Vercel:**
   - Elimina el directorio `.next` localmente
   - Ejecuta `npm run validate` para detectar errores

### Configuración

La configuración de TypeScript y ESLint para builds está en:
- `next.config.mjs` - Control de strictness en builds
- `tsconfig.json` - Configuración de TypeScript
- Scripts en `package.json`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
