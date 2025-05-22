"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { getSupabase } from "../lib/supabase-client"

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Extract token from URL
  useEffect(() => {
    // URL pattern: /auth/reset-password#access_token=...&token_type=...
    const hash = location.hash
    if (!hash || hash.length < 2) {
      setError("Invalid or missing reset token. Please request a new password reset link.")
      return
    }
  }, [location])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    // Extract token from URL hash
    const hash = location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get("access_token")

    try {
      const supabase = getSupabase()

      // Use the token to set the new password
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)

      // After 3 seconds, redirect to login
      setTimeout(() => {
        navigate("/auth")
      }, 3000)
    } catch (error) {
      console.error("Password reset error:", error.message)
      setError(error.message || "Failed to reset password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#164e63] flex flex-col items-center justify-center p-4">
      <div className="fixed top-0 inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[30%] -left-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-teal-400" />
            <span className="text-xl font-bold text-white">EduBengali</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#1e293b]/70 to-[#1e293b]/40 border border-gray-700/50 backdrop-blur-sm text-white rounded-xl shadow-xl"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold">Reset Your Password</h2>
            <p className="text-gray-400 mt-2">Create a new password for your account.</p>
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Password Reset Successfully!</h3>
                <p className="text-gray-300 mb-6">
                  Your password has been reset. You'll be redirected to the login page in a few seconds.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-md flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-[#0a192f]/50 border border-gray-700 text-white w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-[#0a192f]/50 border border-gray-700 text-white w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <button
                    className={`w-full mt-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white p-3 rounded-lg font-medium transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center ${
                      isSubmitting ? "opacity-80 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : null}
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
