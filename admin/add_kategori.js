$(document).ready(function () {
    // Periksa token
    var token = localStorage.getItem('token');
    if (!token) {
        // Jika token tidak ditemukan, arahkan ke halaman login
        window.location.href = '../login.html';
        return;
    }

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

    $('#addKategori').on('submit', function (e) {
        e.preventDefault();

        var formData = {
            name: $('#nama').val(),
            description: $('#deskripsi').val()
        };

        $.ajax({
            url: kategoriUrl,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    $('#addResult').text('Kategori berhasil ditambahkan.');
                    setTimeout(function () {
                        window.location.href = 'kategori.html';
                    }, 2000); // Tunggu 2 detik sebelum mengarahkan ke kategori.html
                } else {
                    $('#addResult').text('Gagal menambahkan kategori: ' + response.message);
                }
            },
            error: handleError
        });
    });
})
