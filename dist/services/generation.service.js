"use strict";
/**
 * Generation Service
 * Handles AI image generation using Replicate API (primary) or Gemini API (fallback)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImages = generateImages;
exports.uploadGeneratedImage = uploadGeneratedImage;
exports.generateAnimationFrames = generateAnimationFrames;
// Map aspect ratio to actual dimensions
function getImageDimensions(aspectRatio) {
    const ratioMap = {
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
function buildPrompt(params) {
    const { prompt, type, style, viewpoint, colors, dimensions, aspectRatio, spriteType, sceneType } = params;
    let fullPrompt = '';
    // Style prefix
    if (style === 'pixel_art') {
        fullPrompt += 'Create a pixel art style image. Use clear pixel boundaries, limited color palette, and retro game aesthetic. ';
    }
    else {
        fullPrompt += 'Create a 2D flat style image with clean lines, solid colors, and modern vector-like appearance. ';
    }
    // Type context
    if (type === 'sprite') {
        const entityType = spriteType === 'object' ? 'object/item' : 'character';
        fullPrompt += `This is a game sprite ${entityType} that should be suitable for use in a 2D video game. `;
        fullPrompt += 'The sprite should have a transparent or solid color background that can be easily removed. ';
    }
    else {
        const envType = sceneType === 'indoor' ? 'indoor' : 'outdoor';
        fullPrompt += `This is an ${envType} game scene or background environment for a 2D video game. `;
    }
    // Viewpoint
    const viewpointDescriptions = {
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
// Helper to handle Replicate API calls and polling
async function callReplicate(apiToken, model, input) {
    // start prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version: model.includes(':') ? model.split(':')[1] : undefined, // sending version if it has one, or model if using simple name path in url?
            // Actually Replicate generic API usually takes version in body for community models, or uses model path in URL for official ones.
            // For now let's stick to the existing pattern but support full model names in input if needed.
            // A safer way for "google/gemini-2.5-flash" type models is actually using the `models/{owner}/{name}/predictions` endpoint if possible OR just `predictions` with version.
            // However, the provided IDs are "google/gemini-2.5-flash" and "qwen/qwen-image-edit-plus". These are likely model paths.
            // Replicate API v1 allows POST to /models/{owner}/{name}/predictions.
            // Let's deduce the endpoint from the model string.
            input,
        })
    });
    // WAIT! The standard /predictions endpoint REQUIRES a version for community models.
    // If we only have "google/gemini-2.5-flash", we might strictly need the model version hash OR use the model-specific endpoint.
    // Let's try using the model-specific endpoint: https://api.replicate.com/v1/models/{model_owner}/{model_name}/predictions
    let url = 'https://api.replicate.com/v1/predictions';
    let body = { input };
    if (model.includes('/')) {
        // Assume Owner/Name format, use specific endpoint which auto-resolves latest version
        url = `https://api.replicate.com/v1/models/${model}/predictions`;
    }
    else if (model.includes(':')) {
        // Assume has version hash
        body.version = model.split(':')[1];
    }
    else {
        // Fallback or error? Let's assume it's a version hash if no slash
        body.version = model;
    }
    const startForRealResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'wait', // Ask Replicate to wait a bit (optional but good for fast models)
        },
        body: JSON.stringify(body)
    });
    if (!startForRealResponse.ok) {
        const error = await startForRealResponse.json().catch(() => ({}));
        throw new Error(`Replicate API error: ${startForRealResponse.status} - ${JSON.stringify(error)}`);
    }
    console.log("Replicate prediction started:", model);
    let prediction = await startForRealResponse.json();
    // poll
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pollResponse = await fetch(prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${apiToken}` }
        });
        prediction = await pollResponse.json();
    }
    if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'Replicate generation failed');
    }
    return prediction.output;
}
// Intelligence Layer: Gemini 2.5 Flash on Replicate
async function refinePromptWithIntelligence(userPrompt, context, apiToken) {
    console.log("Calling Intelligence Layer (Gemini 2.5 Flash)...");
    const systemInstruction = `You are an expert prompt engineer for game asset generation (sprites and scenes).
    Your task is to take a user's request and transform it into a highly detailed, technical prompt optimized for an image generation model (like Stable Diffusion or Flux).
    
    Context:
    Context:
    - Type: ${context.type}
    - SubType: ${context.type === 'sprite' ? (context.spriteType || 'character') : (context.sceneType || 'environment')}
    - Style: ${context.style}
    - Viewpoint: ${context.viewpoint}
    - Aspect Ratio: ${context.aspectRatio}
    
    Output ONLY the raw prompt string. No explanations, no markdown.`;
    const input = {
        prompt: `Create a detailed image generation prompt for: "${userPrompt}". Include specific details about lighting, texture, perspective, and style (` + (context.style === 'pixel_art' ? 'Pixel Art, retro, sharp edges' : 'Vector, flat, clean') + `).`,
        system_instruction: systemInstruction,
        max_output_tokens: 1024,
        temperature: 0.7,
        top_p: 0.95
    };
    try {
        const output = await callReplicate(apiToken, 'google/gemini-2.5-flash', input);
        // Gemini on Replicate likely returns an array of strings or a single string
        const result = Array.isArray(output) ? output.join('') : output;
        console.log("Intelligence Layer Output:", result);
        return result || userPrompt;
    }
    catch (e) {
        console.error("Intelligence Layer failed, falling back to raw prompt:", e);
        return buildPrompt(context); // Fallback to our internal builder
    }
}
// Pose-based Generation: Qwen Image Edit Plus
async function generateWithQwen(refinedPrompt, poseImage, context, apiToken) {
    console.log("Calling Qwen Image Edit Plus for Pose Generation...");
    // Qwen expects an input image. If it's pose-guided, we pass the pose as 'image'.
    // Note: Qwen is an EDIT model, so it transforms the input based on prompt. 
    // Ideally we'd use a ControlNet for structural guidance, but user specified Qwen Edit.
    // "Formulate a prompt for QwenEdit that it generate pixelated sprites... not realistic images"
    const input = {
        prompt: refinedPrompt, // The intelligence layer prompt
        image: poseImage, // The pose/reference
        aspect_ratio: "match_input_image", // Or map context.aspectRatio
        output_format: "webp",
        output_quality: 95,
        go_fast: true,
        disable_safety_checker: true
    };
    const output = await callReplicate(apiToken, 'qwen/qwen-image-edit-plus', input);
    // Output is usually an array of URIs
    return Array.isArray(output) ? output : [output];
}
async function generateWithReplicate(params, apiToken, modelId) {
    try {
        let finalPrompt = params.prompt;
        // 1. Intelligence Layer
        // We always use intelligence layer to refine/build the prompt unless skipped
        // But for now let's assume we use it.
        finalPrompt = await refinePromptWithIntelligence(params.prompt, params, apiToken);
        // 2. Generation
        const images = [];
        if (params.poseImage) {
            // POSE DETECTED -> Use Qwen
            const qwenOutputs = await generateWithQwen(finalPrompt, params.poseImage, params, apiToken);
            // fetch images
            for (const url of qwenOutputs) {
                const imageResponse = await fetch(url);
                const buffer = await imageResponse.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const mime = imageResponse.headers.get('content-type') || 'image/webp';
                images.push(`data:${mime};base64,${base64}`);
            }
        }
        else {
            // STANDARD GENERATION -> Retro Diffusion (rd-plus)
            const model = 'retro-diffusion/rd-plus';
            console.log(`Using Standard Model: ${model}`);
            // Parse dimensions
            let width = 128;
            let height = 128;
            if (params.dimensions) {
                const [w, h] = params.dimensions.split('x').map(Number);
                if (!isNaN(w) && !isNaN(h)) {
                    width = w;
                    height = h;
                }
            }
            else if (params.aspectRatio) {
                const dims = getImageDimensions(params.aspectRatio);
                let maxDim = Math.max(dims.width, dims.height);
                if (maxDim > 384)
                    maxDim = 384;
                const scale = 384 / Math.max(dims.width, dims.height);
                width = Math.round(dims.width * scale);
                height = Math.round(dims.height * scale);
            }
            const input = {
                prompt: finalPrompt,
                width,
                height,
                num_images: params.quantity, // Model supports up to 10
                style: params.style || 'default',
                remove_bg: params.removeBg || false,
                tile_x: params.tileX || false,
                tile_y: params.tileY || false,
                ...(params.referenceImage && { input_image: params.referenceImage })
            };
            const output = await callReplicate(apiToken, model, input);
            const outputArray = Array.isArray(output) ? output : [output];
            for (const url of outputArray) {
                const imageResponse = await fetch(url);
                const buffer = await imageResponse.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const mime = imageResponse.headers.get('content-type') || 'image/png';
                images.push(`data:${mime};base64,${base64}`);
            }
        }
        if (images.length === 0) {
            throw new Error('No images generated');
        }
        return { success: true, images, provider: 'replicate' };
    }
    catch (error) {
        console.error('Replicate generation error:', error);
        return { success: false, images: [], error: error.message, provider: 'replicate' };
    }
}
// ============================================
// GEMINI API GENERATION (Fallback/Legacy)
// ============================================
async function generateWithGemini(params, apiKey) {
    try {
        const fullPrompt = buildPrompt(params);
        const images = [];
        const buildParts = (variationText) => {
            const parts = [{ text: fullPrompt + variationText }];
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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: buildParts(variationText) }],
                    generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
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
    }
    catch (error) {
        console.error('Gemini generation error:', error);
        return { success: false, images: [], error: error.message, provider: 'gemini' };
    }
}
// ============================================
// MAIN GENERATION FUNCTION
// ============================================
async function generateImages(params, options = {}) {
    const { apiKey, provider, useOwnKey } = options;
    // Determine which provider and key to use
    if (useOwnKey && apiKey) {
        // User is using their own key
        if (provider === 'gemini') {
            console.log('Using user\'s Gemini API key');
            return generateWithGemini(params, apiKey);
        }
        else {
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
// Upload generated image to Firebase Storage
async function uploadGeneratedImage(dataUrl, userId, type) {
    // 1. Parse base64
    const base64Data = dataUrl.split(',')[1];
    const mimeMatch = dataUrl.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    // 2. Generate filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${type}s/${userId}/${timestamp}-${random}.${extension}`;
    // 3. Upload to Firebase Storage
    // Dynamic import to avoid circular dependency issues if any
    const { getStorageBucket } = require('../lib/db');
    const bucket = getStorageBucket();
    const file = bucket.file(filename);
    const buffer = Buffer.from(base64Data, 'base64');
    await file.save(buffer, {
        metadata: {
            contentType: mimeType,
        },
        public: true, // Make public for easy access
    });
    // 4. Get public URL
    // For default bucket: https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
    // Or check if a custom domain is configured.
    // getSignedUrl is safer but expires. public() makes it public.
    // file.publicUrl() might be available in newer SDKs, or we construct it.
    // Construct public URL
    // Cloud Storage: https://storage.googleapis.com/<bucket>/<path>
    // Firebase defaults often use: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path_encoded>?alt=media
    // But `file.save({ public: true })` usually allows direct access via `storage.googleapis.com` if ACLs permit.
    // Let's use `file.publicUrl()` if available or construct standard GCS URL.
    return file.publicUrl();
}
function buildAnimationFramePrompt(params, frameIndex, totalFrames) {
    const { viewType, direction, animationType, frameDescriptions } = params;
    let fullPrompt = '';
    fullPrompt += 'You are given a reference image of a game character sprite. ';
    fullPrompt += 'Generate a new frame showing this EXACT same character in a different pose for animation. ';
    fullPrompt += 'CRITICAL: The character must look IDENTICAL - same art style, same colors, same outfit, same proportions. ';
    fullPrompt += 'Only the pose/position changes. ';
    fullPrompt += `\n\nThis is frame ${frameIndex + 1} of ${totalFrames} for a "${animationType}" animation sequence. `;
    const viewDescriptions = {
        'side': 'Maintain the side-scrolling 2D view. ',
        'isometric': 'Maintain the isometric 45-degree angle view. ',
        'top_down': 'Maintain the top-down bird\'s eye view. ',
    };
    fullPrompt += viewDescriptions[viewType] || viewDescriptions['isometric'];
    const directionDescriptions = {
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
async function generateAnimationWithReplicate(params, apiToken, modelId) {
    try {
        const frames = [];
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
            let result = await createResponse.json();
            while (result.status !== 'succeeded' && result.status !== 'failed') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
                    headers: { 'Authorization': `Token ${apiToken}` }
                });
                result = await pollResponse.json();
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
    }
    catch (error) {
        console.error('Replicate animation error:', error);
        return { success: false, frames: [], error: error.message, provider: 'replicate' };
    }
}
async function generateAnimationWithGemini(params, apiKey) {
    try {
        const frames = [];
        const totalFrames = params.frameDescriptions.length;
        let characterImageData = null;
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
            const parts = [
                { text: framePrompt },
                { inlineData: { mimeType: characterImageData.mimeType, data: characterImageData.data } }
            ];
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to generate frame ${i + 1}: ${response.status}`);
            }
            const data = await response.json();
            let frameImage = null;
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
    }
    catch (error) {
        console.error('Gemini animation error:', error);
        return { success: false, frames: [], error: error.message, provider: 'gemini' };
    }
}
async function generateAnimationFrames(params, options = {}) {
    const { apiKey, provider, useOwnKey } = options;
    console.log(`Generating ${params.frameDescriptions.length} animation frames...`);
    console.log(`View: ${params.viewType}, Direction: ${params.direction}, Type: ${params.animationType}`);
    if (useOwnKey && apiKey) {
        if (provider === 'gemini') {
            return generateAnimationWithGemini(params, apiKey);
        }
        else {
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
