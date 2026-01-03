# PIXELAR: AI-Powered 2D Game Asset Generation Platform
## Project Documentation

---

# Chapter 1: Introduction

## 1.1 Overview

Pixelar is an innovative web-based application designed to revolutionize the creation of 2D game assets through artificial intelligence. The platform provides game developers, indie studios, and pixel artists with powerful AI-driven tools to generate high-quality sprites, scenes, and animations suitable for integration with popular game engines including Unity, Godot, and Unreal Engine.

The application leverages modern web technologies combined with state-of-the-art AI image generation models to deliver a seamless creative experience. Built on a robust architecture featuring Next.js for the frontend and Express.js for the backend, Pixelar offers real-time asset generation, project management capabilities, and comprehensive export options tailored for game development workflows.

The core functionality centers around three primary asset generation modules: Sprite Generation for creating character sprites and game objects, Scene Generation for producing background environments and game worlds, and Animation Generation for creating frame-by-frame character animations. Each module incorporates customizable parameters including art style selection, viewpoint configuration, color palette management, and aspect ratio control.

Pixelar addresses a significant gap in the game development toolchain by democratizing access to professional-quality game art. Traditional game asset creation requires extensive artistic skills and considerable time investment. Through AI-powered generation, Pixelar enables developers to rapidly prototype and produce game-ready assets, significantly reducing development cycles and lowering barriers to entry for independent game creators.

The platform implements a credit-based monetization system supporting multiple subscription tiers (Free, Pro, Enterprise), with an innovative Bring Your Own Key (BYOK) feature allowing users to utilize their personal API keys for AI generation services. This flexibility ensures accessibility for hobbyists while providing scalable solutions for professional studios.


## 1.2 Project Motivation

The video game industry has experienced unprecedented growth, with the global market valued at over $200 billion and continuing to expand. Within this landscape, 2D games maintain significant relevance, particularly in the indie game sector, mobile gaming, and retro-style productions. However, a persistent challenge facing game developers is the creation of visual assets, which traditionally requires either substantial artistic expertise or significant financial investment in professional artists.

Several key factors motivated the development of Pixelar:

The democratization of game development tools has created a paradox where programming and game engine access have become increasingly accessible, yet visual asset creation remains a significant bottleneck. Engines like Unity and Godot provide free tiers, and numerous tutorials enable aspiring developers to learn game programming. However, creating professional-quality sprites, backgrounds, and animations still requires years of artistic training or expensive outsourcing.

The emergence of generative AI technologies, particularly diffusion models and large language models, has opened new possibilities for automated content creation. Models such as Stable Diffusion and various proprietary APIs have demonstrated remarkable capabilities in generating images from text descriptions. Pixelar harnesses these technologies specifically for game asset creation, optimizing prompts and workflows for pixel art and 2D game aesthetics.

The indie game development community represents a substantial and underserved market. Independent developers often work with limited budgets and small teams, making professional art assets financially prohibitive. Pixelar addresses this need by providing affordable, AI-generated alternatives that maintain quality standards suitable for commercial releases.

Time-to-market pressures in game development necessitate rapid prototyping capabilities. Even studios with dedicated art teams benefit from tools that can quickly generate placeholder assets or explore visual concepts before committing to full production. Pixelar serves both as a production tool and a rapid prototyping solution.

The growing acceptance of AI-generated content in creative industries signals a shift in how digital assets are produced. Rather than replacing human artists, AI tools increasingly serve as force multipliers, enabling artists to work more efficiently and explore creative directions that would otherwise be impractical.

## 1.3 Project Vision

Pixelar envisions becoming the premier platform for AI-assisted 2D game asset creation, establishing a new paradigm in game development workflows. The project aims to:

Empower creators of all skill levels to produce professional-quality game assets without requiring traditional artistic training. By abstracting the complexity of AI image generation behind an intuitive interface, Pixelar makes advanced technology accessible to beginners while providing depth for experienced users.

Establish industry-standard workflows for AI-generated game assets, including optimized export formats, sprite sheet generation, and animation frame management. The platform seeks to integrate seamlessly with existing game development pipelines rather than requiring developers to adapt their workflows.

Foster a community of game developers who leverage AI tools responsibly and creatively. Pixelar promotes ethical AI usage while encouraging innovation in how games are conceptualized and produced.

Continuously evolve with advancing AI technologies, incorporating new models and capabilities as they become available. The architecture is designed for extensibility, allowing integration of future AI services and generation techniques.

Support the broader game development ecosystem by providing tools that complement rather than compete with traditional asset creation methods. Pixelar positions itself as one tool among many in a developer's toolkit, suitable for specific use cases while acknowledging the continued importance of human artistry.


## 1.4 Scope

The scope of Pixelar encompasses the following functional domains:

**In Scope:**

1. AI-Powered Asset Generation
   - Sprite generation for characters and objects with customizable parameters
   - Scene/background generation for game environments
   - Animation frame generation with pose control and frame descriptions
   - Support for multiple art styles (Pixel Art, 2D Flat)
   - Multiple viewpoint options (Front, Back, Side, Top-Down, Isometric)

2. Project Management
   - User project creation and organization
   - Asset storage and retrieval
   - Project categorization (Sprite projects, Scene projects)
   - Thumbnail management and preview capabilities

3. User Management
   - Firebase-based authentication (Google Sign-In)
   - User profile management
   - Credit-based usage system
   - Multiple subscription tiers (Free, Pro, Enterprise)

4. Export and Integration
   - PNG image export for individual assets
   - Sprite sheet generation for animations
   - GIF export for animated content
   - Game engine-compatible formats

5. Utility Tools
   - Sprite sheet to GIF converter
   - Animation frame editor
   - 3D pose editor for character positioning
   - Color palette management

**Out of Scope:**

1. 3D asset generati

## 1.4 Scope

The scope of Pixelar encompasses the following functional domains:

**In Scope:**

1. AI-Powered Asset Generation: Sprite generation for characters and objects, scene/background generation, animation frame generation with pose control, support for multiple art styles (Pixel Art, 2D Flat), and multiple viewpoint options (Front, Back, Side, Top-Down, Isometric).

2. Project Management: User project creation and organization, asset storage and retrieval, project categorization, and thumbnail management.

3. User Management: Firebase-based authentication, user profile management, credit-based usage system, and multiple subscription tiers.

4. Export and Integration: PNG image export, sprite sheet generation, GIF export, and game engine-compatible formats.

5. Utility Tools: Sprite sheet to GIF converter, animation frame editor, pose editor, and color palette management.

**Out of Scope:**

1. 3D asset generation and modeling
2. Audio/sound effect generation
3. Game logic or code generation
4. Direct game engine plugins (assets are exported as standard formats)
5. Collaborative real-time editing
6. Mobile application development (web-only platform)

## 1.5 Problem Statement

Game developers, particularly independent creators and small studios, face significant challenges in producing high-quality 2D visual assets for their projects. The traditional approaches to obtaining game art present substantial barriers:

Hiring professional pixel artists or 2D artists requires significant financial investment, often ranging from hundreds to thousands of dollars per asset. For indie developers working with limited budgets, this cost can be prohibitive and may consume resources needed for other development aspects.

Learning traditional digital art skills requires years of dedicated practice. While many developers possess strong programming abilities, the artistic skills needed for professional game art represent a distinct discipline that cannot be quickly acquired.

Using pre-made asset packs, while cost-effective, results in games that lack visual uniqueness. Many indie games share identical or similar assets, diminishing their market differentiation and professional appearance.

AI image generation tools, while powerful, are not optimized for game asset creation. General-purpose AI art generators produce images that require significant post-processing to be suitable for game integration, lacking proper transparency, consistent styling, and appropriate dimensions.

The absence of integrated workflows means developers must navigate multiple tools and manual processes to convert AI-generated images into usable game assets, including background removal, sprite sheet creation, and animation frame organization.

These challenges collectively result in delayed development timelines, compromised visual quality, or abandoned projects when developers cannot overcome the art asset barrier.


## 1.6 Objectives

The primary objectives of the Pixelar project are:

**Primary Objectives:**

1. Develop an intuitive web-based platform that enables users to generate game-ready 2D assets using AI technology with minimal technical expertise required.

2. Implement robust AI integration supporting multiple generation providers (Replicate API, Google Gemini) with optimized prompting for game asset aesthetics.

3. Create comprehensive project management functionality allowing users to organize, store, and retrieve generated assets efficiently.

4. Design and implement a scalable credit-based monetization system supporting multiple user tiers while maintaining accessibility for hobbyist developers.

5. Provide specialized tools for animation creation including frame generation, sprite sheet compilation, and GIF export capabilities.

**Secondary Objectives:**

1. Ensure cross-platform compatibility through responsive web design accessible from desktop and tablet devices.

2. Implement secure authentication and data protection using industry-standard practices (Firebase Authentication, secure token handling).

3. Optimize application performance for responsive user experience during asset generation and preview operations.

4. Create extensible architecture allowing future integration of additional AI models and generation capabilities.

5. Develop comprehensive export options compatible with major game engines (Unity, Godot, Unreal Engine).

**Technical Objectives:**

1. Achieve sub-second response times for UI interactions and asset previews.
2. Maintain 99% uptime for core generation services.
3. Support concurrent users without degradation in service quality.
4. Implement efficient blob storage for user assets with appropriate retention policies.
5. Ensure secure handling of user API keys for BYOK functionality.

## 1.7 Tools

The following tools and technologies are utilized in the development and operation of Pixelar:

**Frontend Technologies:**
- Next.js 15: React-based framework for server-side rendering and static site generation
- React 19: JavaScript library for building user interfaces
- TypeScript: Typed superset of JavaScript for enhanced code quality
- Tailwind CSS: Utility-first CSS framework for styling
- Radix UI: Unstyled, accessible component primitives
- Three.js / React Three Fiber: 3D graphics library for pose editor functionality
- GIF.js: Client-side GIF encoding library
- Lucide React: Icon library for UI elements

**Backend Technologies:**
- Node.js: JavaScript runtime environment
- Express.js: Web application framework for API development
- TypeScript: Type-safe backend development
- Firebase Admin SDK: Server-side Firebase integration
- Zod: TypeScript-first schema validation

**Database and Storage:**
- Firebase Firestore: NoSQL document database for user data, projects, and assets
- Vercel Blob: Object storage for generated images and assets

**Authentication:**
- Firebase Authentication: User authentication with Google Sign-In support

**AI Generation Services:**
- Replicate API: Primary AI image generation service (Stability AI SDXL)
- Google Gemini API: Alternative/fallback generation provider

**Development Tools:**
- Jest: JavaScript testing framework
- ESLint: Code linting and style enforcement
- Git: Version control system

**Deployment:**
- Vercel: Frontend hosting and deployment
- Firebase Cloud Run: Backend API hosting


## 1.8 Glossary

| Term | Definition |
|------|------------|
| AI Generation | The process of creating images using artificial intelligence models based on text prompts and parameters |
| Animation Frame | A single image in a sequence that, when played in succession, creates the illusion of movement |
| API Key | A unique identifier used to authenticate requests to external services |
| Aspect Ratio | The proportional relationship between an image's width and height (e.g., 1:1, 16:9) |
| Asset | Any digital resource used in game development, including sprites, backgrounds, and animations |
| BYOK | Bring Your Own Key - feature allowing users to use personal API keys for AI services |
| Credit | Virtual currency unit used to track and limit AI generation usage |
| Diffusion Model | A type of AI model that generates images by iteratively denoising random noise |
| Firebase | Google's platform providing authentication, database, and hosting services |
| Firestore | Firebase's NoSQL document database service |
| Frame Description | Text describing the pose and action for a specific animation frame |
| GIF | Graphics Interchange Format - animated image format supporting multiple frames |
| Isometric View | A method of visual representation showing 3D objects in 2D at a 45-degree angle |
| JWT | JSON Web Token - secure method for transmitting authentication information |
| Pixel Art | Digital art style characterized by visible pixels and limited color palettes |
| Pose | The position and orientation of a character's body parts in a single frame |
| Prompt | Text description provided to AI models to guide image generation |
| Replicate | Cloud platform for running machine learning models via API |
| Scene | A background or environment image for use in games |
| Sprite | A 2D image or animation integrated into a game, typically representing characters or objects |
| Sprite Sheet | A single image containing multiple animation frames arranged in a grid |
| Token | Authentication credential used to verify user identity in API requests |
| Vercel Blob | Object storage service for hosting files and assets |
| Viewpoint | The camera angle or perspective from which an asset is rendered |

---

# Chapter 2: Background Study

## 2.1 Introduction to Background Research

The development of Pixelar is informed by extensive research into existing solutions, academic literature, and industry practices in the domains of AI-powered content generation, game asset creation tools, and web application development. This chapter presents a comprehensive analysis of relevant prior work, identifying both achievements and limitations that have shaped the design decisions for Pixelar.

The background study encompasses three primary areas: existing AI image generation platforms and their applicability to game development, traditional and modern game asset creation tools, and technical frameworks for building scalable web applications with AI integration.

## 2.2 AI Image Generation Technologies

The field of AI image generation has undergone rapid advancement since the introduction of Generative Adversarial Networks (GANs) by Goodfellow et al. in 2014. Subsequent developments have produced increasingly sophisticated models capable of generating high-quality images from text descriptions.

**Generative Adversarial Networks (GANs)**

GANs introduced the concept of adversarial training, where a generator network creates images while a discriminator network evaluates their authenticity. This approach produced significant improvements in image generation quality. Notable GAN variants include StyleGAN (Karras et al., 2019), which enabled fine-grained control over generated image attributes, and BigGAN (Brock et al., 2018), which demonstrated high-fidelity image generation at scale.

However, GANs presented limitations for practical applications: training instability, mode collapse (generating limited variety), and difficulty in controlling specific image attributes through text prompts. These limitations motivated research into alternative approaches.

**Diffusion Models**

Diffusion models, particularly Denoising Diffusion Probabilistic Models (DDPMs) introduced by Ho et al. (2020), represent the current state-of-the-art in image generation. These models learn to reverse a gradual noising process, generating images by iteratively denoising random noise.

The introduction of latent diffusion models by Rombach et al. (2022), implemented in Stable Diffusion, dramatically improved computational efficiency by operating in a compressed latent space rather than pixel space. This advancement enabled practical deployment of high-quality image generation on consumer hardware and cloud services.

Key advantages of diffusion models for Pixelar's use case include:
- Superior text-to-image alignment compared to GANs
- Stable training without mode collapse
- Ability to incorporate conditioning signals (text, images, poses)
- Active open-source development and model availability


**Commercial AI Generation Platforms**

Several commercial platforms have emerged offering AI image generation services:

1. DALL-E (OpenAI): Pioneered text-to-image generation with impressive results but operates as a closed system with limited customization options. Pricing models and usage restrictions limit applicability for high-volume game asset generation.

2. Midjourney: Gained popularity for artistic image generation with distinctive aesthetic qualities. However, the Discord-based interface and focus on artistic rather than technical outputs make it suboptimal for game asset workflows.

3. Stable Diffusion (Stability AI): Open-source model enabling self-hosting and customization. The availability through APIs (including Replicate) makes it suitable for integration into custom applications like Pixelar.

4. Google Gemini: Multimodal AI model with image generation capabilities, offering an alternative API for generation services with different strengths in prompt interpretation.

## 2.3 Existing Game Asset Creation Tools

**Traditional Digital Art Software**

Professional game artists typically use established digital art applications:

1. Adobe Photoshop: Industry-standard raster graphics editor with extensive features but steep learning curve and subscription costs.

2. Aseprite: Specialized pixel art editor popular among indie developers, offering animation timeline and sprite sheet export. While excellent for manual creation, it provides no AI assistance.

3. Pyxel Edit: Tile-based pixel art editor focused on game development workflows, supporting tilemap creation and animation.

4. GraphicsGale: Free pixel art animation software with frame management capabilities.

These tools require significant artistic skill and time investment, representing the traditional approach that Pixelar aims to complement.

**AI-Assisted Art Tools**

Recent developments have introduced AI capabilities to creative software:

1. Adobe Firefly: Integrated into Adobe products, offering generative fill and image generation. However, outputs are not optimized for game assets and require significant post-processing.

2. Canva AI: Provides AI image generation within a design platform, but lacks game-specific features and export options.

3. Scenario.gg: A platform specifically targeting game asset generation with AI. Offers training custom models on existing art styles. Represents the closest existing solution to Pixelar's objectives but with different technical approaches and pricing models.

4. Leonardo.AI: Provides AI image generation with some game-focused features, including model fine-tuning capabilities.

## 2.4 Animation Generation Research

Character animation generation represents a specialized challenge within AI content creation. Relevant research includes:

**Pose-Guided Generation**

ControlNet (Zhang et al., 2023) introduced conditioning mechanisms for diffusion models, enabling pose-guided image generation. By providing skeletal pose information, users can control character positioning in generated images. This technology underlies Pixelar's animation frame generation approach.

**Video and Animation Synthesis**

Research into video generation models (Make-A-Video, Imagen Video) demonstrates potential for direct animation synthesis. However, current models lack the frame-level control and consistency required for game sprite animations, making frame-by-frame generation with pose guidance more practical for Pixelar's use case.

**Sprite Animation Datasets**

Academic datasets for sprite animation remain limited. The Sprites dataset and various game asset collections provide training data for specialized models, though most general-purpose image generation models lack specific training on pixel art animations.

## 2.5 Web Application Architecture Research

**Modern Frontend Frameworks**

The evolution of frontend frameworks has produced several options for building interactive web applications:

1. React: Component-based library enabling declarative UI development. Extensive ecosystem and community support make it suitable for complex applications.

2. Next.js: React framework adding server-side rendering, routing, and optimization features. Particularly suitable for applications requiring both static and dynamic content.

3. Vue.js and Svelte: Alternative frameworks with different paradigms, each with trade-offs in learning curve, performance, and ecosystem maturity.

Research into frontend performance optimization, including code splitting, lazy loading, and efficient state management, informs Pixelar's architecture decisions.

**Backend API Design**

RESTful API design principles (Fielding, 2000) provide the foundation for Pixelar's backend architecture. Additional considerations include:

1. Authentication patterns using JWT tokens and OAuth 2.0 flows
2. Rate limiting and quota management for AI service integration
3. Asynchronous processing for long-running generation tasks
4. Caching strategies for frequently accessed resources

**Cloud Storage Solutions**

Research into object storage services (AWS S3, Google Cloud Storage, Vercel Blob) informed the selection of Vercel Blob for asset storage, considering factors including:
- Integration simplicity with the deployment platform
- Cost structure for storage and bandwidth
- CDN capabilities for global asset delivery
- API design for programmatic access


## 2.6 Comparative Analysis of Related Works

Table 2.1 presents a comparative analysis of existing solutions related to Pixelar's functionality:

**Table 2.1: Comparison of Related Game Asset Generation Tools**

| Feature | Pixelar | Scenario.gg | Leonardo.AI | Midjourney | Aseprite |
|---------|---------|-------------|-------------|------------|----------|
| AI Image Generation | Yes | Yes | Yes | Yes | No |
| Game-Specific Optimization | Yes | Yes | Partial | No | N/A |
| Pixel Art Style | Yes | Yes | Yes | Limited | Manual |
| Animation Generation | Yes | Limited | No | No | Manual |
| Sprite Sheet Export | Yes | Yes | No | No | Yes |
| Project Management | Yes | Yes | Yes | No | Local |
| BYOK Support | Yes | No | No | No | N/A |
| Web-Based | Yes | Yes | Yes | Discord | Desktop |
| Free Tier | Yes | Limited | Yes | No | One-time |
| Custom Pose Control | Yes | No | Limited | No | Manual |
| Real-time Preview | Yes | Yes | Yes | No | Yes |

## 2.7 Limitations of Existing Solutions

Analysis of existing solutions reveals several limitations that Pixelar addresses:

**General AI Image Generators (DALL-E, Midjourney, Stable Diffusion Web)**

1. Lack of game-specific optimization: Generated images require manual post-processing for game integration, including background removal, resizing, and format conversion.

2. No animation workflow: These platforms generate single images without support for creating animation sequences or maintaining character consistency across frames.

3. Limited export options: Standard image downloads without sprite sheet generation, transparency handling, or game engine-specific formats.

4. No project organization: Generated images are not organized into projects or associated with metadata useful for game development.

**Specialized Game Asset Tools (Scenario.gg)**

1. Pricing barriers: Professional features often require expensive subscriptions, limiting accessibility for indie developers.

2. Limited animation support: While offering some animation features, comprehensive frame-by-frame generation with pose control remains limited.

3. No BYOK option: Users cannot leverage their own API keys to reduce costs or access specific models.

4. Platform lock-in: Assets and projects may be difficult to export or migrate to other systems.

**Traditional Art Software (Aseprite, Photoshop)**

1. Skill requirement: Effective use requires significant artistic training and practice.

2. Time investment: Manual asset creation is time-consuming, particularly for animations requiring multiple frames.

3. No AI assistance: These tools provide no automated generation capabilities, relying entirely on user skill.

4. Cost considerations: Professional software requires ongoing subscription fees or significant one-time purchases.

## 2.8 Research Gaps Addressed by Pixelar

Based on the background study, Pixelar addresses the following identified gaps:

1. Integrated Animation Workflow: Unlike existing solutions, Pixelar provides end-to-end animation generation from pose selection through frame generation to sprite sheet export.

2. Accessible Pricing Model: The credit-based system with BYOK support enables cost-effective usage for developers at all budget levels.

3. Game-Optimized Generation: Prompt engineering and parameter optimization specifically target game asset aesthetics rather than general artistic output.

4. Comprehensive Project Management: Integration of generation, storage, and organization within a unified platform streamlines the asset creation workflow.

5. Multiple AI Provider Support: Flexibility to use different AI services (Replicate, Gemini) provides redundancy and allows users to select optimal providers for their needs.

## 2.9 Theoretical Framework

Pixelar's design is grounded in several theoretical frameworks:

**User-Centered Design (Norman, 2013)**

The interface design prioritizes user needs and workflows, minimizing cognitive load while providing access to advanced features. Progressive disclosure presents basic options prominently while making advanced parameters accessible without overwhelming new users.

**Agile Development Methodology**

The project follows agile principles with iterative development cycles, enabling rapid response to user feedback and evolving requirements. Feature prioritization based on user value guides development decisions.

**Microservices Architecture Principles**

While not a full microservices implementation, the separation of frontend, backend API, and external AI services follows principles of service isolation, enabling independent scaling and maintenance of system components.

**RESTful API Design**

Backend API design adheres to REST principles, providing predictable, stateless endpoints that facilitate frontend development and potential future integrations.

## 2.10 Summary of Background Study

The background study reveals a maturing landscape of AI image generation technologies with significant potential for game development applications. While existing solutions address portions of the game asset creation challenge, no single platform provides the comprehensive, accessible, and game-optimized solution that Pixelar aims to deliver.

Key findings informing Pixelar's development include:
- Diffusion models (particularly Stable Diffusion) provide the most suitable foundation for game asset generation
- Animation generation requires specialized workflows beyond single-image generation
- Project management and export capabilities are essential for practical game development integration
- Pricing accessibility significantly impacts adoption among indie developers
- BYOK functionality addresses both cost concerns and user preference for specific AI providers

These findings directly inform the system requirements, architecture, and design decisions presented in Chapter 3.


---

# Chapter 3: System Requirements, Architecture, and Design

## 3.1 Introduction

This chapter presents the comprehensive system requirements, architectural design, and detailed specifications for the Pixelar platform. The documentation follows IEEE standards for software requirements specification and system design, providing a complete technical foundation for implementation and future maintenance.

## 3.2 Flow Chart

The following flow chart illustrates the primary user workflow for asset generation in Pixelar:

```
                    ┌─────────────────┐
                    │     Start       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  User Visits    │
                    │   Landing Page  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Google Sign-In │
                    │ Authentication  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Home Page     │
                    │ (Dashboard)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │  Sprite    │  │   Scene    │  │ Animation  │
     │ Generator  │  │ Generator  │  │ Generator  │
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           │               │               │
           ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ Configure  │  │ Configure  │  │  Upload    │
     │ Parameters │  │ Parameters │  │ Character  │
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           │               │               │
           ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │   Enter    │  │   Enter    │  │  Select    │
     │   Prompt   │  │   Prompt   │  │ Animation  │
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Check Credits   │
                  │   Available?    │
                  └────────┬────────┘
                           │
              ┌────────────┴────────────┐
              │ No                      │ Yes
              ▼                         ▼
     ┌─────────────────┐      ┌─────────────────┐
     │ Display Error   │      │  Call AI API    │
     │ Insufficient    │      │  Generation     │
     │ Credits         │      └────────┬────────┘
     └─────────────────┘               │
                                       ▼
                              ┌─────────────────┐
                              │ Deduct Credits  │
                              │ Store Assets    │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Display Results │
                              │ in Preview      │
                              └────────┬────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
     │    Download     │     │  Save to        │     │   Regenerate    │
     │    Asset        │     │  Project        │     │   (New Prompt)  │
     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Figure 3.1: Primary User Workflow Flow Chart**

The flow chart demonstrates the sequential process from user authentication through asset generation and output handling. Key decision points include credit verification before generation and multiple output options after successful generation.


## 3.3 Use Case Diagram

```
                              ┌─────────────────────────────────────────────────────────┐
                              │                    Pixelar System                        │
                              │                                                          │
    ┌──────────┐              │  ┌─────────────────┐      ┌─────────────────┐           │
    │          │              │  │  Authenticate   │      │  View Dashboard │           │
    │          │──────────────┼─▶│  (Google SSO)   │      │                 │           │
    │          │              │  └─────────────────┘      └─────────────────┘           │
    │          │              │           │                        ▲                    │
    │          │              │           │                        │                    │
    │          │              │           ▼                        │                    │
    │          │              │  ┌─────────────────┐               │                    │
    │   User   │──────────────┼─▶│ Manage Profile  │───────────────┘                    │
    │          │              │  └─────────────────┘                                    │
    │          │              │                                                          │
    │          │              │  ┌─────────────────┐      ┌─────────────────┐           │
    │          │──────────────┼─▶│ Generate Sprite │─────▶│ Configure Params│           │
    │          │              │  └─────────────────┘      └─────────────────┘           │
    │          │              │           │                                              │
    │          │              │           │         ┌─────────────────┐                 │
    │          │              │           └────────▶│  Enter Prompt   │                 │
    │          │              │                     └─────────────────┘                 │
    │          │              │                                                          │
    │          │              │  ┌─────────────────┐      ┌─────────────────┐           │
    │          │──────────────┼─▶│ Generate Scene  │─────▶│ Select Viewpoint│           │
    │          │              │  └─────────────────┘      └─────────────────┘           │
    │          │              │                                                          │
    │          │              │  ┌─────────────────┐      ┌─────────────────┐           │
    │          │──────────────┼─▶│Generate Animation│────▶│ Select Animation│           │
    │          │              │  └─────────────────┘      │     Type        │           │
    │          │              │           │               └─────────────────┘           │
    │          │              │           │                                              │
    │          │              │           │         ┌─────────────────┐                 │
    │          │              │           └────────▶│ Upload Character│                 │
    │          │              │                     └─────────────────┘                 │
    │          │              │                                                          │
    │          │              │  ┌─────────────────┐      ┌─────────────────┐           │
    │          │──────────────┼─▶│ Manage Projects │─────▶│  Create Project │           │
    │          │              │  └─────────────────┘      └─────────────────┘           │
    │          │              │           │                                              │
    │          │              │           │         ┌─────────────────┐                 │
    │          │              │           ├────────▶│  Delete Project │                 │
    │          │              │           │         └─────────────────┘                 │
    │          │              │           │                                              │
    │          │              │           │         ┌─────────────────┐                 │
    │          │              │           └────────▶│  View Assets    │                 │
    │          │              │                     └─────────────────┘                 │
    │          │              │                                                          │
    │          │              │  ┌─────────────────┐      ┌─────────────────┐           │
    │          │──────────────┼─▶│ Download Assets │─────▶│ Export as PNG   │           │
    │          │              │  └─────────────────┘      └─────────────────┘           │
    │          │              │           │                                              │
    │          │              │           │         ┌─────────────────┐                 │
    │          │              │           ├────────▶│Export Sprite Sht│                 │
    │          │              │           │         └─────────────────┘                 │
    │          │              │           │                                              │
    │          │              │           │         ┌─────────────────┐                 │
    │          │              │           └────────▶│  Export as GIF  │                 │
    │          │              │                     └─────────────────┘                 │
    │          │              │                                                          │
    │          │              │  ┌─────────────────┐                                    │
    │          │──────────────┼─▶│ Configure BYOK  │                                    │
    └──────────┘              │  └─────────────────┘                                    │
                              │                                                          │
                              │                     ┌─────────────────┐                 │
                              │                     │   AI Service    │                 │
                              │                     │  (Replicate/    │                 │
                              │                     │   Gemini)       │                 │
                              │                     └─────────────────┘                 │
                              │                            ▲                            │
                              │                            │                            │
                              │  ┌─────────────────────────┘                            │
                              │  │ <<uses>>                                             │
                              │  │                                                       │
                              └──┼───────────────────────────────────────────────────────┘
                                 │
                              ┌──┴──────────┐
                              │ External    │
                              │ AI Provider │
                              └─────────────┘
```

**Figure 3.2: Use Case Diagram**

The use case diagram illustrates the primary actors (User, External AI Provider) and their interactions with the Pixelar system. The User actor represents authenticated users who can access all platform features. The External AI Provider represents the Replicate or Gemini API services used for image generation.


## 3.4 Software Development Plan

### 3.4.1 The Software Architecture

Pixelar employs a three-tier architecture separating presentation, business logic, and data management concerns:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js Frontend Application                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   Pages/     │  │  Components/ │  │   Hooks/     │               │   │
│  │  │   Routes     │  │   UI Layer   │  │   State Mgmt │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  Contexts/   │  │    lib/      │  │   public/    │               │   │
│  │  │  Providers   │  │  Utilities   │  │   Assets     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION TIER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Express.js Backend API                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   Routes/    │  │  Services/   │  │    lib/      │               │   │
│  │  │  Controllers │  │ Business Logic│  │  Utilities   │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   schemas/   │  │   types/     │  │  Middleware  │               │   │
│  │  │  Validation  │  │  TypeScript  │  │  Auth/CORS   │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA TIER                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │    Firebase      │  │   Vercel Blob    │  │  External APIs   │          │
│  │    Firestore     │  │   Storage        │  │  (AI Services)   │          │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │          │
│  │  │   users    │  │  │  │  images/   │  │  │  │ Replicate  │  │          │
│  │  │  projects  │  │  │  │  assets/   │  │  │  │  Gemini    │  │          │
│  │  │   assets   │  │  │  │  exports/  │  │  │  └────────────┘  │          │
│  │  │   jobs     │  │  │  └────────────┘  │  │                  │          │
│  │  └────────────┘  │  │                  │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Figure 3.3: Three-Tier Software Architecture**

**Presentation Tier:** The Next.js frontend handles all user interface rendering, client-side state management, and user interactions. Key components include page routes for different features, reusable UI components, React hooks for state management, and context providers for global state.

**Application Tier:** The Express.js backend provides RESTful API endpoints, implements business logic, handles authentication verification, and orchestrates interactions with external services. Services are organized by domain (User, Project, Asset, Generation).

**Data Tier:** Comprises Firebase Firestore for structured data storage, Vercel Blob for binary asset storage, and external AI APIs for generation services.

### 3.4.2 Number of Development Iterations

The project follows an iterative development approach with the following planned iterations:

**Iteration 1: Foundation (Weeks 1-3)**
- Project setup and configuration
- Authentication implementation
- Basic UI framework
- Database schema design

**Iteration 2: Core Generation (Weeks 4-6)**
- Sprite generation implementation
- AI API integration
- Basic preview functionality
- Credit system foundation

**Iteration 3: Extended Features (Weeks 7-9)**
- Scene generation
- Animation generation
- Project management
- Asset storage

**Iteration 4: Tools and Export (Weeks 10-11)**
- Sprite sheet converter
- GIF export
- Animation creator tool
- Download functionality

**Iteration 5: Polish and Optimization (Week 12)**
- Performance optimization
- UI/UX refinement
- Bug fixes
- Documentation


## 3.5 Fully Dressed Use Cases

### Use Case 1: Generate Sprite

| Element | Description |
|---------|-------------|
| Use Case ID | UC-001 |
| Use Case Name | Generate Sprite |
| Primary Actor | Authenticated User |
| Stakeholders | User (wants quality sprite), System (manages resources) |
| Preconditions | User is authenticated; User has sufficient credits (5 or more) |
| Postconditions | Sprite images are generated and displayed; Credits are deducted; Assets are stored |
| Main Success Scenario | 1. User navigates to Sprite Generator page. 2. User selects sprite type (Character/Object). 3. User enters text prompt describing desired sprite. 4. User configures parameters (style, viewpoint, aspect ratio, colors). 5. User optionally uploads reference image. 6. User clicks "Generate" button. 7. System validates user has sufficient credits. 8. System constructs optimized prompt and calls AI API. 9. System receives generated images from AI service. 10. System uploads images to blob storage. 11. System creates asset records in database. 12. System deducts credits from user account. 13. System displays generated sprites in preview area. 14. User can download, save to project, or regenerate. |
| Extensions | 7a. Insufficient credits: System displays error message with required vs. available credits. 8a. AI API error: System displays error message and does not deduct credits. 9a. Generation timeout: System retries or displays timeout error. |
| Frequency | High - Primary feature, multiple times per session |

### Use Case 2: Generate Animation

| Element | Description |
|---------|-------------|
| Use Case ID | UC-002 |
| Use Case Name | Generate Animation |
| Primary Actor | Authenticated User |
| Stakeholders | User (wants animation frames), System (manages generation) |
| Preconditions | User is authenticated; User has sufficient credits; User has character image |
| Postconditions | Animation frames are generated; Sprite sheet is available for download |
| Main Success Scenario | 1. User navigates to Animation Generator page. 2. User uploads character reference image. 3. User selects animation type from library (e.g., Walking, Running, Attack). 4. User selects view type (Isometric) and direction. 5. System displays frame descriptions for selected animation. 6. User clicks "Generate Animation" button. 7. System validates credits (3 per frame × number of frames). 8. System generates each frame with appropriate pose description. 9. System compiles frames and displays animated preview. 10. System deducts credits from user account. 11. User can play/pause animation preview. 12. User can download as sprite sheet or individual frames. |
| Extensions | 2a. Invalid image format: System displays format error. 7a. Insufficient credits: System displays credit requirement. 8a. Frame generation fails: System retries or skips frame with notification. |
| Frequency | Medium - Secondary feature |

### Use Case 3: Manage Project

| Element | Description |
|---------|-------------|
| Use Case ID | UC-003 |
| Use Case Name | Manage Project |
| Primary Actor | Authenticated User |
| Stakeholders | User (organizes assets), System (maintains data integrity) |
| Preconditions | User is authenticated |
| Postconditions | Project is created/modified/deleted as requested |
| Main Success Scenario | 1. User navigates to Projects page. 2. User clicks "New Project" button. 3. User enters project name. 4. User selects project type (Sprite/Scene). 5. User clicks "Create" button. 6. System creates project record in database. 7. System displays new project in project list. 8. User can open project to view/add assets. |
| Extensions | 3a. Empty name: System displays validation error. 6a. Database error: System displays error and allows retry. |
| Frequency | Medium - Project organization |


## 3.6 System Sequence Diagram (SSD)

### SSD for Sprite Generation

```
┌─────┐                    ┌──────────┐                    ┌─────────┐                    ┌──────────┐
│User │                    │ Frontend │                    │ Backend │                    │ AI API   │
└──┬──┘                    └────┬─────┘                    └────┬────┘                    └────┬─────┘
   │                            │                               │                              │
   │ 1. Navigate to /sprites    │                               │                              │
   │ ─────────────────────────▶ │                               │                              │
   │                            │                               │                              │
   │ 2. Display Sprite Page     │                               │                              │
   │ ◀───────────────────────── │                               │                              │
   │                            │                               │                              │
   │ 3. Configure Parameters    │                               │                              │
   │    (type, style, prompt)   │                               │                              │
   │ ─────────────────────────▶ │                               │                              │
   │                            │                               │                              │
   │ 4. Click Generate          │                               │                              │
   │ ─────────────────────────▶ │                               │                              │
   │                            │                               │                              │
   │                            │ 5. POST /api/generate/sprite  │                              │
   │                            │    {prompt, style, params}    │                              │
   │                            │ ─────────────────────────────▶│                              │
   │                            │                               │                              │
   │                            │                               │ 6. Verify Token              │
   │                            │                               │ ──────────────────┐          │
   │                            │                               │                   │          │
   │                            │                               │ ◀─────────────────┘          │
   │                            │                               │                              │
   │                            │                               │ 7. Check Credits             │
   │                            │                               │ ──────────────────┐          │
   │                            │                               │                   │          │
   │                            │                               │ ◀─────────────────┘          │
   │                            │                               │                              │
   │                            │                               │ 8. Build Optimized Prompt    │
   │                            │                               │ ──────────────────┐          │
   │                            │                               │                   │          │
   │                            │                               │ ◀─────────────────┘          │
   │                            │                               │                              │
   │                            │                               │ 9. POST /predictions         │
   │                            │                               │    {prompt, params}          │
   │                            │                               │ ────────────────────────────▶│
   │                            │                               │                              │
   │                            │                               │ 10. Return Generated Images  │
   │                            │                               │ ◀────────────────────────────│
   │                            │                               │                              │
   │                            │                               │ 11. Upload to Blob Storage   │
   │                            │                               │ ──────────────────┐          │
   │                            │                               │                   │          │
   │                            │                               │ ◀─────────────────┘          │
   │                            │                               │                              │
   │                            │                               │ 12. Create Asset Records     │
   │                            │                               │ ──────────────────┐          │
   │                            │                               │                   │          │
   │                            │                               │ ◀─────────────────┘          │
   │                            │                               │                              │
   │                            │                               │ 13. Deduct Credits           │
   │                            │                               │ ──────────────────┐          │
   │                            │                               │                   │          │
   │                            │                               │ ◀─────────────────┘          │
   │                            │                               │                              │
   │                            │ 14. Return {success, images,  │                              │
   │                            │     remainingCredits}         │                              │
   │                            │ ◀─────────────────────────────│                              │
   │                            │                               │                              │
   │ 15. Display Generated      │                               │                              │
   │     Sprites in Preview     │                               │                              │
   │ ◀───────────────────────── │                               │                              │
   │                            │                               │                              │
   │ 16. Update Credit Display  │                               │                              │
   │ ◀───────────────────────── │                               │                              │
   │                            │                               │                              │
┌──┴──┐                    ┌────┴─────┐                    ┌────┴────┐                    ┌────┴─────┐
│User │                    │ Frontend │                    │ Backend │                    │ AI API   │
└─────┘                    └──────────┘                    └─────────┘                    └──────────┘
```

**Figure 3.4: System Sequence Diagram for Sprite Generation**

The SSD illustrates the complete message flow for sprite generation, from user interaction through frontend processing, backend orchestration, external API calls, and response handling. Key interactions include authentication verification, credit validation, AI API communication, and asset storage operations.


## 3.7 Software Requirements Specification (SRS) Document

### 3.7.1 Functional Requirements

**FR-001: User Authentication**
- The system shall support Google Sign-In authentication via Firebase Authentication.
- The system shall synchronize authenticated users with the Firestore database.
- The system shall maintain user sessions using Firebase ID tokens.
- The system shall provide logout functionality clearing all session data.

**FR-002: Sprite Generation**
- The system shall accept text prompts describing desired sprites.
- The system shall support sprite type selection (Character, Object).
- The system shall support art style selection (Pixel Art, 2D Flat).
- The system shall support viewpoint selection (Front, Back, Side, Top-Down, Isometric).
- The system shall support aspect ratio selection (2:3, 1:1, 9:16, 4:3, 3:2, 16:9).
- The system shall support custom color palette selection (up to 5 colors).
- The system shall support reference image upload for style guidance.
- The system shall generate 1-4 sprite variations per request.
- The system shall display generated sprites in a preview area.

**FR-003: Scene Generation**
- The system shall accept text prompts describing desired scenes.
- The system shall support scene type selection (Indoor, Outdoor).
- The system shall support the same style, viewpoint, and aspect ratio options as sprite generation.
- The system shall generate 1-4 scene variations per request.

**FR-004: Animation Generation**
- The system shall accept character reference images for animation.
- The system shall provide a library of 50+ predefined animation types.
- The system shall support view type and direction selection.
- The system shall generate individual frames based on frame descriptions.
- The system shall display animated preview of generated frames.
- The system shall support sprite sheet export of animation frames.

**FR-005: Project Management**
- The system shall allow users to create projects with name and type.
- The system shall allow users to view all their projects.
- The system shall allow users to delete projects.
- The system shall associate generated assets with projects.
- The system shall display project thumbnails and asset counts.

**FR-006: Credit System**
- The system shall track user credit balances.
- The system shall deduct 5 credits for sprite generation.
- The system shall deduct 8 credits for scene generation.
- The system shall deduct 3 credits per frame for animation generation.
- The system shall prevent generation when credits are insufficient.
- The system shall not deduct credits when using BYOK.

**FR-007: Asset Export**
- The system shall support PNG download of individual assets.
- The system shall support sprite sheet generation for animations.
- The system shall support GIF export for animations.
- The system shall support batch download of project assets.

**FR-008: BYOK (Bring Your Own Key)**
- The system shall allow users to configure personal API keys.
- The system shall support Replicate API keys.
- The system shall support Gemini API keys.
- The system shall store API keys in browser local storage.
- The system shall use user API keys when configured.

### 3.7.2 Non-Functional Requirements

**NFR-001: Performance**
- The system shall load the main dashboard within 3 seconds on standard broadband connections.
- The system shall provide responsive UI feedback within 100ms of user interactions.
- The system shall complete asset generation within 60 seconds under normal conditions.

**NFR-002: Scalability**
- The system shall support at least 100 concurrent users without performance degradation.
- The system shall handle at least 1000 generation requests per hour.
- The database shall support at least 100,000 user records.

**NFR-003: Security**
- The system shall use HTTPS for all communications.
- The system shall validate Firebase ID tokens on all protected endpoints.
- The system shall implement CORS restrictions for API access.
- The system shall not store user API keys on the server.

**NFR-004: Availability**
- The system shall maintain 99% uptime for core services.
- The system shall gracefully handle external API failures.
- The system shall provide meaningful error messages for all failure scenarios.

**NFR-005: Usability**
- The system shall be accessible via modern web browsers (Chrome, Firefox, Safari, Edge).
- The system shall provide responsive design for desktop and tablet devices.
- The system shall provide clear feedback during generation processes.

**NFR-006: Maintainability**
- The system shall use TypeScript for type safety.
- The system shall follow consistent code formatting standards.
- The system shall include comprehensive error logging.


## 3.8 Test Plan

### 3.8.1 Test Levels

**Unit Testing**
- Scope: Individual functions, components, and services
- Tools: Jest testing framework
- Coverage Target: 80% code coverage for critical paths
- Responsibility: Development team

**Integration Testing**
- Scope: API endpoints, database operations, external service integration
- Tools: Jest with supertest for API testing
- Focus Areas: Authentication flow, generation pipeline, data persistence
- Responsibility: Development team

**System Testing**
- Scope: End-to-end user workflows
- Tools: Manual testing, browser developer tools
- Focus Areas: Complete generation workflows, project management, export functionality
- Responsibility: QA team

**User Acceptance Testing (UAT)**
- Scope: Real-world usage scenarios
- Participants: Beta users, stakeholders
- Focus Areas: Usability, feature completeness, performance perception
- Responsibility: Product team with user participation

### 3.8.2 Testing Techniques

**Black Box Testing**
- Equivalence Partitioning: Testing with valid/invalid inputs for generation parameters
- Boundary Value Analysis: Testing credit limits, prompt length limits, file size limits
- Decision Table Testing: Testing combinations of generation parameters

**White Box Testing**
- Statement Coverage: Ensuring all code statements are executed
- Branch Coverage: Testing all conditional branches
- Path Coverage: Testing critical execution paths

**Specific Test Cases**

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| TC-001 | User login with valid Google account | Successful authentication, redirect to dashboard | High |
| TC-002 | User login with invalid token | Error message displayed, no access granted | High |
| TC-003 | Generate sprite with valid prompt | Sprite images generated and displayed | High |
| TC-004 | Generate sprite with empty prompt | Validation error, generation blocked | Medium |
| TC-005 | Generate sprite with insufficient credits | Error message with credit information | High |
| TC-006 | Generate animation with valid character image | Animation frames generated | High |
| TC-007 | Generate animation without character image | Validation error, generation blocked | Medium |
| TC-008 | Create new project | Project created and displayed in list | Medium |
| TC-009 | Delete existing project | Project removed from list | Medium |
| TC-010 | Download generated asset as PNG | File downloaded successfully | Medium |
| TC-011 | Export animation as sprite sheet | Sprite sheet PNG downloaded | Medium |
| TC-012 | Export animation as GIF | Animated GIF downloaded | Medium |
| TC-013 | Configure BYOK API key | Key stored, used for generation | Medium |
| TC-014 | Generate with BYOK (no credit deduction) | Generation succeeds, credits unchanged | Medium |
| TC-015 | Concurrent generation requests | All requests processed correctly | Low |

### 3.8.3 Test Environment

- Development Environment: Local development machines with Node.js 18+
- Staging Environment: Vercel preview deployments with test Firebase project
- Production Environment: Production Vercel deployment with production Firebase

### 3.8.4 Test Data

- Test user accounts with various credit levels
- Sample prompts covering different sprite/scene types
- Reference images in various formats and sizes
- Edge case inputs (maximum length prompts, special characters)

---

## 3.9 Summary

This chapter has presented the comprehensive system requirements, architecture, and design specifications for the Pixelar platform. The documentation includes flow charts illustrating user workflows, use case diagrams depicting system interactions, detailed software architecture diagrams, fully dressed use cases for primary features, system sequence diagrams showing message flows, complete software requirements specifications covering both functional and non-functional requirements, and a thorough test plan outlining testing strategies and specific test cases.

The architecture follows a three-tier design separating presentation, application, and data concerns, enabling scalability and maintainability. The iterative development approach allows for incremental feature delivery while maintaining system stability. The comprehensive test plan ensures quality assurance across all system components and user workflows.

---

## References

1. Goodfellow, I., et al. (2014). Generative Adversarial Networks. arXiv:1406.2661.
2. Ho, J., et al. (2020). Denoising Diffusion Probabilistic Models. arXiv:2006.11239.
3. Rombach, R., et al. (2022). High-Resolution Image Synthesis with Latent Diffusion Models. CVPR 2022.
4. Zhang, L., et al. (2023). Adding Conditional Control to Text-to-Image Diffusion Models. arXiv:2302.05543.
5. Karras, T., et al. (2019). A Style-Based Generator Architecture for Generative Adversarial Networks. CVPR 2019.
6. Norman, D. (2013). The Design of Everyday Things: Revised and Expanded Edition. Basic Books.
7. Fielding, R. (2000). Architectural Styles and the Design of Network-based Software Architectures. Doctoral dissertation, UC Irvine.
8. IEEE Std 830-1998. IEEE Recommended Practice for Software Requirements Specifications.
9. Firebase Documentation. https://firebase.google.com/docs
10. Next.js Documentation. https://nextjs.org/docs
11. Replicate API Documentation. https://replicate.com/docs
12. Vercel Blob Documentation. https://vercel.com/docs/storage/vercel-blob

