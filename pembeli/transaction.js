$(document).ready(function () {
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
    var transUrl = 'http://127.0.0.1:8000/api/transaction';

    function handleError(jqXHR, textStatus, errorThrown) {
        console.error('Error: ' + textStatus, errorThrown);
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

    var checkoutItems = JSON.parse(localStorage.getItem('checkoutItems'));
    var checkoutItemsContainer = $('#checkoutItemsContainer');
    var totalPembayaran = 0;

    if (checkoutItems && checkoutItems.length > 0) {
        checkoutItems.forEach(function (item) {
            var totalItem = item.qty * item.price;
            totalPembayaran += totalItem;
            var itemHtml = `
                    <div>
                        <h6>Menu: ${item.name}</h6>
                        <h6>Jumlah: ${item.qty}</h6>
                        <h6>Total: ${totalItem}</h6>
                        <hr>
                    </div>`;
            checkoutItemsContainer.append(itemHtml);
        });
        var totalHtml = `<h6>Total Pembayaran: ${totalPembayaran}</h6>`;
        checkoutItemsContainer.append(totalHtml);
    } else {
        checkoutItemsContainer.html('<p>Tidak ada item untuk di checkout.</p>');
    }

    $('#Transaction').on('submit', function (e) {
        e.preventDefault();
        
        var metodeBayar = $('#bayar').val();
        var tujuan = $('#tujuan').val();
        var cartIds = checkoutItems.map(item => item.id);

        if (!metodeBayar) {
            $('#addResult').text('Metode pembayaran harus dipilih.');
            return;
        }

        var transactionData = {
            metode_bayar: metodeBayar,
            tujuan: tujuan,
            cart_id: cartIds
        };

        $.ajax({
            url: transUrl,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(transactionData),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('#addResult').text('Transaksi berhasil dilakukan.');
                    localStorage.removeItem('checkoutItems');
                    // Arahkan ke halaman cart.html setelah transaksi berhasil
                    setTimeout(function() {
                        window.location.href = 'cart.html';
                    }, 2000); // Mengarahkan setelah 2 detik
                } else {
                    $('#addResult').text('Gagal melakukan transaksi.');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error: ' + textStatus, errorThrown);
                $('#addResult').text('Terjadi kesalahan saat melakukan transaksi.');
            }
        });
    });

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
