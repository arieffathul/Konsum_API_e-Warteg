$(document).ready(function () {
    // Periksa token
    var token = localStorage.getItem('token');
    if (!token) {
        // Jika token tidak ditemukan, arahkan ke halaman login
        window.location.href = '../login.html';
        return;
    }

    var dataUrl = 'http://127.0.0.1:8000/api/admin/makanans';
    var imgurl = 'http://127.0.0.1:8000/storage/';
    var kategoriUrl = 'http://127.0.0.1:8000/api/admin/categories'; // URL untuk kategori

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
                // Pengguna adalah admin, lanjutkan dengan mendapatkan data makanan
                $.ajax({
                    url: dataUrl,
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.success && Array.isArray(data.data.makanan)) {
                            createTable(data.data.makanan);
                        } else {
                            $('#dataResult').text('Data fetched is not valid.');
                        }
                    },
                    error: handleError
                });
                loadKategori(); // Panggil loadKategori setelah mendapatkan data pengguna
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
    function createTable(data) {
        var tableBody = $('#table-body');
        tableBody.empty();

        data.forEach(function (makanan, index) {
            var row = $('<tr></tr>');
            row.append('<td>' + (index + 1) + '</td>');
            row.append('<td>' + makanan.name + '</td>'); // Updated property name

            // Menyusun URL gambar dengan benar
            var imageUrl = imgurl + makanan.image; // Updated property name
            row.append('<td><img src="' + imageUrl + '" alt="Image" style="max-width: 100px; max-height: 100px;"></td>');

            row.append('<td>' + (makanan.description || '-') + '</td>'); // Updated property name
            row.append('<td>' + makanan.price + '</td>'); // Updated property name
            row.append('<td>' + (makanan.stock !== null ? makanan.stock : '-') + '</td>'); // Updated property name
            row.append('<td>' + (makanan.category ? makanan.category.name : '-') + '</td>'); // Updated property name

            // Tambahkan tombol Update dan Delete
            var actionButtons = $('<td></td>').addClass('action-buttons');
            var updateButton = $('<button class="btn btn-primary update-btn d-inline">Update</button>').attr('data-id', makanan.id);
            var deleteButton = $('<button class="btn btn-danger delete-btn d-inline">Delete</button>').attr('data-id', makanan.id);
            actionButtons.append(updateButton).append(deleteButton);
            row.append(actionButtons);
    
            tableBody.append(row);
        });

        // Tambahkan event listener untuk tombol Update
        $('.update-btn').on('click', function () {
            var id = $(this).data('id');
            window.location.href = 'update_food.html?id=' + id;
        });

        // Tambahkan event listener untuk tombol Delete
        $('.delete-btn').on('click', function () {
            var id = $(this).data('id');
            deleteMakanan(id);
        });

        function deleteMakanan(id) {
            // Konfirmasi pengguna sebelum menghapus
            if (confirm("Apakah Anda yakin ingin menghapus makanan ini?")) {
                $.ajax({
                    url: 'http://127.0.0.1:8000/api/admin/makanans/' + id,
                    type: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    success: function (response) {
                        // Hapus baris dari tabel setelah berhasil menghapus dari server
                        $('tr[data-id="' + id + '"]').remove(); // Hapus baris yang terkait dari tabel
                        $('#dataResult').text('Makanan berhasil dihapus.');

                        // Refresh halaman setelah menghapus
                        location.reload();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error: ' + textStatus, errorThrown);
                        $('#dataResult').text('Gagal menghapus makanan: ' + textStatus);
                    }
                });
            }
        }
    }
});
