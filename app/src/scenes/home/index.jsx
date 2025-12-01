import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "@/services/api"

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: "", budget: "" })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const { ok, data } = await api.get("/project")
      if (!ok) return toast.error("Failed to fetch projects")
      setProjects(data)
    } catch (error) {
      console.error(error)
      toast.error("Error loading projects")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault()
    
    if (!newProject.name || !newProject.budget) {
      return toast.error("Please fill in all fields")
    }

    try {
      const { ok, data } = await api.post("/project", {
        name: newProject.name,
        budget: parseFloat(newProject.budget),
      })
      
      if (!ok) return toast.error("Failed to create project")
      
      toast.success("Project created!")
      setProjects([data, ...projects])
      setShowModal(false)
      setNewProject({ name: "", budget: "" })
    } catch (error) {
      console.error(error)
      toast.error("Error creating project")
    }
  }

  async function handleDeleteProject(id) {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const { ok } = await api.delete(`/project/${id}`)
      if (!ok) return toast.error("Failed to delete project")
      
      toast.success("Project deleted")
      setProjects(projects.filter((p) => p._id !== id))
    } catch (error) {
      console.error(error)
      toast.error("Error deleting project")
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No projects yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:underline"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
                onClick={() => navigate(`/project/${project._id}`)}
              />
            ))}
          </div>
        )}

        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Website Redesign"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10000"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project, onDelete, onClick }) {
  const [expenses, setExpenses] = useState([])
  const [totalExpenses, setTotalExpenses] = useState(0)

  useEffect(() => {
    fetchExpenses()
  }, [project._id])

  async function fetchExpenses() {
    try {
      const { ok, data } = await api.get(`/expense/project/${project._id}`)
      if (!ok) return
      setExpenses(data)
      const total = data.reduce((sum, exp) => sum + exp.amount, 0)
      setTotalExpenses(total)
    } catch (error) {
      console.error(error)
    }
  }

  const percentageUsed = (totalExpenses / project.budget) * 100
  const isOverBudget = totalExpenses > project.budget

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition cursor-pointer relative"
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(project._id)
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 pr-8">{project.name}</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Budget</span>
          <span className="font-medium">${project.budget.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Spent</span>
          <span className={`font-medium ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
            ${totalExpenses.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isOverBudget ? "bg-red-500" : percentageUsed > 80 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ Over budget by ${(totalExpenses - project.budget).toFixed(2)}
          </p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
      </div>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  )
}
