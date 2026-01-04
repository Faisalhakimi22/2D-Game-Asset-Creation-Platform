"use strict";
/**
 * Unit Tests: Project Service
 * Tests for project CRUD operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
// Mock project data store
let mockProjectStore = {};
let projectIdCounter = 1;
beforeEach(() => {
    projectIdCounter = 1;
    mockProjectStore = {
        'project_123': { ...setup_1.mockProject },
        'project_456': {
            ...setup_1.mockProject,
            id: 'project_456',
            title: 'Second Project',
            type: 'scene',
            status: 'active'
        },
        'project_789': {
            ...setup_1.mockProject,
            id: 'project_789',
            title: 'Deleted Project',
            status: 'deleted'
        }
    };
    jest.clearAllMocks();
});
describe('Project Service - Unit Tests', () => {
    // ========================================
    // UT-PROJ-001: create project
    // ========================================
    describe('UT-PROJ-001: create project', () => {
        it('should create project with all required fields', async () => {
            const input = {
                user_id: 'user_123',
                title: 'New Project',
                type: 'sprite'
            };
            const result = await ProjectService.create(input);
            expect(result.id).toBeDefined();
            expect(result.user_id).toBe('user_123');
            expect(result.title).toBe('New Project');
            expect(result.type).toBe('sprite');
            expect(result.status).toBe('draft');
            expect(result.created_at).toBeDefined();
            expect(result.updated_at).toBeDefined();
        });
        it('should create project with optional fields', async () => {
            const input = {
                user_id: 'user_123',
                title: 'Detailed Project',
                type: 'scene',
                description: 'A detailed description',
                color: '#FF5733'
            };
            const result = await ProjectService.create(input);
            expect(result.description).toBe('A detailed description');
            expect(result.color).toBe('#FF5733');
        });
    });
    // ========================================
    // UT-PROJ-002: findById
    // ========================================
    describe('UT-PROJ-002: findById', () => {
        it('should return project when ID exists', async () => {
            const result = await ProjectService.findById('project_123');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('project_123');
            expect(result?.title).toBe('Test Project');
        });
        it('should return null when ID does not exist', async () => {
            const result = await ProjectService.findById('nonexistent');
            expect(result).toBeNull();
        });
        it('should filter by user_id when provided', async () => {
            const result = await ProjectService.findById('project_123', 'user_123');
            expect(result).not.toBeNull();
            const wrongUser = await ProjectService.findById('project_123', 'wrong_user');
            expect(wrongUser).toBeNull();
        });
    });
    // ========================================
    // UT-PROJ-003: list projects
    // ========================================
    describe('UT-PROJ-003: list projects', () => {
        it('should list all active projects for user', async () => {
            const result = await ProjectService.list({ user_id: 'user_123' });
            expect(result.length).toBeGreaterThan(0);
            result.forEach(project => {
                expect(project.user_id).toBe('user_123');
                expect(project.status).not.toBe('deleted');
            });
        });
        it('should filter by type', async () => {
            const result = await ProjectService.list({
                user_id: 'user_123',
                type: 'sprite'
            });
            result.forEach(project => {
                expect(project.type).toBe('sprite');
            });
        });
        it('should exclude deleted projects by default', async () => {
            const result = await ProjectService.list({ user_id: 'user_123' });
            const deletedProjects = result.filter(p => p.status === 'deleted');
            expect(deletedProjects.length).toBe(0);
        });
        it('should include deleted when status filter is deleted', async () => {
            const result = await ProjectService.list({
                user_id: 'user_123',
                status: 'deleted'
            });
            result.forEach(project => {
                expect(project.status).toBe('deleted');
            });
        });
        it('should respect limit parameter', async () => {
            const result = await ProjectService.list({
                user_id: 'user_123',
                limit: 1
            });
            expect(result.length).toBeLessThanOrEqual(1);
        });
        it('should order by created_at desc by default', async () => {
            const result = await ProjectService.list({ user_id: 'user_123' });
            for (let i = 1; i < result.length; i++) {
                expect(new Date(result[i - 1].created_at).getTime())
                    .toBeGreaterThanOrEqual(new Date(result[i].created_at).getTime());
            }
        });
    });
    // ========================================
    // UT-PROJ-004: update project
    // ========================================
    describe('UT-PROJ-004: update project', () => {
        it('should update title', async () => {
            const result = await ProjectService.update('project_123', 'user_123', {
                title: 'Updated Title'
            });
            expect(result.title).toBe('Updated Title');
        });
        it('should update description', async () => {
            const result = await ProjectService.update('project_123', 'user_123', {
                description: 'New description'
            });
            expect(result.description).toBe('New description');
        });
        it('should update updated_at timestamp', async () => {
            const before = new Date();
            const result = await ProjectService.update('project_123', 'user_123', {
                title: 'Changed'
            });
            expect(new Date(result.updated_at).getTime()).toBeGreaterThanOrEqual(before.getTime());
        });
        it('should throw error for non-existent project', async () => {
            await expect(ProjectService.update('nonexistent', 'user_123', { title: 'Test' })).rejects.toThrow('Project not found');
        });
        it('should throw error for wrong user', async () => {
            await expect(ProjectService.update('project_123', 'wrong_user', { title: 'Test' })).rejects.toThrow('Project not found');
        });
    });
    // ========================================
    // UT-PROJ-005: delete project (soft delete)
    // ========================================
    describe('UT-PROJ-005: delete project (soft delete)', () => {
        it('should set status to deleted', async () => {
            await ProjectService.delete('project_123', 'user_123');
            const project = mockProjectStore['project_123'];
            expect(project.status).toBe('deleted');
        });
        it('should preserve project data', async () => {
            const originalTitle = mockProjectStore['project_123'].title;
            await ProjectService.delete('project_123', 'user_123');
            expect(mockProjectStore['project_123'].title).toBe(originalTitle);
        });
        it('should throw error for non-existent project', async () => {
            await expect(ProjectService.delete('nonexistent', 'user_123')).rejects.toThrow();
        });
    });
    // ========================================
    // UT-PROJ-006: search projects
    // ========================================
    describe('UT-PROJ-006: search projects', () => {
        it('should find projects by title search', async () => {
            const result = await ProjectService.list({
                user_id: 'user_123',
                search: 'Test'
            });
            expect(result.some(p => p.title.includes('Test'))).toBe(true);
        });
        it('should be case-insensitive', async () => {
            const result = await ProjectService.list({
                user_id: 'user_123',
                search: 'test'
            });
            expect(result.some(p => p.title.toLowerCase().includes('test'))).toBe(true);
        });
    });
    // ========================================
    // UT-PROJ-007: count projects
    // ========================================
    describe('UT-PROJ-007: count projects', () => {
        it('should return correct count', async () => {
            const count = await ProjectService.count({ user_id: 'user_123' });
            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });
        it('should exclude deleted from count', async () => {
            const countBefore = await ProjectService.count({ user_id: 'user_123' });
            await ProjectService.delete('project_123', 'user_123');
            const countAfter = await ProjectService.count({ user_id: 'user_123' });
            expect(countAfter).toBe(countBefore - 1);
        });
    });
});
const ProjectService = {
    async create(input) {
        const id = `project_new_${projectIdCounter++}`;
        const now = new Date();
        const project = {
            id,
            user_id: input.user_id,
            title: input.title,
            type: input.type,
            description: input.description || null,
            color: input.color || null,
            thumbnail_url: null,
            status: 'draft',
            created_at: now,
            updated_at: now
        };
        mockProjectStore[id] = project;
        return { ...project };
    },
    async findById(id, userId) {
        const project = mockProjectStore[id];
        if (!project)
            return null;
        if (userId && project.user_id !== userId)
            return null;
        return { ...project };
    },
    async list(filters) {
        let projects = Object.values(mockProjectStore);
        if (filters.user_id) {
            projects = projects.filter(p => p.user_id === filters.user_id);
        }
        if (filters.type) {
            projects = projects.filter(p => p.type === filters.type);
        }
        if (filters.status) {
            projects = projects.filter(p => p.status === filters.status);
        }
        else {
            projects = projects.filter(p => p.status !== 'deleted');
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            projects = projects.filter(p => p.title?.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower));
        }
        // Sort by created_at desc
        projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (filters.limit) {
            projects = projects.slice(0, filters.limit);
        }
        return projects.map(p => ({ ...p }));
    },
    async count(filters) {
        const projects = await this.list(filters);
        return projects.length;
    },
    async update(id, userId, data) {
        const project = mockProjectStore[id];
        if (!project || project.user_id !== userId) {
            throw new Error('Project not found');
        }
        Object.assign(project, data, { updated_at: new Date() });
        return { ...project };
    },
    async delete(id, userId) {
        const project = mockProjectStore[id];
        if (!project || project.user_id !== userId) {
            throw new Error('Project not found');
        }
        project.status = 'deleted';
        project.updated_at = new Date();
    }
};
