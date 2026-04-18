'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectsApi, Project, Script, Scene } from '@/lib/api';
import { format } from 'date-fns';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadScript();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getById(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      setError('Failed to load project. It may not exist.');
      console.error(err);
    }
  };

  const loadScript = async () => {
    try {
      const data = await projectsApi.getScript(projectId);
      setScript(data.script);
      setScenes(data.scenes);
    } catch (err) {
      // Script may not exist yet, that's okay
      console.log('No script found for this project');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!project) return;

    try {
      setGenerating(true);
      const result = await projectsApi.generateScript(projectId);
      setScript(result.script);
      setScenes(result.scenes);

      // Refresh project to get updated scriptId
      await loadProject();
    } catch (err) {
      console.error('Failed to generate script:', err);
      alert('Failed to generate script. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!project || !script) return;

    try {
      setGeneratingImages(true);
      const result = await projectsApi.generateImages(projectId);

      if (result.success) {
        alert(`图片生成成功！已为 ${result.generatedCount} 个场景生成图片。`);
        // 重新加载剧本和场景以获取更新的图片信息
        await loadScript();
      } else {
        alert(`图片生成完成：${result.message}`);
      }
    } catch (err) {
      console.error('Failed to generate images:', err);
      alert('生成图片失败，请重试。');
    } finally {
      setGeneratingImages(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!project || !script) return;

    try {
      setGeneratingAudio(true);
      const result = await projectsApi.generateAudio(projectId);

      if (result.success) {
        alert(`音频生成成功！已为 ${result.generatedCount} 个场景生成音频。`);
        // 重新加载剧本和场景以获取更新的音频信息
        await loadScript();
      } else {
        alert(`音频生成完成：${result.message}`);
      }
    } catch (err) {
      console.error('Failed to generate audio:', err);
      alert('生成音频失败，请重试。');
    } finally {
      setGeneratingAudio(false);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageStatusColor = (status: Scene['imageStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudioStatusColor = (status: Scene['audioStatus']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-gray-600">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h3>
        <p className="text-gray-600 mb-6">
          {error || 'The project you are looking for does not exist.'}
        </p>
        <Link href="/" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
            >
              {project.status}
            </span>
          </div>
          <div className="text-gray-600">
            Created: {format(new Date(project.createdAt), 'MMMM d, yyyy HH:mm')}
            {project.updatedAt !== project.createdAt && (
              <span className="ml-4">
                Updated: {format(new Date(project.updatedAt), 'MMMM d, yyyy HH:mm')}
              </span>
            )}
          </div>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Back to Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Story</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{project.story}</p>
            </div>
          </div>

          {/* Script Section */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Script</h2>
              {!script && (
                <button
                  onClick={handleGenerateScript}
                  disabled={generating}
                  className="btn btn-primary"
                >
                  {generating ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Script'
                  )}
                </button>
              )}
            </div>

            {script ? (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Script ID:</span>
                      <span className="ml-2 text-sm font-mono">{script.id}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(script.createdAt), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                      {script.content}
                    </pre>
                  </div>
                </div>

                {/* Scenes Section */}
                {scenes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Scenes ({scenes.length})
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleGenerateImages}
                          disabled={generatingImages}
                          className="btn btn-primary"
                        >
                          {generatingImages ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating Images...
                            </>
                          ) : (
                            'Generate Images'
                          )}
                        </button>
                        <button
                          onClick={handleGenerateAudio}
                          disabled={generatingAudio}
                          className="btn btn-primary"
                        >
                          {generatingAudio ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating Audio...
                            </>
                          ) : (
                            'Generate Audio'
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {scenes.map(scene => (
                        <div key={scene.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-gray-900">Scene {scene.order}</span>
                              <span className="ml-3 text-sm text-gray-500">
                                Duration: {scene.duration}s
                              </span>
                              <span
                                className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getImageStatusColor(scene.imageStatus)}`}
                              >
                                Image: {scene.imageStatus}
                              </span>
                              <span
                                className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getAudioStatusColor(scene.audioStatus)}`}
                              >
                                Audio: {scene.audioStatus}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {format(new Date(scene.createdAt), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{scene.description}</p>

                          {/* Image Preview */}
                          {scene.imagePath && scene.imageStatus === 'completed' && (
                            <div className="mt-3 p-3 bg-gray-50 rounded border">
                              <div className="flex items-center mb-2">
                                <svg
                                  className="w-5 h-5 text-gray-500 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">
                                  Scene Image
                                </span>
                              </div>
                              <div className="border rounded p-3 bg-white">
                                <div className="text-sm text-gray-600 mb-2">
                                  Image path: <code className="text-xs">{scene.imagePath}</code>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <a
                                    href={`http://localhost:8081${scene.imagePath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    View Image →
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Audio Preview */}
                          {scene.audioPath && scene.audioStatus === 'completed' && (
                            <div className="mt-3 p-3 bg-purple-50 rounded border">
                              <div className="flex items-center mb-2">
                                <svg
                                  className="w-5 h-5 text-purple-500 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-purple-700">
                                  Scene Audio
                                </span>
                              </div>
                              <div className="border rounded p-3 bg-white">
                                <div className="text-sm text-gray-600 mb-2">
                                  Audio path: <code className="text-xs">{scene.audioPath}</code>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <audio controls className="w-full">
                                    <source
                                      src={`http://localhost:8081${scene.audioPath}`}
                                      type="audio/wav"
                                    />
                                    Your browser does not support the audio element.
                                  </audio>
                                  <a
                                    href={`http://localhost:8081${scene.audioPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-800 underline text-sm whitespace-nowrap"
                                  >
                                    Download →
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {scene.dialogue && (
                            <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-100">
                              <span className="text-sm font-medium text-blue-800">Dialogue:</span>
                              <p className="text-blue-700 mt-1">{scene.dialogue}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Script Generated Yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate a script from your story to create scenes for video production.
                </p>
                <button
                  onClick={handleGenerateScript}
                  disabled={generating}
                  className="btn btn-primary"
                >
                  {generating ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Script'
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-800 mb-2">
              {script ? 'Phase 2 Status' : 'Phase 1 Status'}
            </h3>
            <p className="text-blue-700 mb-4">
              {script
                ? 'Script and scenes have been generated successfully. Ready for image generation (Phase 2 media).'
                : 'This project is currently in Phase 1. Generate a script to proceed to Phase 2.'}
            </p>
            <ul className="text-blue-700 text-sm space-y-2">
              <li className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Story saved to local storage
              </li>
              <li className="flex items-center">
                <svg
                  className={`w-4 h-4 mr-2 ${script ? 'text-green-500' : 'text-gray-400'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {script ? (
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                {script ? 'Script generated' : 'Script generation (Phase 2 text)'}
              </li>
              <li className="flex items-center">
                <svg
                  className={`w-4 h-4 mr-2 ${scenes.length > 0 ? 'text-green-500' : 'text-gray-400'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {scenes.length > 0 ? (
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                {scenes.length > 0
                  ? `Scenes generated (${scenes.length})`
                  : 'Scene generation (Phase 2 text)'}
              </li>
              <li className="flex items-center">
                <svg
                  className={`w-4 h-4 mr-2 ${scenes.some(s => s.imageStatus === 'completed') ? 'text-green-500' : scenes.some(s => s.imageStatus === 'generating') ? 'text-blue-500' : 'text-gray-400'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {scenes.some(s => s.imageStatus === 'completed') ? (
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  ) : scenes.some(s => s.imageStatus === 'generating') ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                {scenes.some(s => s.imageStatus === 'completed')
                  ? `Images generated (${scenes.filter(s => s.imageStatus === 'completed').length}/${scenes.length})`
                  : scenes.some(s => s.imageStatus === 'generating')
                    ? 'Image generation in progress'
                    : 'Image generation (Phase 2 media)'}
              </li>
              <li className="flex items-center">
                <svg
                  className={`w-4 h-4 mr-2 ${scenes.some(s => s.audioStatus === 'completed') ? 'text-green-500' : scenes.some(s => s.audioStatus === 'generating') ? 'text-blue-500' : 'text-gray-400'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {scenes.some(s => s.audioStatus === 'completed') ? (
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  ) : scenes.some(s => s.audioStatus === 'generating') ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                {scenes.some(s => s.audioStatus === 'completed')
                  ? `Audio generated (${scenes.filter(s => s.audioStatus === 'completed').length}/${scenes.length})`
                  : scenes.some(s => s.audioStatus === 'generating')
                    ? 'Audio generation in progress'
                    : 'Audio generation (Phase 2 media)'}
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Video generation (Phase 3)
              </li>
            </ul>
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Info</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Project ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{project.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(project.createdAt), 'MMM d, yyyy HH:mm')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(project.updatedAt), 'MMM d, yyyy HH:mm')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Story Length</dt>
                <dd className="text-sm text-gray-900">{project.story.length} characters</dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button onClick={() => router.push('/')} className="w-full btn btn-secondary">
                View All Projects
              </button>
              <button onClick={() => router.push('/create')} className="w-full btn btn-primary">
                Create New Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
