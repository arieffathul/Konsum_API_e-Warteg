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


    function loadKategori() {
        $.ajax({
            url: kategoriUrl,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: 'json',
            success: function (data) {
                console.log('Kategori fetched:', data); // Logging tambahan
                var kategoriSelect = $('#kategori');
                if (data.success && Array.isArray(data.data.categories)) {
                    data.data.categories.forEach(function (category) {
                        kategoriSelect.append(new Option(category.name, category.id));
                    });
                } else {
                    console.error('Unexpected response format:', data);
                }
            },
            error: handleError
        });
    }

    // Fungsi untuk menangani pengiriman form
    $('#addFood').on('submit', function (e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append('name', $('#nama').val());
        formData.append('image', $('#formFile')[0].files[0]);
        formData.append('description', $('#deskripsi').val());
        formData.append('price', $('#harga').val());
        formData.append('stock', $('#stok').val());
        formData.append('category_id', $('#kategori').val());

        $.ajax({
            url: dataUrl,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                $('#addResult').text('Makanan berhasil ditambahkan.');
                setTimeout(function () {
                    window.location.href = 'index.html';
                }, 2000); // Tunggu 2 detik sebelum mengarahkan ke index.html
            },
            error: handleError
        });
    });
});
