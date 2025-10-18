import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureFlagsService, CreateFeatureFlagDto, UpdateFeatureFlagDto } from './feature-flags.service';
import { FeatureFlag } from './feature-flag.schema';

/**
 * Feature Flags Management Controller
 *
 * Provides admin endpoints to manage feature flags
 * Requires admin authentication (add auth guards as needed)
 */
@ApiTags('Feature Flags')
@Controller('admin/feature-flags')
// @UseGuards(AdminAuthGuard) // Uncomment when ready
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  /**
   * Get all feature flags
   */
  @Get()
  @ApiOperation({ summary: 'List all feature flags' })
  @ApiResponse({ status: 200, description: 'Returns all feature flags' })
  async findAll(): Promise<FeatureFlag[]> {
    return this.featureFlagsService.findAll();
  }

  /**
   * Get feature flag by key
   */
  @Get(':key')
  @ApiOperation({ summary: 'Get feature flag by key' })
  @ApiResponse({ status: 200, description: 'Returns feature flag' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async findByKey(@Param('key') key: string): Promise<FeatureFlag> {
    return this.featureFlagsService.findByKey(key);
  }

  /**
   * Create new feature flag
   */
  @Post()
  @ApiOperation({ summary: 'Create new feature flag' })
  @ApiResponse({ status: 201, description: 'Feature flag created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateFeatureFlagDto): Promise<FeatureFlag> {
    return this.featureFlagsService.create(dto);
  }

  /**
   * Update feature flag
   */
  @Put(':key')
  @ApiOperation({ summary: 'Update feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag updated successfully' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async update(@Param('key') key: string, @Body() dto: UpdateFeatureFlagDto): Promise<FeatureFlag> {
    return this.featureFlagsService.update(key, dto);
  }

  /**
   * Delete feature flag
   */
  @Delete(':key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete feature flag' })
  @ApiResponse({ status: 204, description: 'Feature flag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async delete(@Param('key') key: string): Promise<void> {
    return this.featureFlagsService.delete(key);
  }

  /**
   * Clear feature flags cache
   */
  @Post('cache/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear feature flags cache' })
  @ApiResponse({ status: 204, description: 'Cache cleared successfully' })
  async clearCache(): Promise<void> {
    this.featureFlagsService.clearCache();
  }

  /**
   * Check if feature is enabled (for testing)
   */
  @Get(':key/evaluate')
  @ApiOperation({ summary: 'Evaluate feature flag' })
  @ApiResponse({ status: 200, description: 'Returns feature flag evaluation result' })
  async evaluate(@Param('key') key: string): Promise<{ key: string; enabled: boolean }> {
    const enabled = await this.featureFlagsService.isEnabled(key);
    return { key, enabled };
  }
}
