'use client'

import { useState, useEffect } from 'react'
import { listAdminUsers, addAdminUser, deleteAdminUser, changeAdminPassword, toggleAdminStatus } from './actions'
import { Users, Loader2, Plus, Search, X, Eye, EyeOff, Shield, Trash2, Key, UserX, UserCheck } from 'lucide-react'

type AdminUser = {
  id: string
  email?: string
  created_at: string
  last_sign_in_at?: string
  is_disabled?: boolean
  role?: string
  name?: string
}

export default function UsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  
  // Action State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
    } else {
      const lowerQ = searchQuery.toLowerCase()
      setFilteredUsers(users.filter(u => u.email?.toLowerCase().includes(lowerQ)))
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const result = await listAdminUsers()
      if (result.error) {
        setFetchError(result.error)
      } else if (result.users) {
        setUsers(result.users)
        setFilteredUsers(result.users)
      }
    } catch (err) {
      setFetchError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAdding(true)
    setAddError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await addAdminUser(formData)
      if (result.error) {
        setAddError(result.error)
      } else {
        await fetchUsers()
        closeModal()
      }
    } catch (err) {
      setAddError('An unexpected error occurred while creating the user.')
    } finally {
      setIsAdding(false)
    }
  }

  const openModal = () => {
    setAddError('')
    setShowPassword(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openPasswordModal = (userId: string) => {
    setSelectedUserId(userId)
    setPasswordError('')
    setShowPassword(false)
    setIsPasswordModalOpen(true)
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setSelectedUserId(null)
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedUserId) return

    setIsChangingPassword(true)
    setPasswordError('')

    const formData = new FormData(e.currentTarget)
    formData.append('id', selectedUserId)
    
    try {
      const result = await changeAdminPassword(formData)
      if (result.error) {
        setPasswordError(result.error)
      } else {
        alert('Password changed successfully')
        closePasswordModal()
      }
    } catch (err) {
      setPasswordError('An unexpected error occurred.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return

    setActionLoadingId(userId)
    try {
      const result = await deleteAdminUser(userId)
      if (result.error) {
        alert(result.error)
      } else {
        await fetchUsers()
      }
    } catch (err) {
      alert('Failed to delete user.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleToggleStatus = async (userId: string, currentDisabled: boolean) => {
    setActionLoadingId(userId)
    try {
      const result = await toggleAdminStatus(userId, !currentDisabled)
      if (result.error) {
        alert(result.error)
      } else {
        await fetchUsers()
      }
    } catch (err) {
      alert('Failed to update user status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f1d33]">Admin Users</h1>
          <p className="mt-2 text-sm text-[#5a6a82]">
            Manage users with access to this dashboard.
          </p>
        </div>
        <button
          onClick={openModal}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#c4a55a] to-[#b3954c] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#c4a55a]/20 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </button>
      </div>

      <div className="rounded-xl border border-[#e8ecf2] bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e8ecf2] bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6a82]" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] text-sm text-[#0f1d33] focus:border-[#1e3a5f] outline-none transition-colors"
            />
          </div>
          <div className="text-sm text-[#5a6a82] font-medium whitespace-nowrap">
            Total Admins: {filteredUsers.length}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" />
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center text-sm text-red-600">
              {fetchError}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f8fa] border-b border-[#e8ecf2]">
                <tr>
                  <th className="px-6 py-4 font-medium text-[#0f1d33] w-16">Sr.No</th>
                  <th className="px-6 py-4 font-medium text-[#0f1d33]">Email Address</th>
                  <th className="px-6 py-4 font-medium text-[#0f1d33]">Role</th>
                  <th className="px-6 py-4 font-medium text-[#0f1d33]">Status</th>
                  <th className="px-6 py-4 font-medium text-[#0f1d33]">Date Added</th>
                  <th className="px-6 py-4 font-medium text-[#0f1d33]">Last Sign In</th>
                  <th className="px-6 py-4 font-medium text-[#0f1d33] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ecf2]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#5a6a82]">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-[#f3f5f8] transition-colors group">
                      <td className="px-6 py-4 text-[#5a6a82]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#e8ecf2] flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 text-[#1e3a5f]" />
                          </div>
                          <div>
                            {user.name && <div className="font-medium text-[#0f1d33]">{user.name}</div>}
                            <div className={`${user.name ? 'text-xs text-[#5a6a82]' : 'font-medium text-[#1e3a5f]'}`}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200 capitalize">
                          {user.role || 'admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_disabled ? (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200">
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#5a6a82]">
                        {(() => {
                          const d = new Date(user.created_at)
                          return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
                        })()}
                      </td>
                      <td className="px-6 py-4 text-[#5a6a82]">
                        {user.last_sign_in_at ? (
                          (() => {
                            const d = new Date(user.last_sign_in_at)
                            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
                          })()
                        ) : (
                          <span className="italic">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user.id, user.is_disabled || false)}
                            disabled={actionLoadingId === user.id}
                            title={user.is_disabled ? "Enable user" : "Disable user"}
                            className={`p-1.5 rounded transition-all disabled:opacity-50 ${
                              user.is_disabled 
                                ? "text-emerald-600 hover:bg-emerald-50" 
                                : "text-amber-600 hover:bg-amber-50"
                            }`}
                          >
                            {user.is_disabled ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openPasswordModal(user.id)}
                            disabled={actionLoadingId === user.id}
                            title="Change password"
                            className="p-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded transition-all disabled:opacity-50"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={actionLoadingId === user.id}
                            title="Delete user"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                          >
                            {actionLoadingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#c4a55a]" />
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center text-sm text-red-600">
              {fetchError}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#e8ecf2]">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-[#5a6a82]">
                  No users found matching your search.
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div key={`mobile-${user.id}`} className="p-4 flex flex-col gap-3 hover:bg-[#f3f5f8] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#e8ecf2] flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-[#1e3a5f]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {user.name && <div className="font-semibold text-[#0f1d33] text-base truncate">{user.name}</div>}
                        <div className={`truncate ${user.name ? 'text-sm text-[#5a6a82]' : 'font-semibold text-[#1e3a5f] text-base'}`}>{user.email}</div>
                      </div>
                      <div>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200 capitalize">
                          {user.role || 'admin'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm ml-[3.25rem]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#5a6a82]">Status</span>
                        {user.is_disabled ? (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 border border-red-200 w-fit">
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200 w-fit">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#5a6a82]">Last Sign In</span>
                        <span className="text-[#0f1d33] font-medium">
                          {user.last_sign_in_at ? (
                            (() => {
                              const d = new Date(user.last_sign_in_at)
                              return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
                            })()
                          ) : (
                            <span className="italic">Never</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[#e8ecf2]">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_disabled || false)}
                        disabled={actionLoadingId === user.id}
                        title={user.is_disabled ? "Enable user" : "Disable user"}
                        className={`p-1.5 rounded transition-all disabled:opacity-50 ${
                          user.is_disabled 
                            ? "text-emerald-600 hover:bg-emerald-50" 
                            : "text-amber-600 hover:bg-amber-50"
                        }`}
                      >
                        {user.is_disabled ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openPasswordModal(user.id)}
                        disabled={actionLoadingId === user.id}
                        title="Change password"
                        className="p-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded transition-all disabled:opacity-50"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={actionLoadingId === user.id}
                        title="Delete user"
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                      >
                        {actionLoadingId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e8ecf2] px-6 py-4">
              <h3 className="text-lg font-semibold text-[#0f1d33] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#c4a55a]" />
                Add Admin User
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-[#5a6a82] hover:bg-[#f3f5f8] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddUser} className="space-y-4">
                {addError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                    {addError}
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#0f1d33] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0f1d33] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-[#0f1d33] mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    defaultValue="Telecaller"
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f] appearance-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Telecaller">Telecaller</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#0f1d33] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 pr-10 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5a6a82] hover:text-[#0f1d33]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-[#5a6a82] hover:bg-[#f3f5f8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="inline-flex items-center justify-center rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f1d33] transition-colors disabled:opacity-50"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e8ecf2] px-6 py-4">
              <h3 className="text-lg font-semibold text-[#0f1d33] flex items-center gap-2">
                <Key className="w-5 h-5 text-[#c4a55a]" />
                Change Password
              </h3>
              <button
                onClick={closePasswordModal}
                className="rounded-lg p-1.5 text-[#5a6a82] hover:bg-[#f3f5f8] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                    {passwordError}
                  </div>
                )}
                
                <p className="text-sm text-[#5a6a82] mb-4">
                  Enter a new password for this user. The old password is not required.
                </p>

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-[#0f1d33] mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="new_password"
                      required
                      minLength={6}
                      className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 pr-10 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5a6a82] hover:text-[#0f1d33]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-[#5a6a82] hover:bg-[#f3f5f8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center justify-center rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f1d33] transition-colors disabled:opacity-50"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
