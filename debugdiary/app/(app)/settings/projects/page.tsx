"use client"

import { useEffect, useState } from "react"
import { Folder, Pencil, Trash2, Plus, Loader2, Key, Copy, Check, Github } from "lucide-react"
import { useToast } from "@/components/Toast"

export default function ProjectsSettingsPage() {
    const { addToast } = useToast()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Project Modal state
    const [showModal, setShowModal] = useState(false)
    const [newProjectName, setNewProjectName] = useState("")
    const [saving, setSaving] = useState(false)

    // Edit Project Modal state
    const [editProject, setEditProject] = useState<any>(null)
    const [editProjectName, setEditProjectName] = useState("")
    const [editGithubRepo, setEditGithubRepo] = useState("")
    const [savingEdit, setSavingEdit] = useState(false)

    // Key Generation Modal state
    const [targetProject, setTargetProject] = useState<any>(null)
    const [newKeyLabel, setNewKeyLabel] = useState("")
    const [generatingKey, setGeneratingKey] = useState(false)
    const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects')
            if (res.ok) {
                const data = await res.json()
                setProjects(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newProjectName.trim()) return

        setSaving(true)
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProjectName })
            })

            if (res.ok) {
                const data = await res.json()
                // Initialize error count to 0 for frontend display
                data.errorCount = 0 
                setProjects([data, ...projects])
                addToast("Project created successfully", "success")
                setShowModal(false)
                setNewProjectName("")
            } else {
                addToast("Failed to create project", "error")
            }
        } catch (e) {
            addToast("An error occurred", "error")
        } finally {
            setSaving(false)
        }
    }

    const openEditModal = (project: any) => {
        setEditProject(project)
        setEditProjectName(project.name)
        setEditGithubRepo(project.githubRepo || "")
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editProjectName.trim()) return

        setSavingEdit(true)
        try {
            const res = await fetch(`/api/projects/${editProject.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: editProjectName,
                    githubRepo: editGithubRepo.trim() || null
                })
            })

            if (res.ok) {
                setProjects(projects.map(p => 
                    p.id === editProject.id 
                        ? { ...p, name: editProjectName, githubRepo: editGithubRepo.trim() || null } 
                        : p
                ))
                addToast("Project updated", "success")
                setEditProject(null)
            } else {
                const err = await res.text()
                addToast(err || "Failed to update project", "error")
            }
        } catch (e) {
            addToast("An error occurred", "error")
        } finally {
            setSavingEdit(false)
        }
    }

    const handleDelete = async (project: any) => {
        if (!confirm(`Delete project "${project.name}"? Historical entries will be kept and marked as Unassigned.`)) return

        try {
            const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
            if (res.ok) {
                setProjects(projects.filter(p => p.id !== project.id))
                addToast("Project deleted", "info")
            }
        } catch (e) {
            addToast("Failed to delete project", "error")
        }
    }

    const handleGenerateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newKeyLabel.trim() || !targetProject) return

        setGeneratingKey(true)
        try {
            const res = await fetch('/api/apikeys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newKeyLabel, projectId: targetProject.id })
            })

            if (res.ok) {
                const data = await res.json()
                setGeneratedKeyResult(data.key)
                addToast("API Key generated!", "success")
            } else {
                addToast("Failed to generate key", "error")
            }
        } catch (e) {
            addToast("An error occurred", "error")
        } finally {
            setGeneratingKey(false)
        }
    }

    const handleCopyKey = () => {
        if (generatedKeyResult) {
            navigator.clipboard.writeText(generatedKeyResult)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-syne text-3xl font-bold text-text mb-2">Projects</h1>
                    <p className="text-muted">Organize errors and API keys by application.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue hover:bg-blue/90 text-background font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm"
                >
                    <Plus className="h-4 w-4" /> Create Project
                </button>
            </div>

            {/* List */}
            {projects.length === 0 ? (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 text-center">
                    <Folder className="h-8 w-8 text-muted mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium text-text mb-1">No projects yet</h3>
                    <p className="text-sm text-muted mb-4">Create your first project to organize incoming errors.</p>
                    <button onClick={() => setShowModal(true)} className="bg-white/10 hover:bg-white/20 text-text px-4 py-2 rounded-lg text-sm transition-colors">
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map(project => (
                        <div key={project.id} className="bg-white/5 hover:bg-white-[0.07] border border-white/10 transition-colors rounded-2xl p-5 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-syne text-lg">
                                    {project.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm md:text-base flex items-center gap-2">
                                        {project.name}
                                        {project.githubRepo && <span title="GitHub Linked"><Github className="w-3.5 h-3.5 text-muted" /></span>}
                                    </p>
                                    <p className="text-white/40 text-[11px] md:text-xs">
                                        {project.errorCount} errors mapped
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setTargetProject(project)}
                                    className="p-2 bg-blue/5 hover:bg-blue/20 text-blue rounded-lg transition-colors border border-transparent hover:border-blue/20"
                                    title="Generate API Key for Project"
                                >
                                    <Key className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => openEditModal(project)}
                                    className="p-2 bg-white/5 hover:bg-white/10 text-text rounded-lg transition-colors border border-white/5"
                                    title="Edit Project"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(project)}
                                    className="p-2 bg-red-500/5 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                    title="Delete Project"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleCreate}>
                            <h2 className="text-xl font-bold mb-2">Create new project</h2>
                            <p className="text-sm text-muted mb-6">Group errors originating from a specific platform or repository.</p>

                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="e.g. Acme Web App"
                                />
                            </div>

                            <div className="flex flex-row justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false)
                                        setNewProjectName("")
                                    }}
                                    className="px-5 py-2.5 bg-transparent border border-white/10 text-white/70 rounded-xl hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving || !newProjectName.trim()}
                                    className="px-5 py-2.5 bg-blue hover:bg-blue/90 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                                >
                                    {saving ? 'Creating...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleSaveEdit}>
                            <h2 className="text-xl font-bold mb-2">Edit Project</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">Project Name</label>
                                    <input
                                        type="text"
                                        value={editProjectName}
                                        onChange={e => setEditProjectName(e.target.value)}
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">GitHub Repository URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={editGithubRepo}
                                        onChange={e => setEditGithubRepo(e.target.value)}
                                        placeholder="https://github.com/username/repo"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setEditProject(null)}
                                    className="px-5 py-2.5 bg-transparent border border-white/10 text-white/70 rounded-xl hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingEdit || !editProjectName.trim()}
                                    className="px-5 py-2.5 bg-blue hover:bg-blue/90 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                                >
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* GENERATE API KEY MODAL */}
            {targetProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0c0f14] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        {generatedKeyResult ? (
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                                    <Check className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-bold mb-2 text-text">API Key Generated</h2>
                                <p className="text-sm text-amber-400 mb-6 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                    Copy this key now. You won't be able to see it again!
                                </p>
                                
                                <div className="flex items-center gap-2 mb-8 bg-black/40 border border-white/10 rounded-lg p-3">
                                    <code className="text-sm text-green-400 flex-1 truncate font-mono text-left select-all">
                                        {generatedKeyResult}
                                    </code>
                                    <button 
                                        onClick={handleCopyKey}
                                        className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/70 hover:text-white"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        setGeneratedKeyResult(null)
                                        setTargetProject(null)
                                        setNewKeyLabel("")
                                    }}
                                    className="w-full px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleGenerateKey}>
                                <h2 className="text-xl font-bold mb-2">Create API Key</h2>
                                <p className="text-sm text-muted mb-6">Generate a new SDK key linked to <strong>{targetProject.name}</strong>.</p>

                                <div className="space-y-2 mb-6">
                                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">Key Label</label>
                                    <input
                                        type="text"
                                        value={newKeyLabel}
                                        onChange={e => setNewKeyLabel(e.target.value)}
                                        required
                                        autoFocus
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
                                        placeholder="e.g. Production Environment"
                                    />
                                </div>

                                <div className="flex flex-row justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTargetProject(null)
                                            setNewKeyLabel("")
                                        }}
                                        className="px-5 py-2.5 bg-transparent border border-white/10 text-white/70 rounded-xl hover:bg-white/5 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={generatingKey || !newKeyLabel.trim()}
                                        className="px-5 py-2.5 bg-blue hover:bg-blue/90 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                                    >
                                        {generatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />} Generate Key
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}
