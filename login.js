$(document).ready(function () {
    // Jika sudah ada token, arahkan pengguna ke halaman terakhir yang diakses
    var token = localStorage.getItem('token');
    if (token) {
        $.ajax({
            url: 'http://127.0.0.1:8000/api/user',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: 'json',
            success: function (response) {
                if (response.role === 'admin') {
                    window.location.href = '../admin/index.html';
                } else if (response.role === 'pembeli') {
                    window.location.href = '../pembeli/index.html';
                }
            },
            error: function (xhr, status, error) {
                console.error('Error checking token:', xhr.responseJSON.error);
                // Hapus token jika tidak valid
                localStorage.removeItem('token');
            }
        });
        return; // Menghentikan eksekusi lebih lanjut jika sudah ada token
    }

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();
        $('#login-error').text(''); // Mengosongkan pesan error sebelumnya

        var loginData = {
            email: $('#email').val(),
            password: $('#password').val()
        };

        $.ajax({
            url: 'http://127.0.0.1:8000/api/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            dataType: 'json',
            success: function (response) {
                if (response.data && response.data.token) { // Periksa keberadaan data dan token
                    var token = response.data.token;
                    console.log('Login berhasil:', response);
                    localStorage.setItem('token', token);

                    // Periksa peran pengguna dan arahkan ke halaman yang sesuai
                    $.ajax({
                        url: 'http://127.0.0.1:8000/api/user',
                        type: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + token
                        },
                        dataType: 'json',
                        success: function (response) {
                            if (response.role === 'admin') {
                                window.location.href = '../admin/index.html';
                            } else if (response.role === 'pembeli') {
                                window.location.href = '../pembeli/index.html';
                            }
                        },
                        error: function (xhr, status, error) {
                            $('#login-error').text('Gagal mendapatkan data pengguna.');
                            console.error('Error getting user data:', xhr.responseJSON.error);
                            $('#loginResult').text('Login Gagal');
                        }
                    });
                } else {
                    $('#login-error').text('Login gagal: Token tidak ada.');
                    console.error('Login gagal: Token tidak ada.');
                    $('#loginResult').text('Login Gagal');
                }
            },
            error: function (xhr, status, error) {
                $('#login-error').text(xhr.responseJSON.error);
                console.error('Login gagal:', xhr.responseJSON.error);
                $('#loginResult').text('Login Gagal');
            }
        });
    });

    
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();
        $('#register-error').text(''); // Mengosongkan pesan error sebelumnya

        var registerData = {
            name: $('#name').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            password_confirmation: $('#password_confirm').val()
        };

        if (registerData.password !== registerData.password_confirmation) {
            $('#registerResult').text('Password dan konfirmasi password tidak cocok.');
            return;
        }

        $.ajax({
            url: 'http://127.0.0.1:8000/api/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(registerData),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    console.log('Register berhasil:', response);
                    $('#registerResult').text('Register Berhasil');
                    // Arahkan ke halaman login setelah berhasil register
                    setTimeout(function () {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    $('#registerResult').text('Register gagal: ' + response.message);
                    console.error('Register gagal:', response.message);
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    var errors = xhr.responseJSON.errors;
                    if (errors.email) {
                        $('#registerResult').text('Email sudah ada.');
                    } else {
                        $('#registerResult').text(errors[Object.keys(errors)[0]][0]);
                    }
                } else {
                    $('#registerResult').text('Register gagal: ' + xhr.responseJSON.error);
                }
                console.error('Register gagal:', xhr.responseJSON.error);
            }
        });
    });
});
