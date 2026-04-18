'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi } from '@/lib/api';

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    story: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.story.trim() || formData.story.length < 10) {
      setError('Story must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const project = await projectsApi.create({
        title: formData.title,
        story: formData.story,
      });

      // Redirect to project detail page
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
      <p className="text-gray-600 mb-8">
        Start by giving your project a title and writing your story. You can add more details later.
      </p>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="e.g., My Adventure Story"
            required
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">Give your project a descriptive title</p>
        </div>

        <div className="mb-8">
          <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-2">
            Your Story *
          </label>
          <textarea
            id="story"
            name="story"
            value={formData.story}
            onChange={handleChange}
            rows={8}
            className="input resize-none"
            placeholder="Write your story here... (minimum 10 characters)"
            required
            disabled={loading}
          />
          <div className="mt-1 flex justify-between">
            <p className="text-sm text-gray-500">Minimum 10 characters</p>
            <p
              className={`text-sm ${formData.story.length < 10 ? 'text-red-500' : 'text-green-500'}`}
            >
              {formData.story.length} characters
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.title.trim() || formData.story.length < 10}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Phase 1 Note</h3>
        <p className="text-blue-700 text-sm">
          In this phase, we only save your story. AI story generation, scene creation, and video
          generation will be implemented in later phases.
        </p>
      </div>
    </div>
  );
}
