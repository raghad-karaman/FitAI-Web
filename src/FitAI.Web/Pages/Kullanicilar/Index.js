$(function () {

    // ─── Servis Proxy ────────────────────────────────────────────────────────
    // ABP otomatik proxy: fitAI.kullanicilar.kullanici  veya  fitAI.domain.users.kullanici
    var _svc = fitAI.kullanicilar
        ? fitAI.kullanicilar.kullanici
        : null;

    // Proxy bulunamazsa ham AJAX fallback
    function apiGet(params) {
        if (_svc) return _svc.getList(params);
        return abp.ajax({ type: 'GET', url: '/api/app/kullanici', data: params });
    }
    function apiCreate(dto) {
        if (_svc) return _svc.create(dto);
        return abp.ajax({ type: 'POST', url: '/api/app/kullanici', data: JSON.stringify(dto), contentType: 'application/json' });
    }
    function apiUpdate(id, dto) {
        if (_svc) return _svc.update(id, dto);
        return abp.ajax({ type: 'PUT', url: '/api/app/kullanici/' + id, data: JSON.stringify(dto), contentType: 'application/json' });
    }
    function apiDelete(id) {
        if (_svc) return _svc.delete(id);
        return abp.ajax({ type: 'DELETE', url: '/api/app/kullanici/' + id });
    }

    // ─── Durum ───────────────────────────────────────────────────────────────
    var _tumKullanicilar = [];
    var _sayfaNo = 1;
    var _sayfaBoyutu = 15;
    var _detayModal = null;
    var _formModal = null;

    // Modal instance'larını başlat
    function modallariBastir() {
        var detayEl = document.getElementById('kullaniciDetayModal');
        var formEl = document.getElementById('kullaniciFormModal');
        
        if (detayEl) {
            _detayModal = new bootstrap.Modal(detayEl, { backdrop: 'static', keyboard: true });
            // Focus management için event handler'ları ekle
            detayEl.addEventListener('shown.bs.modal', function() {
                var closeBtn = this.querySelector('.btn-close');
                if (closeBtn) {
                    // Modali açtıktan sonra close button'a focus ver
                    setTimeout(function() { closeBtn.focus(); }, 100);
                }
            });
        }
        
        if (formEl) {
            _formModal = new bootstrap.Modal(formEl, { backdrop: 'static', keyboard: true });
            formEl.addEventListener('shown.bs.modal', function() {
                var firstInput = this.querySelector('input:not([type="hidden"])');
                if (firstInput) {
                    setTimeout(function() { firstInput.focus(); }, 100);
                }
            });
        }
    }

    // ─── İlk Yükleme ─────────────────────────────────────────────────────────
    modallariBastir();
    listeyiYukle();

    function listeyiYukle() {
        $('#kullaniciTablosu').html(
            '<tr><td colspan="8" class="text-center py-4 text-muted">' +
            '<i class="fas fa-spinner fa-spin me-2"></i>Yükleniyor...</td></tr>'
        );

        apiGet({ maxResultCount: 500, skipCount: 0 })
            .done(function (result) {
                _tumKullanicilar = result.items || [];
                _sayfaNo = 1;
                filtreUygula();
            })
            .fail(function () {
                $('#kullaniciTablosu').html(
                    '<tr><td colspan="8" class="text-center py-4 text-danger">' +
                    '<i class="fas fa-exclamation-triangle me-2"></i>Veriler yüklenemedi.</td></tr>'
                );
            });
    }

    // ─── Filtre & Render ─────────────────────────────────────────────────────
    function filtreUygula() {
        var ara = $('#aramaInput').val().trim().toLowerCase();
        var rol = $('#rolFiltre').val();
        var durum = $('#durumFiltre').val();

        var filtreli = _tumKullanicilar.filter(function (k) {
            var aramaUy = !ara ||
                (k.ad || '').toLowerCase().includes(ara) ||
                (k.eposta || '').toLowerCase().includes(ara);
            var rolUy = !rol || k.rol === rol;
            var durumUy = !durum ||
                (durum === 'aktif' && k.aktifMi) ||
                (durum === 'pasif' && !k.aktifMi);
            return aramaUy && rolUy && durumUy;
        });

        tabloRender(filtreli);
    }

    function tabloRender(liste) {
        var toplam = liste.length;
        var baslangic = (_sayfaNo - 1) * _sayfaBoyutu;
        var sayfa = liste.slice(baslangic, baslangic + _sayfaBoyutu);

        $('#toplamKayitYazi').text('Toplam ' + toplam + ' kullanıcı');
        sayfalamaRender(toplam, liste);

        if (sayfa.length === 0) {
            $('#kullaniciTablosu').html(
                '<tr><td colspan="8" class="text-center py-4 text-muted">' +
                '<i class="fas fa-inbox me-2"></i>Kayıt bulunamadı.</td></tr>'
            );
            return;
        }

        var html = '';
        $.each(sayfa, function (i, k) {
            var aktifBadge = k.aktifMi
                ? '<span class="badge bg-success-subtle text-success">Aktif</span>'
                : '<span class="badge bg-danger-subtle text-danger">Pasif</span>';

            var rolBadge = rolRenkle(k.rol);

            var sonGiris = k.sonGirisTarihi
                ? new Date(k.sonGirisTarihi).toLocaleDateString('tr-TR')
                : '<span class="text-muted small">—</span>';

            html +=
                '<tr>' +
                '<td class="text-muted small">' + k.id + '</td>' +
                '<td><strong>' + htmlEscape(k.ad) + '</strong></td>' +
                '<td><span class="text-muted">' + htmlEscape(k.eposta) + '</span></td>' +
                '<td>' + rolBadge + '</td>' +
                '<td>' + htmlEscape(k.magazaAdi || '-') + '</td>' +
                '<td>' + sonGiris + '</td>' +
                '<td>' + aktifBadge + '</td>' +
                '<td class="text-center">' +
                '  <button class="btn btn-sm btn-outline-primary btn-detay me-1" data-id="' + k.id + '" title="Detay">' +
                '    <i class="fas fa-eye"></i>' +
                '  </button>' +
                '  <button class="btn btn-sm btn-outline-secondary btn-duzenle me-1" data-id="' + k.id + '" title="Düzenle">' +
                '    <i class="fas fa-pen"></i>' +
                '  </button>' +
                '  <button class="btn btn-sm btn-outline-danger btn-sil" data-id="' + k.id + '" title="Sil">' +
                '    <i class="fas fa-trash"></i>' +
                '  </button>' +
                '</td>' +
                '</tr>';
        });

        $('#kullaniciTablosu').html(html);
    }

    // ─── Sayfalama ────────────────────────────────────────────────────────────
    function sayfalamaRender(toplam, tumListe) {
        var toplamSayfa = Math.ceil(toplam / _sayfaBoyutu);
        var html = '';

        if (toplamSayfa <= 1) { $('#sayfalamaKonteyner').html(''); return; }

        for (var i = 1; i <= toplamSayfa; i++) {
            var aktif = i === _sayfaNo ? ' active' : '';
            html += '<button class="btn btn-sm btn-outline-secondary sayfa-btn' + aktif + '" data-sayfa="' + i + '">' + i + '</button>';
        }
        $('#sayfalamaKonteyner').html(html);
    }

    $(document).on('click', '.sayfa-btn', function () {
        _sayfaNo = parseInt($(this).data('sayfa'));
        filtreUygula();
    });

    // ─── Filtre Event'leri ────────────────────────────────────────────────────
    var aramaTimeout;
    $('#aramaInput').on('input', function () {
        clearTimeout(aramaTimeout);
        aramaTimeout = setTimeout(function () {
            _sayfaNo = 1;
            filtreUygula();
        }, 300);
    });

    $('#rolFiltre, #durumFiltre').on('change', function () {
        _sayfaNo = 1;
        filtreUygula();
    });

    $('#filtreTemizle').on('click', function () {
        $('#aramaInput').val('');
        $('#rolFiltre').val('');
        $('#durumFiltre').val('');
        _sayfaNo = 1;
        filtreUygula();
    });

    // ─── Detay Modal ─────────────────────────────────────────────────────────
    $(document).on('click', '.btn-detay', function () {
        var id = $(this).data('id');
        var k = _tumKullanicilar.find(function (x) { return x.id === id; });
        if (!k) return;

        var sonGiris = k.sonGirisTarihi
            ? new Date(k.sonGirisTarihi).toLocaleString('tr-TR')
            : '—';

        var html =
            '<div class="row g-3">' +
            '<div class="col-md-6"><label class="text-muted small">ID</label><div><strong>' + k.id + '</strong></div></div>' +
            '<div class="col-md-6"><label class="text-muted small">Ad Soyad</label><div><strong>' + htmlEscape(k.ad) + '</strong></div></div>' +
            '<div class="col-md-6"><label class="text-muted small">E-posta</label><div>' + htmlEscape(k.eposta) + '</div></div>' +
            '<div class="col-md-6"><label class="text-muted small">Rol</label><div>' + rolRenkle(k.rol) + '</div></div>' +
            '<div class="col-md-6"><label class="text-muted small">Mağaza</label><div>' + htmlEscape(k.magazaAdi || '-') + '</div></div>' +
            '<div class="col-md-6"><label class="text-muted small">Son Giriş</label><div>' + sonGiris + '</div></div>' +
            '<div class="col-md-6"><label class="text-muted small">Durum</label><div>' +
            (k.aktifMi ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-danger">Pasif</span>') +
            '</div></div>' +
            '<div class="col-md-6"><label class="text-muted small">Kayıt Tarihi</label><div>' +
            new Date(k.creationTime).toLocaleDateString('tr-TR') +
            '</div></div>' +
            '</div>';

        $('#kullaniciDetayIcerik').html(html);
        
        // Bootstrap modal instance'ını kullan - hide tüm event'leri öncesi gizle
        var modalEl = document.getElementById('kullaniciDetayModal');
        if (modalEl) {
            _detayModal.show();
        }
    });

    // ─── Yeni Kullanıcı ───────────────────────────────────────────────────────
    $('#yeniKullaniciBtn').on('click', function () {
        formSifirla();
        $('#formModalLabel').html('<i class="fas fa-user-plus me-2 text-primary"></i>Yeni Kullanıcı');
        $('#sifreZorunluIsareti').show();
        
        var modalEl = document.getElementById('kullaniciFormModal');
        if (modalEl) {
            _formModal.show();
        }
    });

    // ─── Düzenle ─────────────────────────────────────────────────────────────
    $(document).on('click', '.btn-duzenle', function () {
        var id = $(this).data('id');
        var k = _tumKullanicilar.find(function (x) { return x.id === id; });
        if (!k) return;

        formSifirla();
        $('#formKullaniciId').val(k.id);
        $('#formAd').val(k.ad);
        $('#formEposta').val(k.eposta);
        $('#formSifre').val('');
        $('#formRol').val(k.rol);
        $('#formMagazaId').val(k.magazaId);
        $('#formAktifMi').prop('checked', k.aktifMi);
        $('#sifreZorunluIsareti').hide();
        $('#formModalLabel').html('<i class="fas fa-user-edit me-2 text-primary"></i>Kullanıcı Düzenle');

        var modalEl = document.getElementById('kullaniciFormModal');
        if (modalEl) {
            _formModal.show();
        }
    });

    // ─── Kaydet ──────────────────────────────────────────────────────────────
    $('#formKaydetBtn').on('click', function () {
        var id = $('#formKullaniciId').val();
        var dto = {
            ad: $('#formAd').val().trim(),
            eposta: $('#formEposta').val().trim(),
            sifre: $('#formSifre').val() || null,
            rol: $('#formRol').val(),
            magazaId: parseInt($('#formMagazaId').val()) || 0,
            aktifMi: $('#formAktifMi').is(':checked')
        };

        if (!dto.ad || !dto.eposta || !dto.rol) {
            abp.notify.warn('Lütfen zorunlu alanları doldurun.');
            return;
        }

        var istek = id ? apiUpdate(parseInt(id), dto) : apiCreate(dto);

        istek
            .done(function () {
                abp.notify.success(id ? 'Kullanıcı güncellendi.' : 'Kullanıcı oluşturuldu.');
                
                var modalEl = document.getElementById('kullaniciFormModal');
                if (modalEl && _formModal) {
                    _formModal.hide();
                }
                
                listeyiYukle();
            })
            .fail(function () {
                abp.notify.error('İşlem başarısız. Lütfen tekrar deneyin.');
            });
    });

    // ─── Sil ─────────────────────────────────────────────────────────────────
    $(document).on('click', '.btn-sil', function () {
        var id = $(this).data('id');
        var k = _tumKullanicilar.find(function (x) { return x.id === id; });
        if (!k) return;

        abp.message.confirm(
            '"' + htmlEscape(k.ad) + '" adlı kullanıcıyı silmek istediğinize emin misiniz?',
            'Silme Onayı',
            function (onay) {
                if (!onay) return;
                apiDelete(id)
                    .done(function () {
                        abp.notify.success('Kullanıcı silindi.');
                        listeyiYukle();
                    })
                    .fail(function () {
                        abp.notify.error('Silme işlemi başarısız.');
                    });
            }
        );
    });

    // ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────
    function formSifirla() {
        $('#formKullaniciId').val('');
        $('#formAd').val('');
        $('#formEposta').val('');
        $('#formSifre').val('');
        $('#formRol').val('');
        $('#formMagazaId').val('');
        $('#formAktifMi').prop('checked', true);
    }

    function rolRenkle(rol) {
        var map = {
            'Admin':         '<span class="badge bg-danger-subtle text-danger">Admin</span>',
            'MagazaSahibi':  '<span class="badge bg-primary-subtle text-primary">Mağaza Sahibi</span>',
            'Kullanici':     '<span class="badge bg-secondary-subtle text-secondary">Kullanıcı</span>'
        };
        return map[rol] || '<span class="badge bg-light text-dark">' + htmlEscape(rol || '-') + '</span>';
    }

    function htmlEscape(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
});