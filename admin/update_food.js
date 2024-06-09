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
    var kategoriUrl = 'http://127.0.0.1:8000/api/admin/categories';

    // Ambil ID dari URL
    var urlParams = new URLSearchParams(window.location.search);
    var makananId = urlParams.get('id');
    var existingImage = ''; // Variable to hold the existing image path

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
    
    // Fungsi untuk mengisi form dengan data makanan
    function fillForm(data) {
        $('#nama').val(data.name);
        $('#deskripsi').val(data.description || '');
        $('#harga').val(data.price);
        $('#stok').val(data.stock || '');
        $('#kategori').val(data.category_id);

        // Tambahkan gambar jika ada
        if (data.image) {
            var imageUrl = imgurl + data.image;
            existingImage = data.image; // Simpan nama gambar lama
            $('.gambar').html('<img src="' + imageUrl + '" alt="Gambar Makanan" class="img-fluid">');
        }
    }

    // Fungsi untuk mengambil data makanan berdasarkan ID
    function getMakananById(id) {
        $.ajax({
            url: `${dataUrl}/${id}`,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: 'json',
            success: function (response) {
                if (response.success && response.data.makanan) {
                    fillForm(response.data.makanan);
                } else {
                    $('#updateResult').text('Failed to fetch food data.');
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
                console.log('Kategori fetched:', data); // Logging tambahan
                var kategoriSelect = $('#kategori');
                if (data.success && Array.isArray(data.data.categories)) {
                    data.data.categories.forEach(function (category) {
                        kategoriSelect.append(new Option(category.name, category.id));
                    });
                    // Setelah kategori dimuat, isi form dengan data makanan
                    getMakananById(makananId);
                } else {
                    console.error('Unexpected response format:', data);
                }
            },
            error: handleError
        });
    }

    // Fungsi untuk menangani pengiriman form
    $('#updateFood').on('submit', function (e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append('name', $('#nama').val());
        var imageFile = $('#formFile')[0].files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        } else {
            formData.append('existing_image', existingImage); // Gunakan nama gambar lama jika tidak ada gambar baru yang diupload
        }
        formData.append('description', $('#deskripsi').val());
        formData.append('price', $('#harga').val());
        formData.append('stock', $('#stok').val());
        formData.append('category_id', $('#kategori').val());

        $.ajax({
            url: `${dataUrl}/${makananId}`,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                $('#updateResult').text('Makanan berhasil diperbarui.');
                setTimeout(function () {
                    window.location.href = 'index.html';
                }, 2000); // Tunggu 2 detik sebelum mengarahkan ke index.html
            },
            error: handleError
        });
    });
});
