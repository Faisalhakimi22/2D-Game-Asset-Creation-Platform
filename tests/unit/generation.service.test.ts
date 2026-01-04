/**
 * Unit Tests: Generation Service
 * Tests for prompt building and generation utilities
 */

describe('Generation Service - Unit Tests', () => {
    
    // ========================================
    // UT-GEN-001: buildPrompt with pixel art style
    // ========================================
    describe('UT-GEN-001: buildPrompt with pixel art style', () => {
        it('should include pixel art keywords in prompt', () => {
            const params = {
                prompt: 'a warrior character',
                type: 'sprite' as const,
                style: 'pixel_art' as const,
                aspectRatio: '1:1',
                viewpoint: 'front',
                quantity: 1
            };
            
            const result = buildPrompt(params);
            
            expect(result).toContain('pixel art');
            expect(result).toContain('pixel boundaries');
            expect(result).toContain('retro game aesthetic');
            expect(result).toContain('a warrior character');
        });
    });

    // ========================================
    // UT-GEN-002: buildPrompt with 2D flat style
    // ========================================
    describe('UT-GEN-002: buildPrompt with 2D flat style', () => {
        it('should include 2D flat keywords in prompt', () => {
            const params = {
                prompt: 'a tree object',
                type: 'sprite' as const,
                style: '2d_flat' as const,
                aspectRatio: '1:1',
                viewpoint: 'front',
                quantity: 1
            };
            
            const result = buildPrompt(params);
            
            expect(result).toContain('2D flat');
            expect(result).toContain('clean lines');
            expect(result).toContain('solid colors');
            expect(result).toContain('a tree object');
        });
    });

    // ========================================
    // UT-GEN-003: buildPrompt with color palette
    // ========================================
    describe('UT-GEN-003: buildPrompt with color palette', () => {
        it('should include specified colors in prompt', () => {
            const params = {
                prompt: 'a knight',
                type: 'sprite' as const,
                style: 'pixel_art' as const,
                aspectRatio: '1:1',
                viewpoint: 'front',
                colors: ['#FF5733', '#33FF57', '#3357FF'],
                quantity: 1
            };
            
            const result = buildPrompt(params);
            
            expect(result).toContain('#FF5733');
            expect(result).toContain('#33FF57');
            expect(result).toContain('#3357FF');
            expect(result).toContain('Use these colors');
        });
    });

    // ========================================
    // UT-GEN-004: getImageDimensions for 1:1
    // ========================================
    describe('UT-GEN-004: getImageDimensions for 1:1', () => {
        it('should return 1024x1024 for 1:1 aspect ratio', () => {
            const result = getImageDimensions('1:1');
            
            expect(result.width).toBe(1024);
            expect(result.height).toBe(1024);
        });
    });

    // ========================================
    // UT-GEN-005: getImageDimensions for 16:9
    // ========================================
    describe('UT-GEN-005: getImageDimensions for 16:9', () => {
        it('should return 1024x576 for 16:9 aspect ratio', () => {
            const result = getImageDimensions('16:9');
            
            expect(result.width).toBe(1024);
            expect(result.height).toBe(576);
        });
    });

    // ========================================
    // UT-GEN-006: getImageDimensions for all ratios
    // ========================================
    describe('UT-GEN-006: getImageDimensions for all supported ratios', () => {
        const testCases = [
            { ratio: '2:3', expected: { width: 688, height: 1024 } },
            { ratio: '1:1', expected: { width: 1024, height: 1024 } },
            { ratio: '9:16', expected: { width: 576, height: 1024 } },
            { ratio: '4:3', expected: { width: 1024, height: 768 } },
            { ratio: '3:2', expected: { width: 1024, height: 688 } },
            { ratio: '16:9', expected: { width: 1024, height: 576 } },
        ];

        testCases.forEach(({ ratio, expected }) => {
            it(`should return ${expected.width}x${expected.height} for ${ratio}`, () => {
                const result = getImageDimensions(ratio);
                expect(result).toEqual(expected);
            });
        });

        it('should return default 1024x1024 for unknown ratio', () => {
            const result = getImageDimensions('unknown');
            expect(result).toEqual({ width: 1024, height: 1024 });
        });
    });

    // ========================================
    // UT-GEN-007: buildPrompt with viewpoints
    // ========================================
    describe('UT-GEN-007: buildPrompt with different viewpoints', () => {
        const viewpoints = [
            { viewpoint: 'front', expected: 'front-facing view' },
            { viewpoint: 'side', expected: 'side profile view' },
            { viewpoint: 'isometric', expected: 'isometric perspective' },
            { viewpoint: 'top_down', expected: 'top-down' },
            { viewpoint: 'back', expected: 'behind/back view' },
        ];

        viewpoints.forEach(({ viewpoint, expected }) => {
            it(`should include ${viewpoint} description`, () => {
                const params = {
                    prompt: 'test',
                    type: 'sprite' as const,
                    style: 'pixel_art' as const,
                    aspectRatio: '1:1',
                    viewpoint,
                    quantity: 1
                };
                
                const result = buildPrompt(params);
                expect(result.toLowerCase()).toContain(expected.toLowerCase());
            });
        });
    });

    // ========================================
    // UT-GEN-008: buildPrompt for scene type
    // ========================================
    describe('UT-GEN-008: buildPrompt for scene type', () => {
        it('should include scene-specific context', () => {
            const params = {
                prompt: 'forest background',
                type: 'scene' as const,
                style: 'pixel_art' as const,
                aspectRatio: '16:9',
                viewpoint: 'side',
                quantity: 1
            };
            
            const result = buildPrompt(params);
            
            expect(result).toContain('game scene');
            expect(result).toContain('background environment');
            expect(result).toContain('forest background');
        });
    });

    // ========================================
    // UT-GEN-009: buildAnimationFramePrompt
    // ========================================
    describe('UT-GEN-009: buildAnimationFramePrompt', () => {
        it('should include frame number and pose description', () => {
            const params = {
                characterImage: 'data:image/png;base64,test',
                viewType: 'isometric' as const,
                direction: 'right',
                animationType: 'Walking',
                frameDescriptions: [
                    'Standing pose',
                    'Right leg forward',
                    'Left leg forward',
                    'Return to standing'
                ]
            };
            
            const result = buildAnimationFramePrompt(params, 1, 4);
            
            expect(result).toContain('frame 2 of 4');
            expect(result).toContain('Walking');
            expect(result).toContain('Right leg forward');
            expect(result).toContain('isometric');
            expect(result).toContain('facing right');
        });
    });

    // ========================================
    // UT-GEN-010: buildAnimationFramePrompt directions
    // ========================================
    describe('UT-GEN-010: buildAnimationFramePrompt with all directions', () => {
        const directions = ['right', 'left', 'up', 'down', 'up_right', 'up_left', 'down_right', 'down_left'];
        
        directions.forEach(direction => {
            it(`should include ${direction} direction`, () => {
                const params = {
                    characterImage: 'data:image/png;base64,test',
                    viewType: 'isometric' as const,
                    direction,
                    animationType: 'Walking',
                    frameDescriptions: ['Test pose']
                };
                
                const result = buildAnimationFramePrompt(params, 0, 1);
                expect(result.toLowerCase()).toContain(direction.replace('_', '-').replace('_', ' '));
            });
        });
    });
});

// ========================================
// Helper function implementations for testing
// ========================================

function getImageDimensions(aspectRatio: string): { width: number; height: number } {
    const ratioMap: Record<string, { width: number; height: number }> = {
        '2:3': { width: 688, height: 1024 },
        '1:1': { width: 1024, height: 1024 },
        '9:16': { width: 576, height: 1024 },
        '4:3': { width: 1024, height: 768 },
        '3:2': { width: 1024, height: 688 },
        '16:9': { width: 1024, height: 576 },
    };
    return ratioMap[aspectRatio] || { width: 1024, height: 1024 };
}

interface GenerationParams {
    prompt: string;
    type: 'sprite' | 'scene';
    style: 'pixel_art' | '2d_flat';
    aspectRatio: string;
    viewpoint: string;
    colors?: string[];
    dimensions?: string;
    quantity: number;
}

function buildPrompt(params: GenerationParams): string {
    const { prompt, type, style, viewpoint, colors, dimensions, aspectRatio } = params;
    
    let fullPrompt = '';
    
    if (style === 'pixel_art') {
        fullPrompt += 'Create a pixel art style image. Use clear pixel boundaries, limited color palette, and retro game aesthetic. ';
    } else {
        fullPrompt += 'Create a 2D flat style image with clean lines, solid colors, and modern vector-like appearance. ';
    }
    
    if (type === 'sprite') {
        fullPrompt += 'This is a game sprite character or object that should be suitable for use in a 2D video game. ';
        fullPrompt += 'The sprite should have a transparent or solid color background that can be easily removed. ';
    } else {
        fullPrompt += 'This is a game scene or background environment for a 2D video game. ';
    }
    
    const viewpointDescriptions: Record<string, string> = {
        'front': 'Show from a front-facing view. ',
        'back': 'Show from behind/back view. ',
        'side': 'Show from a side profile view. ',
        'top_down': 'Show from a top-down/bird\'s eye view. ',
        'isometric': 'Show in isometric perspective (45-degree angle). ',
    };
    fullPrompt += viewpointDescriptions[viewpoint] || '';
    
    const { width, height } = getImageDimensions(aspectRatio);
    fullPrompt += `The image should be ${width}x${height} pixels (${aspectRatio} aspect ratio). `;
    
    if (colors && colors.length > 0) {
        fullPrompt += `Use these colors prominently in the design: ${colors.join(', ')}. `;
    }
    
    if (dimensions && type === 'sprite') {
        fullPrompt += `The sprite should be designed to look good at ${dimensions} pixel dimensions. `;
    }
    
    fullPrompt += prompt;
    fullPrompt += ' High quality, detailed, game-ready asset.';
    
    return fullPrompt;
}

interface AnimationParams {
    characterImage: string;
    viewType: 'side' | 'isometric' | 'top_down';
    direction: string;
    animationType: string;
    frameDescriptions: string[];
}

function buildAnimationFramePrompt(params: AnimationParams, frameIndex: number, totalFrames: number): string {
    const { viewType, direction, animationType, frameDescriptions } = params;
    
    let fullPrompt = '';
    
    fullPrompt += 'You are given a reference image of a game character sprite. ';
    fullPrompt += 'Generate a new frame showing this EXACT same character in a different pose for animation. ';
    fullPrompt += 'CRITICAL: The character must look IDENTICAL - same art style, same colors, same outfit, same proportions. ';
    fullPrompt += 'Only the pose/position changes. ';
    
    fullPrompt += `\n\nThis is frame ${frameIndex + 1} of ${totalFrames} for a "${animationType}" animation sequence. `;
    
    const viewDescriptions: Record<string, string> = {
        'side': 'Maintain the side-scrolling 2D view. ',
        'isometric': 'Maintain the isometric 45-degree angle view. ',
        'top_down': 'Maintain the top-down bird\'s eye view. ',
    };
    fullPrompt += viewDescriptions[viewType] || viewDescriptions['isometric'];
    
    const directionDescriptions: Record<string, string> = {
        'right': 'Character should be facing right. ',
        'left': 'Character should be facing left. ',
        'up': 'Character should be facing up/away. ',
        'down': 'Character should be facing down/toward viewer. ',
        'up_right': 'Character should be facing diagonally up-right. ',
        'up_left': 'Character should be facing diagonally up-left. ',
        'down_right': 'Character should be facing diagonally down-right. ',
        'down_left': 'Character should be facing diagonally down-left. ',
    };
    fullPrompt += directionDescriptions[direction] || directionDescriptions['right'];
    
    if (frameDescriptions[frameIndex]) {
        fullPrompt += `\n\nPOSE FOR THIS FRAME: ${frameDescriptions[frameIndex]}. `;
    }
    
    fullPrompt += '\n\nIMPORTANT: Keep EXACT same character design, colors, art style. Single character, centered, transparent background. ';
    
    return fullPrompt;
}
