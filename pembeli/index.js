$(document).ready(function () {
    $("#header-container").load("header.html");

    // Periksa token
    var token = localStorage.getItem('token');
    if (!token) {
        // Jika token tidak ditemukan, arahkan ke halaman login
        window.location.href = '../login.html';
        return;
    }

    var dataUrl = 'http://127.0.0.1:8000/api/makanans';
    var imgurl = 'http://127.0.0.1:8000/storage/';
    var cartUrl = 'http://127.0.0.1:8000/api/cart';

    function handleError(jqXHR, textStatus, errorThrown) {
        console.error('Error: ' + textStatus, errorThrown);
        // $('#dataResult').text('Error: ' + textStatus + ' ' + errorThrown);
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
            if (response.role === 'pembeli') {
                // Pengguna adalah pembeli, lanjutkan dengan mendapatkan data makanan
                $.ajax({
                    url: dataUrl,
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.success && Array.isArray(data.data.makanan)) {
                            displayCards(data.data.makanan);
                        } else {
                            $('#datasResult').text('Data fetched is not valid.');
                        }
                    },
                    error: handleError
                });
            } else {
                // Jika bukan pembeli, arahkan ke halaman admin
                window.location.href = '../admin/index.html';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error: ' + textStatus, errorThrown);
            // Jika terjadi kesalahan (misalnya token tidak valid), arahkan ke halaman login
            window.location.href = '../login.html';
        }
    });

    // Fungsi untuk menampilkan kartu
    function displayCards(makananList) {
        var cardContainer = $('#card-body');
        cardContainer.empty();

        makananList.forEach(function (makanan) {
            var imageUrl = imgurl + makanan.image;

            var cardHtml = `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${imageUrl}" class="img-fluid rounded-start" alt="${makanan.name}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${makanan.name}</h5>
                            <p class="card-text">Harga: ${makanan.price}</p>
                            <p class="card-text">Stok: ${makanan.stock !== null ? makanan.stock : '-'}</p>
                            <p class="card-text">Kategori: ${makanan.category ? makanan.category.name : '-'}</p>
                            <p class="card-text">Deskripsi: ${makanan.description !== null ? makanan.description : 'Tidak ada deskripsi'}</p>
                            <button class="btn btn-primary add-to-cart-btn" data-id="${makanan.id}" data-name="${makanan.name}" data-price="${makanan.price}">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>`;

            cardContainer.append(cardHtml);
        });

        // Tambahkan event listener untuk tombol Add to Cart
        $('.add-to-cart-btn').on('click', function () {
            var id = $(this).data('id');
            var name = $(this).data('name');
            var price = $(this).data('price');
            addToCart(id, name, price);
        });
    }

    // Fungsi untuk menambahkan ke keranjang
    function addToCart(makananId, makananName, harga) {
        var requestData = {
            makanan_id: makananId,
            qty: 1,
            harga: harga,
            total: harga
        };

        $.ajax({
            url: cartUrl,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(requestData),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#datasResult').text('Makanan ' + makananName + ' berhasil ditambahkan ke keranjang.');
                } else {
                    $('#datasResult').text('Gagal menambahkan ke keranjang.');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error: ' + textStatus, errorThrown);
                // $('#dataResult').text('Error: ' + textStatus + ' ' + errorThrown);
            }
        });
    }
});
