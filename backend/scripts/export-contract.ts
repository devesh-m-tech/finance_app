import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import {
  PERMISSION_CATALOG,
  DEFAULT_ROLE_PERMISSIONS,
} from '../src/modules/permissions/catalog';

async function exportContract() {
  console.log('📦 Exporting OpenAPI specification & Permissions catalog...');

  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Shri Amudha Small Finance - LMS API')
    .setDescription(
      'Enterprise Loan Management System for Daily, Weekly, Monthly, Vehicle, and Metal Lending'
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const contractDir = path.resolve(__dirname, '../contract');
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true });
  }

  // 1. Write openapi.json
  const openApiPath = path.join(contractDir, 'openapi.json');
  fs.writeFileSync(openApiPath, JSON.stringify(document, null, 2), 'utf8');
  console.log(`✅ Exported openapi.json to ${openApiPath}`);

  // 2. Write permissions.json
  const permissionsData = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    catalog: PERMISSION_CATALOG,
    defaultMatrix: DEFAULT_ROLE_PERMISSIONS,
  };

  const permsPath = path.join(contractDir, 'permissions.json');
  fs.writeFileSync(permsPath, JSON.stringify(permissionsData, null, 2), 'utf8');
  console.log(`✅ Exported permissions.json to ${permsPath}`);

  await app.close();
  console.log('🎉 Contract export finished successfully.');
  process.exit(0);
}

exportContract().catch((err) => {
  console.error('❌ Failed to export contract:', err);
  process.exit(1);
});
