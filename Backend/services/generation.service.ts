/**
 * Generation Service
 * Handles AI image generation using Replicate API (primary) or Gemini API (fallback)
 */

import { put } from '@vercel/blob';

interface GenerationParams {
    prompt: string;
    type: 'sprite' | 'scene';
    style: 'pixel_art' | '2d_flat';
    aspectRatio: string;
    viewpoint: string;
    colors?: string[];
    dimensions?: string;
    quantity: number;
    referenceImage?: string;
    poseImage?: string;
}

interface GenerationResult {
    success: boolean;
    images: string[];
    error?: string;
    provider?: 'replicate' | 'gemini';
}

interface GenerationOptions {
    apiKey?: string;           // User's own API key (BYOK)
    provider?: 'replicate' | 'gemini';  // Which provider to use
    useOwnKey?: boolean;       // Whether user is using their own key
}

// Map aspect ratio to actual dimensions
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

// Build the generation prompt based on parameters
function buildPrompt(params: GenerationParams): string {
    const { prompt, type, style, viewpoint, colors, dimensions, aspectRatio } = params;
    
    let fullPrompt = '';
    
    // Style prefix
    if (style === 'pixel_art') {
        fullPrompt += 'Create a pixel art style image. Use clear pixel boundaries, limited color palette, and retro game aesthetic. ';
    } else {
        fullPrompt += 'Create a 2D flat style image with clean lines, solid colors, and modern vector-like appearance. ';
    }
    
    // Type context
    if (type === 'sprite') {
        fullPrompt += 'This is a game sprite character or object that should be suitable for use in a 2D video game. ';
        fullPrompt += 'The sprite should have a transparent or solid color background that can be easily removed. ';
    } else {
        fullPrompt += 'This is a game scene or background environment for a 2D video game. ';
    }
    
    // Viewpoint
    const viewpointDescriptions: Record<string, string> = {
        'front': 'Show from a front-facing view. ',
        'back': 'Show from behind/back view. ',
        'side': 'Show from a side profile view. ',
        'top_down': 'Show from a top-down/bird\'s eye view. ',
        'isometric': 'Show in isometric perspective (45-degree angle). ',
    };
    fullPrompt += viewpointDescriptions[viewpoint] || '';
    
    // Aspect ratio context
    const { width, height } = getImageDimensions(aspectRatio);
    fullPrompt += `The image should be ${width}x${height} pixels (${aspectRatio} aspect ratio). `;
    
    // Colors
    if (colors && colors.length > 0) {
        fullPrompt += `Use these colors prominently in the design: ${colors.join(', ')}. `;
    }
    
    // Dimensions hint for sprite size
    if (dimensions && type === 'sprite') {
        fullPrompt += `The sprite should be designed to look good at ${dimensions} pixel dimensions. `;
    }
    
    // User prompt
    fullPrompt += prompt;
    
    // Quality suffix
    fullPrompt += ' High quality, detailed, game-ready asset.';
    
    return fullPrompt;
}

// ============================================
// REPLICATE API GENERATION
// ============================================

interface ReplicatePrediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed';
    output?: string | string[];
    error?: string;
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                inlineData?: {
                    mimeType: string;
                    data: string;
                };
            }>;
        };
    }>;
}

async function generateWithReplicate(
    params: GenerationParams,
    apiToken: string,
    modelId?: string
): Promise<GenerationResult> {
    try {
        const fullPrompt = buildPrompt(params);
        const images: string[] = [];
        const { width, height } = getImageDimensions(params.aspectRatio);
        
        // Use custom model or default Replicate model
        const model = modelId || process.env.REPLICATE_MODEL_ID || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
        
        console.log(`Using Replicate model: ${model}`);
        
        for (let i = 0; i < params.quantity; i++) {
            const variationPrompt = i > 0 ? `${fullPrompt} Variation ${i + 1}.` : fullPrompt;
            
            // Create prediction
            const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: model.includes(':') ? model.split(':')[1] : model,
                    input: {
                        prompt: variationPrompt,
                        width,
                        height,
                        num_outputs: 1,
                        ...(params.referenceImage && { image: params.referenceImage }),
                    }
                })
            });

            if (!createResponse.ok) {
                const error = await createResponse.json().catch(() => ({}));
                throw new Error(`Replicate API error: ${createResponse.status} - ${JSON.stringify(error)}`);
            }

            const prediction = await createResponse.json() as ReplicatePrediction;
            
            // Poll for completion
            let result: ReplicatePrediction = prediction;
            while (result.status !== 'succeeded' && result.status !== 'failed') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
                    headers: { 'Authorization': `Token ${apiToken}` }
                });
                result = await pollResponse.json() as ReplicatePrediction;
            }

            if (result.status === 'failed') {
                throw new Error(result.error || 'Replicate generation failed');
            }

            // Get output image URL
            if (result.output) {
                const outputArray = Array.isArray(result.output) ? result.output : [result.output];
                if (outputArray.length > 0) {
                    const imageUrl = outputArray[0];
                    
                    // Fetch and convert to base64 data URL
                    const imageResponse = await fetch(imageUrl);
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const base64 = Buffer.from(imageBuffer).toString('base64');
                    const mimeType = imageResponse.headers.get('content-type') || 'image/png';
                    images.push(`data:${mimeType};base64,${base64}`);
                }
            }
        }

        if (images.length === 0) {
            throw new Error('No images generated');
        }

        return { success: true, images, provider: 'replicate' };
    } catch (error: any) {
        console.error('Replicate generation error:', error);
        return { success: false, images: [], error: error.message, provider: 'replicate' };
    }
}

// ============================================
// GEMINI API GENERATION (Fallback/Legacy)
// ============================================

async function generateWithGemini(
    params: GenerationParams,
    apiKey: string
): Promise<GenerationResult> {
    try {
        const fullPrompt = buildPrompt(params);
        const images: string[] = [];
        
        const buildParts = (variationText: string) => {
            const parts: any[] = [{ text: fullPrompt + variationText }];
            
            if (params.referenceImage && params.referenceImage.startsWith('data:')) {
                const base64Match = params.referenceImage.match(/data:([^;]+);base64,(.+)/);
                if (base64Match) {
                    parts.push({
                        inlineData: { mimeType: base64Match[1], data: base64Match[2] }
                    });
                }
            }
            
            if (params.poseImage && params.poseImage.startsWith('data:')) {
                const base64Match = params.poseImage.match(/data:([^;]+);base64,(.+)/);
                if (base64Match) {
                    parts.push({
                        inlineData: { mimeType: base64Match[1], data: base64Match[2] }
                    });
                }
            }
            
            return parts;
        };
        
        for (let i = 0; i < params.quantity; i++) {
            const variationText = i > 0 ? ` Variation ${i + 1}, slightly different from previous versions.` : '';
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: buildParts(variationText) }],
                        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json() as GeminiResponse;
            
            if (data.candidates && data.candidates[0]?.content?.parts) {
                for (const part of data.candidates[0].content.parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                        break;
                    }
                }
            }
        }

        if (images.length === 0) {
            throw new Error('No images generated');
        }

        return { success: true, images, provider: 'gemini' };
    } catch (error: any) {
        console.error('Gemini generation error:', error);
        return { success: false, images: [], error: error.message, provider: 'gemini' };
    }
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

export async function generateImages(
    params: GenerationParams,
    options: GenerationOptions = {}
): Promise<GenerationResult> {
    const { apiKey, provider, useOwnKey } = options;
    
    // Determine which provider and key to use
    if (useOwnKey && apiKey) {
        // User is using their own key
        if (provider === 'gemini') {
            console.log('Using user\'s Gemini API key');
            return generateWithGemini(params, apiKey);
        } else {
            // Default to Replicate for BYOK
            console.log('Using user\'s Replicate API key');
            return generateWithReplicate(params, apiKey);
        }
    }
    
    // Use platform's default: Replicate with your model
    const platformReplicateToken = process.env.REPLICATE_API_TOKEN;
    if (platformReplicateToken) {
        console.log('Using platform Replicate model');
        return generateWithReplicate(params, platformReplicateToken, process.env.REPLICATE_MODEL_ID);
    }
    
    // Fallback to Gemini if Replicate not configured
    const platformGeminiKey = process.env.GEMINI_API_KEY;
    if (platformGeminiKey && platformGeminiKey !== 'your_gemini_api_key_here') {
        console.log('Falling back to platform Gemini API');
        return generateWithGemini(params, platformGeminiKey);
    }
    
    return {
        success: false,
        images: [],
        error: 'No API key configured. Please add your own API key in settings or contact support.'
    };
}

// Upload generated image to blob storage
export async function uploadGeneratedImage(
    dataUrl: string, 
    userId: string, 
    type: 'sprite' | 'scene'
): Promise<string> {
    const base64Data = dataUrl.split(',')[1];
    const mimeMatch = dataUrl.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${type}s/${userId}/${timestamp}-${random}.${extension}`;
    
    const blob = await put(filename, base64Data, {
        access: 'public',
        contentType: mimeType,
    });
    
    return blob.url;
}

// ============================================
// ANIMATION GENERATION
// ============================================

interface AnimationGenerationParams {
    characterImage: string;
    viewType: 'side' | 'isometric' | 'top_down';
    direction: string;
    animationType: string;
    frameDescriptions: string[];
}

interface AnimationGenerationResult {
    success: boolean;
    frames: string[];
    error?: string;
    provider?: 'replicate' | 'gemini';
}

function buildAnimationFramePrompt(
    params: AnimationGenerationParams,
    frameIndex: number,
    totalFrames: number
): string {
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

async function generateAnimationWithReplicate(
    params: AnimationGenerationParams,
    apiToken: string,
    modelId?: string
): Promise<AnimationGenerationResult> {
    try {
        const frames: string[] = [];
        const totalFrames = params.frameDescriptions.length;
        const model = modelId || process.env.REPLICATE_MODEL_ID;
        
        for (let i = 0; i < totalFrames; i++) {
            const framePrompt = buildAnimationFramePrompt(params, i, totalFrames);
            console.log(`Generating frame ${i + 1}/${totalFrames} with Replicate...`);
            
            const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: model?.includes(':') ? model.split(':')[1] : model,
                    input: {
                        prompt: framePrompt,
                        image: params.characterImage,
                        width: 512,
                        height: 512,
                    }
                })
            });

            if (!createResponse.ok) {
                throw new Error(`Replicate API error: ${createResponse.status}`);
            }

            let result = await createResponse.json() as ReplicatePrediction;
            
            while (result.status !== 'succeeded' && result.status !== 'failed') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
                    headers: { 'Authorization': `Token ${apiToken}` }
                });
                result = await pollResponse.json() as ReplicatePrediction;
            }

            if (result.status === 'failed') {
                throw new Error(`Frame ${i + 1} generation failed`);
            }

            if (result.output) {
                const outputArray = Array.isArray(result.output) ? result.output : [result.output];
                if (outputArray.length > 0) {
                    const imageUrl = outputArray[0];
                    const imageResponse = await fetch(imageUrl);
                    const imageBuffer = await imageResponse.arrayBuffer();
                    const base64 = Buffer.from(imageBuffer).toString('base64');
                    frames.push(`data:image/png;base64,${base64}`);
                }
            }
        }

        return { success: true, frames, provider: 'replicate' };
    } catch (error: any) {
        console.error('Replicate animation error:', error);
        return { success: false, frames: [], error: error.message, provider: 'replicate' };
    }
}

async function generateAnimationWithGemini(
    params: AnimationGenerationParams,
    apiKey: string
): Promise<AnimationGenerationResult> {
    try {
        const frames: string[] = [];
        const totalFrames = params.frameDescriptions.length;
        
        let characterImageData: { mimeType: string; data: string } | null = null;
        if (params.characterImage && params.characterImage.startsWith('data:')) {
            const base64Match = params.characterImage.match(/data:([^;]+);base64,(.+)/);
            if (base64Match) {
                characterImageData = { mimeType: base64Match[1], data: base64Match[2] };
            }
        }
        
        if (!characterImageData) {
            throw new Error('Invalid character image format');
        }
        
        for (let i = 0; i < totalFrames; i++) {
            const framePrompt = buildAnimationFramePrompt(params, i, totalFrames);
            console.log(`Generating frame ${i + 1}/${totalFrames} with Gemini...`);
            
            const parts: any[] = [
                { text: framePrompt },
                { inlineData: { mimeType: characterImageData.mimeType, data: characterImageData.data } }
            ];
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to generate frame ${i + 1}: ${response.status}`);
            }

            const data = await response.json() as GeminiResponse;
            
            let frameImage: string | null = null;
            if (data.candidates && data.candidates[0]?.content?.parts) {
                for (const part of data.candidates[0].content.parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        frameImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }
            
            if (!frameImage) {
                throw new Error(`No image generated for frame ${i + 1}`);
            }
            
            frames.push(frameImage);
        }

        return { success: true, frames, provider: 'gemini' };
    } catch (error: any) {
        console.error('Gemini animation error:', error);
        return { success: false, frames: [], error: error.message, provider: 'gemini' };
    }
}

export async function generateAnimationFrames(
    params: AnimationGenerationParams,
    options: GenerationOptions = {}
): Promise<AnimationGenerationResult> {
    const { apiKey, provider, useOwnKey } = options;
    
    console.log(`Generating ${params.frameDescriptions.length} animation frames...`);
    console.log(`View: ${params.viewType}, Direction: ${params.direction}, Type: ${params.animationType}`);
    
    if (useOwnKey && apiKey) {
        if (provider === 'gemini') {
            return generateAnimationWithGemini(params, apiKey);
        } else {
            return generateAnimationWithReplicate(params, apiKey);
        }
    }
    
    // Platform default: Replicate
    const platformReplicateToken = process.env.REPLICATE_API_TOKEN;
    if (platformReplicateToken) {
        return generateAnimationWithReplicate(params, platformReplicateToken, process.env.REPLICATE_MODEL_ID);
    }
    
    // Fallback to Gemini
    const platformGeminiKey = process.env.GEMINI_API_KEY;
    if (platformGeminiKey && platformGeminiKey !== 'your_gemini_api_key_here') {
        return generateAnimationWithGemini(params, platformGeminiKey);
    }
    
    return {
        success: false,
        frames: [],
        error: 'No API key configured. Please add your own API key in settings.'
    };
}
