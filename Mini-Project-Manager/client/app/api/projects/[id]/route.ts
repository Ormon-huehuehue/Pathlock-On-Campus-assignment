import { NextRequest, NextResponse } from 'next/server';
import { mockData } from '../../lib/mockData';

// GET /api/projects/[id] - Fetch a single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const project = mockData.getProject(projectId);
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      project: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { message: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    const existingProject = mockData.getProject(projectId);
    
    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    // Validation
    if (title !== undefined) {
      if (!title || typeof title !== 'string') {
        return NextResponse.json(
          { 
            message: 'Validation failed',
            errors: { title: ['Title is required'] }
          },
          { status: 422 }
        );
      }

      if (title.trim().length < 3) {
        return NextResponse.json(
          { 
            message: 'Validation failed',
            errors: { title: ['Title must be at least 3 characters'] }
          },
          { status: 422 }
        );
      }

      if (title.trim().length > 100) {
        return NextResponse.json(
          { 
            message: 'Validation failed',
            errors: { title: ['Title must be less than 100 characters'] }
          },
          { status: 422 }
        );
      }
    }

    if (description !== undefined && description.length > 500) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: { description: ['Description must be less than 500 characters'] }
        },
        { status: 422 }
      );
    }

    // Update project
    const updatedProject = mockData.updateProject(projectId, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description })
    });

    if (!updatedProject) {
      return NextResponse.json(
        { message: 'Failed to update project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      project: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { message: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { message: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const success = mockData.deleteProject(projectId);
    
    if (!success) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'Failed to delete project' },
      { status: 500 }
    );
  }
}