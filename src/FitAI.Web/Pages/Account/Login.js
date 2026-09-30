// $(function () {   ← ESKİ, SİL
// });

function initLoginPage() {
    $('#togglePassword').on('click', function () {
        const passwordField = $('#loginPassword');
        const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
        passwordField.attr('type', type);
        $(this).find('i').toggleClass('fa-eye fa-eye-slash');
    });

    $('#loginForm').on('submit', function (e) {
        let valid = true;
        const email = $('#loginEmail').val().trim();
        const pass = $('#loginPassword').val();

        $('#errEmail, #errPassword').text('');
        $('.is-invalid').removeClass('is-invalid');

        if (!email) {
            $('#loginEmail').addClass('is-invalid');
            $('#errEmail').text('E-posta veya kullanıcı adı giriniz.');
            valid = false;
        }
        if (!pass) {
            $('#loginPassword').addClass('is-invalid');
            $('#errPassword').text('Şifre giriniz.');
            valid = false;
        }
        if (!valid) {
            e.preventDefault();
            return false;
        }
        return true;
    });

    $('#forgotPasswordLink').on('click', function (e) {
        e.preventDefault();
        abp.message.info('Şifre sıfırlama bağlantısı demo modunda devre dışıdır.', 'Bilgi');
    });
}

// jQuery yüklenene kadar bekle
if (typeof $ !== 'undefined') {
    $(initLoginPage);
} else {
    document.addEventListener('DOMContentLoaded', function () {
        var interval = setInterval(function () {
            if (typeof $ !== 'undefined') {
                clearInterval(interval);
                $(initLoginPage);
            }
        }, 50);
    });
}