'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AdminUser,
  UserRole,
  changeUserPassword,
  changeUserStatus,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '@/services/api';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    role: UserRole;
  }>({
    username: '',
    password: '',
    role: 'ADMIN',
  });

  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch (error) {
        console.error('JWT invalide', error);
      }
    }

    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      await createUser(newUser);

      setNewUser({
        username: '',
        password: '',
        role: 'ADMIN',
      });

      setIsCreateOpen(false);

      await fetchUsers();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    setIsSaving(true);

    try {
      await updateUser(editingUser.ID, {
        username: editingUser.username,
        role: editingUser.role,
      });

      if (editPassword.trim() !== '') {
        await changeUserPassword(
          editingUser.ID,
          editPassword
        );
      }

      setEditingUser(null);
      setEditPassword('');
      setShowEditPassword(false);

      await fetchUsers();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erreur lors de la modification'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatus = async (user: AdminUser) => {
    try {
      await changeUserStatus(
        user.ID,
        !user.isActive
      );

      await fetchUsers();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erreur lors du changement de statut'
      );
    }
  };

  const handleDelete = async (user: AdminUser) => {
    const confirmed = confirm(
      `Supprimer l'utilisateur "${user.username}" ?`
    );

    if (!confirmed) return;

    try {
      await deleteUser(user.ID);

      await fetchUsers();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'Erreur lors de la suppression'
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FA]">

      {/* HEADER */}
      <header className="h-20 bg-white border-b border-stone-100 flex items-center justify-between px-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-stone-900">
            Gestion Utilisateurs
          </h1>

          <p className="text-xs text-stone-400 font-bold uppercase tracking-[0.2em]">
            Restaurant Borne Tactile
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#006747] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform"
        >
          + Nouvel utilisateur
        </button>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-10">

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">

          <h2 className="text-xl font-black mb-8">
            👥 Utilisateurs
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#006747] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b text-left text-xs uppercase text-stone-400">
                    <th className="pb-4">
                      Utilisateur
                    </th>

                    <th className="pb-4">
                      Rôle
                    </th>

                    <th className="pb-4">
                      Statut
                    </th>

                    <th className="pb-4">
                      Créé le
                    </th>

                    <th className="pb-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {users.map((user) => (
                    <tr key={user.ID}>

                      <td className="py-5 font-bold">
                        {user.username}
                      </td>

                      <td className="py-5">
                        <span className="px-3 py-1 rounded-lg bg-stone-100 text-xs font-bold">
                          {user.role}
                        </span>
                      </td>

                      <td className="py-5">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            user.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive
                            ? 'Actif'
                            : 'Désactivé'}
                        </span>
                      </td>

                      <td className="py-5 text-stone-500 text-sm">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : '-'}
                      </td>

                      <td className="py-5">

                        <div className="flex flex-wrap justify-center gap-2">

                          {/* MODIFIER */}
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditPassword('');
                              setShowEditPassword(false);
                            }}
                            className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-bold text-xs flex items-center gap-2"
                          >
                            <span>✏️</span>
                            Modifier
                          </button>

                          {/* CURRENT USER */}
                          {currentUserId === user.ID ? (
                            <span className="px-3 py-2 rounded-xl bg-[#006747]/10 text-[#006747] font-bold text-xs flex items-center gap-2">
                              <span>👤</span>
                              Votre compte
                            </span>
                          ) : (
                            <>
                              {/* ACTIVATE / DEACTIVATE */}
                              <button
                                onClick={() => handleStatus(user)}
                                className={`px-3 py-2 rounded-xl transition-colors font-bold text-xs flex items-center gap-2 ${
                                  user.isActive
                                    ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                              >
                                <span>
                                  {user.isActive ? '⛔' : '✅'}
                                </span>

                                {user.isActive
                                  ? 'Désactiver'
                                  : 'Activer'}
                              </button>

                              {/* DELETE */}
                              <button
                                onClick={() => handleDelete(user)}
                                className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-xs flex items-center gap-2"
                              >
                                <span>🗑️</span>
                                Supprimer
                              </button>
                            </>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">

          <form
            onSubmit={handleCreate}
            className="bg-white p-8 rounded-[2rem] w-full max-w-md space-y-5 shadow-2xl"
          >

            <h2 className="text-2xl font-black">
              Nouvel utilisateur
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">
                Nom utilisateur
              </label>

              <input
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    username: e.target.value,
                  })
                }
                placeholder="Nom utilisateur"
                className="w-full border rounded-xl p-4"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">
                Mot de passe
              </label>

              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    password: e.target.value,
                  })
                }
                placeholder="Mot de passe"
                className="w-full border rounded-xl p-4"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">
                Rôle
              </label>

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full border rounded-xl p-4"
              >
                <option value="ADMIN">
                  ADMIN
                </option>

                <option value="SUPER_ADMIN">
                  SUPER_ADMIN
                </option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  setIsCreateOpen(false)
                }
                className="flex-1 bg-stone-100 p-4 rounded-xl font-bold hover:bg-stone-200"
              >
                Annuler
              </button>

              <button
                disabled={isSaving}
                type="submit"
                className="flex-1 bg-[#006747] text-white p-4 rounded-xl font-bold disabled:opacity-50"
              >
                {isSaving
                  ? 'Création...'
                  : 'Créer'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">

          <form
            onSubmit={handleUpdate}
            className="bg-white p-8 rounded-[2rem] w-full max-w-md space-y-5 shadow-2xl"
          >

            <h2 className="text-2xl font-black">
              Modifier utilisateur
            </h2>

            {/* USERNAME */}
            <div>

              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">
                Nom utilisateur
              </label>

              <input
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    username: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-4"
                required
              />

            </div>

            {/* ROLE */}
            <div>

              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">
                Rôle
              </label>

              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full border rounded-xl p-4"
              >
                <option value="ADMIN">
                  ADMIN
                </option>

                <option value="SUPER_ADMIN">
                  SUPER_ADMIN
                </option>
              </select>

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block text-xs font-bold text-stone-400 uppercase mb-2">
                Nouveau mot de passe
              </label>

              <div className="relative">

                <input
                  type={
                    showEditPassword
                      ? 'text'
                      : 'password'
                  }
                  value={editPassword}
                  onChange={(e) =>
                    setEditPassword(
                      e.target.value
                    )
                  }
                  placeholder="Laisser vide pour ne pas modifier"
                  className="w-full border rounded-xl p-4 pr-12"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowEditPassword(
                      !showEditPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                  aria-label={
                    showEditPassword
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                >
                  {showEditPassword
                    ? '🙈'
                    : '👁️'}
                </button>

              </div>

              <p className="text-xs text-stone-400 mt-2">
                Laissez ce champ vide si vous ne souhaitez pas changer le mot de passe.
              </p>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setEditPassword('');
                  setShowEditPassword(false);
                }}
                className="flex-1 bg-stone-100 p-4 rounded-xl font-bold hover:bg-stone-200"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-[#006747] text-white p-4 rounded-xl font-bold disabled:opacity-50"
              >
                {isSaving
                  ? 'Enregistrement...'
                  : 'Enregistrer'}
              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}