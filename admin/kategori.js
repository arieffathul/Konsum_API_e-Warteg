$(document).ready(function () {
    // Periksa token
    var token = localStorage.getItem('token');
    if (!token) {
        // Jika token tidak ditemukan, arahkan ke halaman login
        window.location.href = '../login.html';
        return;
    }

    var dataUrl = 'http://127.0.0.1:8000/api/admin/categories';
    
    function handleError(jqXHR, textStatus, errorThrown) {
        console.error('Error: ' + textStatus, errorThrown);
        $('#dataResult').text('Error: ' + textStatus + ' ' + errorThrown);
    }

    // Periksa peran pengguna
    $.ajax({
        url: 'http://127.0.0.1:8000/api/user',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        dataType: 'json',
        success: function (response) {
            if (response.role === 'admin') { // Ubah cara mengakses peran pengguna
                // Pengguna adalah admin, lanjutkan dengan mendapatkan data kategori
                $.ajax({
                    url: dataUrl,
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.success && Array.isArray(data.data.categories)) {
                            createTable(data.data.categories);
                        } else {
                            $('#dataResult').text('Data fetched is not valid.');
                        }
                    },
                    error: handleError
                });
            } else {
                // Jika bukan admin, arahkan ke halaman pembeli
                window.location.href = '../pembeli/index.html';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error: ' + textStatus, errorThrown);
            // Jika terjadi kesalahan (misalnya token tidak valid), arahkan ke halaman login
            window.location.href = '../login.html';
        }
    });

    // Fungsi untuk membuat tabel
    function createTable(categories) {
        var tableBody = $('#table-body');
        tableBody.empty();

        categories.forEach(function (category, index) {
            var row = $('<tr></tr>');
            row.append('<td>' + (index + 1) + '</td>');
            row.append('<td>' + category.name + '</td>'); // Updated property name
            row.append('<td>' + (category.description || '-') + '</td>'); // Updated property name

            // Tambahkan tombol Update dan Delete
            var actionButtons = $('<td></td>').addClass('action-buttons');
            var updateButton = $('<button class="btn btn-primary update-btn d-inline">Update</button>').attr('data-id', category.id);
            var deleteButton = $('<button class="btn btn-danger delete-btn d-inline">Delete</button>').attr('data-id', category.id);
            actionButtons.append(updateButton).append(deleteButton);
            row.append(actionButtons);
    
            tableBody.append(row);
        });

        // Tambahkan event listener untuk tombol Update
        $('.update-btn').on('click', function () {
            var id = $(this).data('id');
            window.location.href = 'update_kategori.html?id=' + id; // Ganti dengan halaman update kategori
        });

        // Tambahkan event listener untuk tombol Delete
        $('.delete-btn').on('click', function () {
            var id = $(this).data('id');
            deleteCategory(id);
        });
    }

    // Fungsi untuk menghapus kategori
    function deleteCategory(id) {
        // Konfirmasi pengguna sebelum menghapus
        if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
            $.ajax({
                url: 'http://127.0.0.1:8000/api/admin/categories/' + id,
                type: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                success: function (response) {
                    // Hapus baris dari tabel setelah berhasil menghapus dari server
                    $('tr[data-id="' + id + '"]').remove(); // Hapus baris yang terkait dari tabel
                    $('#dataResult').text('Kategori berhasil dihapus.');

                    // Refresh halaman setelah menghapus
                    location.reload();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error: ' + textStatus, errorThrown);
                    $('#dataResult').text('Gagal menghapus kategori: ' + textStatus);
                }
            });
        }
    }
});
