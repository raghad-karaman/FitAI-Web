function initRegisterPage() {
    $('#togglePassword').on('click', function () {
        const field = $('#regPassword');
        const type = field.attr('type') === 'password' ? 'text' : 'password';
        field.attr('type', type);
        $(this).find('i').toggleClass('fa-eye fa-eye-slash');
    });

    $('#registerForm').on('submit', function (e) {
        let valid = true;
        const fullName = $('#fullName').val().trim();
        const email = $('#regEmail').val().trim();
        const pass = $('#regPassword').val();
        const confirm = $('#confirmPassword').val();
        const terms = $('#termsCheck').is(':checked');

        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').text('');

        if (!fullName) { $('#fullName').addClass('is-invalid'); $('#errFullName').text('Ad soyad giriniz.'); valid = false; }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) { $('#regEmail').addClass('is-invalid'); $('#errEmail').text('Geçerli bir e-posta adresi giriniz.'); valid = false; }
        if (!pass || pass.length < 8) { $('#regPassword').addClass('is-invalid'); $('#errPassword').text('Şifre en az 8 karakter olmalıdır.'); valid = false; }
        if (pass !== confirm) { $('#confirmPassword').addClass('is-invalid'); $('#errConfirm').text('Şifreler eşleşmiyor.'); valid = false; }
        if (!terms) { $('#termsCheck').addClass('is-invalid'); $('#errTerms').text('Kullanım koşullarını kabul etmelisiniz.'); valid = false; }

        if (!valid) { e.preventDefault(); return false; }
        return true;
    });

    $('#termsLink').on('click', function (e) {
        e.preventDefault();
        abp.message.info('Kullanım koşulları metni demo modunda geçerlidir.', 'Bilgi');
    });
}

if (typeof $ !== 'undefined') {
    $(initRegisterPage);
} else {
    document.addEventListener('DOMContentLoaded', function () {
        var interval = setInterval(function () {
            if (typeof $ !== 'undefined') {
                clearInterval(interval);
                $(initRegisterPage);
            }
        }, 50);
    });
}