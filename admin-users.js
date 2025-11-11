document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('admin-users-table');
    const authToken = localStorage.getItem('authToken');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

    // التحقق من صلاحيات المسؤول
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost/amoory_store_backend/users_management.php', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 403) {
                alert('الوصول مرفوض. يجب أن تكون مسؤولاً.');
                window.location.href = 'index.html';
                return;
            }

            if (!response.ok) throw new Error('فشل في جلب المستخدمين');

            const users = await response.json();
            displayUsers(users);

        } catch (error) {
            console.error('Error fetching users:', error);
            usersTableBody.innerHTML = `<tr><td colspan="5">حدث خطأ أثناء تحميل المستخدمين.</td></tr>`;
        }
    }

    function displayUsers(users) {
        usersTableBody.innerHTML = '';
        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="5">لا يوجد مستخدمون مسجلون.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const isCurrentUser = user.id === loggedInUser.id;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <select class="role-changer" data-user-id="${user.id}" ${isCurrentUser ? 'disabled' : ''}>
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مسؤول</option>
                    </select>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('ar-EG')}</td>
                <td class="actions">
                    <button class="remove-btn delete-user-btn" data-user-id="${user.id}" ${isCurrentUser ? 'disabled' : ''}>حذف</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }

    async function updateUserRole(userId, newRole) {
        try {
            const response = await fetch(`http://localhost/amoory_store_backend/users_management.php?id=${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            const result = await response.json();
            showToast(result.message || 'حدث خطأ.');
            if (response.ok) fetchUsers();

        } catch (error) {
            console.error('Error updating role:', error);
            showToast('حدث خطأ أثناء تحديث الدور.');
        }
    }

    async function deleteUser(userId) {
        if (!confirm('هل أنت متأكد من أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        try {
            const response = await fetch(`http://localhost/amoory_store_backend/users_management.php?id=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            const result = await response.json();
            showToast(result.message || 'حدث خطأ.');
            if (response.ok) fetchUsers();

        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('حدث خطأ أثناء حذف المستخدم.');
        }
    }

    usersTableBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('role-changer')) {
            updateUserRole(e.target.dataset.userId, e.target.value);
        }
    });

    usersTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-user-btn')) {
            deleteUser(e.target.dataset.userId);
        }
    });

    fetchUsers();
});