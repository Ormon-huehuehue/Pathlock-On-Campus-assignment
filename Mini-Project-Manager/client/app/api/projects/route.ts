import { NextRequest, NextResponse } from 'next/server';
import { mockData } from '../lib/mockData';

// GET /api/projects - Fetch all projects
export async function GET(request: NextRequest) {
  try {
    // In a real app, you would verify the JWT token here
    // const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    const projects = mockData.getProjects();
    
    return NextResponse.json({
      projects: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    // Validation
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

    if (description && description.length > 500) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: { description: ['Description must be less than 500 characters'] }
        },
        { status: 422 }
      );
    }

    // Create new project
    const newProject = mockData.createProject({
      title: title,
      description: description
    });

    return NextResponse.json({
      project: newProject
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: 'Failed to create project' },
      { status: 500 }
    );
  }
}