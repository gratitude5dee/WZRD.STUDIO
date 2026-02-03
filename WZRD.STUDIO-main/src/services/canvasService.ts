import { supabase } from '@/integrations/supabase/client';
import type { CanvasObject, CanvasProject, ViewportState } from '@/types/canvas';

export interface CanvasProjectRow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  viewport: ViewportState;
  settings: {
    width: number;
    height: number;
    backgroundColor: string;
    fps: number;
  };
  created_at: string;
  updated_at: string;
}

export const canvasService = {
  // Projects
  async createProject(project: Omit<CanvasProject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CanvasProject> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('canvas_projects')
      .insert([{
        user_id: user.id,
        name: project.name,
        description: project.description,
        thumbnail_url: project.thumbnailUrl,
        viewport: project.canvasState.viewport as any,
        settings: project.settings as any,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description || '',
      thumbnailUrl: data.thumbnail_url || '',
      canvasState: {
        viewport: data.viewport as unknown as ViewportState,
        objects: [],
      },
      settings: data.settings as any,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async getProject(projectId: string): Promise<CanvasProject | null> {
    const { data: projectData, error: projectError } = await supabase
      .from('canvas_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !projectData) return null;

    const { data: objectsData } = await supabase
      .from('canvas_objects')
      .select('*')
      .eq('project_id', projectId)
      .order('layer_index', { ascending: true });

    const objects: CanvasObject[] = (objectsData || []).map(obj => ({
      id: obj.id,
      type: obj.object_type as CanvasObject['type'],
      layerIndex: obj.layer_index,
      transform: obj.transform as any,
      visibility: obj.visibility,
      locked: obj.locked,
      data: obj.data as any,
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
    }));

    return {
      id: projectData.id,
      userId: projectData.user_id,
      name: projectData.name,
      description: projectData.description || '',
      thumbnailUrl: projectData.thumbnail_url || '',
      canvasState: {
        viewport: projectData.viewport as unknown as ViewportState,
        objects,
      },
      settings: projectData.settings as any,
      createdAt: projectData.created_at,
      updatedAt: projectData.updated_at,
    };
  },

  async updateProject(projectId: string, updates: Partial<CanvasProject>): Promise<void> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.thumbnailUrl) updateData.thumbnail_url = updates.thumbnailUrl;
    if (updates.canvasState?.viewport) updateData.viewport = updates.canvasState.viewport;
    if (updates.settings) updateData.settings = updates.settings;

    const { error } = await supabase
      .from('canvas_projects')
      .update(updateData)
      .eq('id', projectId);

    if (error) throw error;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('canvas_projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },

  async listProjects(): Promise<CanvasProject[]> {
    const { data, error } = await supabase
      .from('canvas_projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(project => ({
      id: project.id,
      userId: project.user_id,
      name: project.name,
      description: project.description || '',
      thumbnailUrl: project.thumbnail_url || '',
      canvasState: {
        viewport: project.viewport as unknown as ViewportState,
        objects: [],
      },
      settings: project.settings as any,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));
  },

  // Objects
  async createObject(projectId: string, object: CanvasObject): Promise<CanvasObject> {
    const { data, error } = await supabase
      .from('canvas_objects')
      .insert([{
        id: object.id,
        project_id: projectId,
        object_type: object.type,
        layer_index: object.layerIndex,
        transform: object.transform as any,
        visibility: object.visibility,
        locked: object.locked,
        data: object.data as any,
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.object_type as CanvasObject['type'],
      layerIndex: data.layer_index,
      transform: data.transform as any,
      visibility: data.visibility,
      locked: data.locked,
      data: data.data as any,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateObject(objectId: string, updates: Partial<CanvasObject>): Promise<void> {
    const updateData: any = {};
    if (updates.layerIndex !== undefined) updateData.layer_index = updates.layerIndex;
    if (updates.transform) updateData.transform = updates.transform;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
    if (updates.locked !== undefined) updateData.locked = updates.locked;
    if (updates.data) updateData.data = updates.data;

    const { error } = await supabase
      .from('canvas_objects')
      .update(updateData)
      .eq('id', objectId);

    if (error) throw error;
  },

  async deleteObject(objectId: string): Promise<void> {
    const { error } = await supabase
      .from('canvas_objects')
      .delete()
      .eq('id', objectId);

    if (error) throw error;
  },

  async syncObjects(projectId: string, objects: CanvasObject[]): Promise<void> {
    // Delete all existing objects
    await supabase
      .from('canvas_objects')
      .delete()
      .eq('project_id', projectId);

    // Insert new objects
    if (objects.length > 0) {
      const { error } = await supabase
        .from('canvas_objects')
        .insert(
          objects.map(obj => ({
            id: obj.id,
            project_id: projectId,
            object_type: obj.type,
            layer_index: obj.layerIndex,
            transform: obj.transform as any,
            visibility: obj.visibility,
            locked: obj.locked,
            data: obj.data as any,
          }))
        );

      if (error) throw error;
    }
  }
};
