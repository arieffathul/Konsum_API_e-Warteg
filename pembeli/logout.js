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
            if (response.role === 'pembeli') { // Ubah cara mengakses peran pengguna
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

    // Fungsi untuk logout
    function logout() {
        // Hapus token dari localStorage
        localStorage.removeItem('token');
        // Arahkan ke halaman login
        window.location.href = '../login.html';
    }

    // Fungsi untuk konfirmasi logout
    function confirmLogout() {
        if (confirm("Apakah Anda yakin ingin logout?")) {
            logout();
        }
    }

    // Tambahkan event listener ke tombol logout
    $('#logoutButton').on('click', function () {
        confirmLogout();
    });

});
