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
        // $('#dataaResult').text('Error: ' + textStatus + ' ' + errorThrown);
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
                    url: cartUrl,
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    dataType: 'json',
                    success: function (response) {
                        if (response.success && Array.isArray(response.data)) {
                            displayCards(response.data);
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

    function displayCards(cartList) {
        var cardContainer = $('#card-body');
        cardContainer.empty();

        cartList.forEach(function (cart) {
            var imageUrl = imgurl + cart.makanan.image;

            var cardHtml = `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${imageUrl}" class="img-fluid rounded-start" alt="${cart.makanan.name}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${cart.makanan.name}</h5>
                            <p class="card-text">Harga: ${cart.harga}</p>
                            <p class="card-text">Stok: ${cart.makanan.stock !== null ? cart.makanan.stock : '-'}</p>
                            <p class="card-text">Kategori: ${cart.makanan.category ? cart.makanan.category.name : '-'}</p>
                            <p class="card-text">Deskripsi: ${cart.makanan.description !== null ? cart.makanan.description : 'Tidak ada deskripsi'}</p>
                            <div class="input-group">
                                <button class="btn btn-outline-secondary btn-minus" type="button" data-id="${cart.id}">-</button>
                                <input type="number" class="form-control text-center qty-input" value="${cart.qty}" id="qty">
                                <button class="btn btn-outline-secondary btn-plus" type="button" data-id="${cart.id}">+</button>
                            </div>
                            <div class="d-flex align-items-center">
                                <button class="btn btn-primary save-cart-btn" data-id="${cart.id}" data-qty="${cart.qty}" data-name="${cart.makanan.name}" data-price="${cart.harga}">Save Cart</button>
                                <div class="form-check form-check-inline">
                                    <input type="checkbox" class="form-check-input form-check-input-lg" style="width: 100px; height: 25px;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            cardContainer.append(cardHtml);
        });

        // Event listener untuk tombol "Save Cart"
        $('.save-cart-btn').on('click', function () {
            var cartId = $(this).data('id');
            var newQty = $(this).closest('.card-body').find('.qty-input').val();
            saveCart(cartId, newQty);
        });

        $('.btn-minus').on('click', function () {
            var input = $(this).closest('.input-group').find('input[type="number"]');
            var currentValue = parseInt(input.val());
            if (!isNaN(currentValue) && currentValue > 1) {
                input.val(currentValue - 1);
            }
        });

        $('.btn-plus').on('click', function () {
            var input = $(this).closest('.input-group').find('input[type="number"]');
            var currentValue = parseInt(input.val());
            if (!isNaN(currentValue)) {
                input.val(currentValue + 1);
            }
        });
    }



    // Fungsi untuk menambahkan ke keranjang
    // Fungsi untuk menyimpan keranjang dengan kuantitas yang diambil dari input qty
    function saveCart(cartId, newQty) {
        var requestData = {
            qty: newQty
        };

        $.ajax({
            url: cartUrl + '/' + cartId,
            type: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(requestData),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#datasResult').text('Keranjang berhasil diubah.');
                } else {
                    $('#datasResult').text('Gagal mengubah keranjang.');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error: ' + textStatus, errorThrown);
            }
        });
    }

    // Event listener untuk tombol "Delete"
    $('.delete-btn').on('click', function () {
        var checkedItems = $('.form-check-input:checked'); // Ambil semua item yang diceklis
        if (checkedItems.length > 0) { // Pastikan ada item yang diceklis
            checkedItems.each(function () {
                var cartId = $(this).closest('.card').find('.save-cart-btn').data('id'); // Ambil ID keranjang dari tombol "Save Cart" terkait
                deleteCart(cartId); // Hapus keranjang dengan ID yang sesuai
            });
        } else {
            $('#datasResult').text('Tidak ada item yang dipilih untuk dihapus.'); // Tampilkan pesan jika tidak ada item yang dipilih
        }
    });

    // Fungsi untuk menghapus item keranjang
    function deleteCart(cartId) {
        $.ajax({
            url: cartUrl + '/' + cartId,
            type: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function (response) {
                if (response.success) {
                    $('#datasResult').text('Keranjang berhasil dihapus.');
                    // Reload halaman untuk memperbarui tampilan setelah penghapusan
                    location.reload();
                } else {
                    $('#datasResult').text('Gagal menghapus keranjang.');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error: ' + textStatus, errorThrown);
            }
        });
    }

    // periksa checkbox
    $('.add-btn').on('click', function (e) {
        e.preventDefault();
        var checkedItems = $('.form-check-input:checked');
        if (checkedItems.length === 0) {
            $('#datasResult').text('Tidak ada cart yang dipilih.');
            return;
        }

        var cartItems = [];

        checkedItems.each(function () {
            var card = $(this).closest('.card');
            var item = {
                id: card.find('.save-cart-btn').data('id'),
                name: card.find('.card-title').text(),
                qty: card.find('.qty-input').val(),
                price: card.find('.save-cart-btn').data('price')
            };
            cartItems.push(item);
        });

        localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
        window.location.href = 'transaction.html';
    });

});
