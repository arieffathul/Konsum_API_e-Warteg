$(document).ready(function () {
    // Periksa token
    var token = localStorage.getItem('token');
    if (!token) {
        // Jika token tidak ditemukan, arahkan ke halaman login
        window.location.href = '../login.html';
        return;
    }

    var kategoriUrl = 'http://127.0.0.1:8000/api/admin/categories';
    
    // Ambil ID dari URL
    var urlParams = new URLSearchParams(window.location.search);
    var kategoriId = urlParams.get('id');

    function handleError(jqXHR, textStatus, errorThrown) {
        console.error('Error: ' + textStatus, errorThrown);
        $('#updateResult').text('Error: ' + textStatus + ' ' + errorThrown);
    }

    // Periksa peran pengguna dan muat kategori
    $.ajax({
        url: 'http://127.0.0.1:8000/api/user',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        dataType: 'json',
        success: function (response) {
            if (response.role === 'admin') {
                loadKategori(); // Panggil loadKategori setelah memeriksa peran pengguna
            } else {
                window.location.href = '../pembeli/index.html';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error: ' + textStatus, errorThrown);
            window.location.href = '../login.html';
        }
    });

    // Fungsi untuk mengisi form dengan data kategori
    function fillForm(data) {
        $('#nama').val(data.name);
        $('#deskripsi').val(data.description || '');
    }

    // Fungsi untuk mengambil data kategori berdasarkan ID
    function getKategoriById(id) {
        $.ajax({
            url: `${kategoriUrl}/${id}`,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: 'json',
            success: function (response) {
                if (response.success && response.data.category) {
                    fillForm(response.data.category);
                } else {
                    $('#updateResult').text('Failed to fetch category data.');
                }
            },
            error: handleError
        });
    }

    // Fungsi untuk memuat kategori
    function loadKategori() {
        $.ajax({
            url: kategoriUrl,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: 'json',
            success: function (data) {
                if (data.success && Array.isArray(data.data.categories)) {
                    getKategoriById(kategoriId);
                } else {
                    console.error('Unexpected response format:', data);
                }
            },
            error: handleError
        });
    }

    // Fungsi untuk menangani pengiriman form
    $('#updateKategori').on('submit', function (e) {
        e.preventDefault();

        var formData = {
            name: $('#nama').val(),
            description: $('#deskripsi').val()
        };

        $.ajax({
            url: `${kategoriUrl}/${kategoriId}`,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    $('#updateResult').text('Kategori berhasil diperbarui.');
                    setTimeout(function () {
                        window.location.href = 'kategori.html';
                    }, 2000); // Tunggu 2 detik sebelum mengarahkan ke kategori.html
                } else {
                    $('#updateResult').text('Gagal memperbarui kategori: ' + response.message);
                }
            },
            error: handleError
        });
    });
});
