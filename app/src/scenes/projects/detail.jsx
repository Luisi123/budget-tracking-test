import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import api from "@/services/api"

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    description: "",
  })

  useEffect(() => {
    fetchProjectAndExpenses()
  }, [id])

  async function fetchProjectAndExpenses() {
    try {
      const projectRes = await api.get(`/project/${id}`)
      if (!projectRes.ok) {
        toast.error("Project not found")
        navigate("/")
        return
      }

      const expensesRes = await api.get(`/expense/project/${id}`)
      if (!expensesRes.ok) return toast.error("Failed to fetch expenses")

      setProject(projectRes.data)
      setExpenses(expensesRes.data)
    } catch (error) {
      console.error(error)
      toast.error("Error loading project")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateExpense(e) {
    e.preventDefault()

    if (!newExpense.amount) {
      return toast.error("Please enter an amount")
    }

    try {
      const { ok, data } = await api.post("/expense", {
        projectId: id,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category || "Uncategorized",
        description: newExpense.description,
      })

      if (!ok) return toast.error("Failed to create expense")

      toast.success("Expense added!")
      setExpenses([data, ...expenses])
      setShowModal(false)
      setNewExpense({ amount: "", category: "", description: "" })
    } catch (error) {
      console.error(error)
      toast.error("Error creating expense")
    }
  }

  async function handleDeleteExpense(expenseId) {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      const { ok } = await api.delete(`/expense/${expenseId}`)
      if (!ok) return toast.error("Failed to delete expense")

      toast.success("Expense deleted")
      setExpenses(expenses.filter((e) => e._id !== expenseId))
    } catch (error) {
      console.error(error)
      toast.error("Error deleting expense")
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Project not found</div>
      </div>
    )
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const remainingBudget = project.budget - totalExpenses
  const percentageUsed = (totalExpenses / project.budget) * 100
  const isOverBudget = totalExpenses > project.budget

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Back to Projects
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.name}</h1>

          <div className="grid md:grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${project.budget.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
                ${totalExpenses.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Budget Usage</span>
              <span className="font-medium">{percentageUsed.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isOverBudget ? "bg-red-500" : percentageUsed > 80 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          {isOverBudget && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ This project is over budget by ${(totalExpenses - project.budget).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Add Expense
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No expenses yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 hover:underline"
              >
                Add your first expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {expense.category}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </span>
                    </div>
                    {expense.description && (
                      <p className="text-gray-600 mt-1">{expense.description}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense._id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleCreateExpense}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 150.00"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Marketing, Development, Design"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What was this expense for?"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Expense
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

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  )
}
