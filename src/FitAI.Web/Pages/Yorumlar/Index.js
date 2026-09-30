'use strict';

$(function () {

    // =========================================================
    // 1. SERVİS
    // =========================================================
    var _yorumService = {
        getList: function (params) {
            return abp.ajax({
                type: 'GET',
                url: abp.appPath + 'api/app/yorum',
                data: params
            });
        },
        triggerNlp: function (id) {
            return abp.ajax({
                type: 'POST',
                url: abp.appPath + 'api/app/yorum/' + id + '/trigger-nlp'
            });
        }
    };

    // =========================================================
    // 2. DURUM
    // =========================================================
    var _tumYorumlar = [];
    var _nlpBulgular = [];

    function _tabloYukleniyor(aktif) {
        if (aktif) {
            $('#yorumTablosu').html(
                '<tr><td colspan="7">' +
                '<div class="d-flex justify-content-center align-items-center py-5">' +
                '<div class="spinner-border text-primary me-2" role="status"></div>' +
                '<span class="text-muted">Yorumlar yükleniyor...</span>' +
                '</div></td></tr>'
            );
        }
    }

    // =========================================================
    // 3. VERİ ÇEKME
    // =========================================================
    function _yorumlariYukle() {
        _tabloYukleniyor(true);

        _yorumService.getList({ maxResultCount: 200 })
            .done(function (result) {
                _tumYorumlar = result.items || [];
                _kpiGuncelle();
                _yorumlariRender(_tumYorumlar);
                _nlpBulgulariOlustur(_tumYorumlar);
            })
            .fail(function (err) {
                console.error('Yorumlar yüklenemedi:', err);
                abp.notify.error('Yorumlar yüklenirken hata oluştu.');
            })
            .always(function () {
                _tabloYukleniyor(false);
            });
    }

    // =========================================================
    // 4. KPI
    // =========================================================
    function _kpiGuncelle() {
        var toplam  = _tumYorumlar.length;
        var islendi = _tumYorumlar.filter(function (y) { return y.nlpIslendi; }).length;
        var bekliyor = toplam - islendi;
        var ortPuan = toplam
            ? (_tumYorumlar.reduce(function (t, y) { return t + (y.puan || 0); }, 0) / toplam).toFixed(1)
            : '—';

        $('#toplamYorum').text(toplam);
        $('#nlpIslendi').text(islendi);
        $('#nlpBekliyor').text(bekliyor);
        $('#ortPuan').text(ortPuan);
        $('#yorumKayitYazi').text(toplam + ' kayıt');
    }

    // =========================================================
    // 5. TABLO RENDER
    // =========================================================
    function _yorumlariRender(liste) {
        var $tbody = $('#yorumTablosu').empty();

        if (!liste.length) {
            $tbody.html(
                '<tr><td colspan="7" class="text-center py-5 text-muted">' +
                '<i class="fas fa-comment-slash fa-2x mb-2 d-block"></i>Yorum bulunamadı</td></tr>'
            );
            return;
        }

        liste.forEach(function (y) {
            var yildiz = '';
            for (var i = 1; i <= 5; i++)
                yildiz += '<i class="fas fa-star' + (i <= (y.puan || 0) ? '' : '-o') + '"></i>';

            var nlpBadge = y.nlpIslendi
                ? '<span class="nlp-badge nlp-islendi"><i class="fas fa-check-circle"></i>' + (y.duygu || 'Analiz Edildi') + '</span>'
                : '<span class="nlp-badge nlp-bekliyor"><i class="fas fa-clock"></i>Bekliyor</span>';

            $tbody.append(
                '<tr>' +
                '<td>' + y.id + '</td>' +
                '<td>' + (y.urunAdi || '—') + '</td>' +
                '<td>' + (y.magazaAdi || '—') + '</td>' +
                '<td><div class="yorum-metin-kisalt" title="' + (y.yorumMetni || '') + '">' + (y.yorumMetni || '') + '</div></td>' +
                '<td><span class="puan-yildiz">' + yildiz + '</span></td>' +
                '<td>' + nlpBadge + '</td>' +
                '<td class="text-center">' +
                '  <button class="btn-islem btn-detay btnDetay" data-id="' + y.id + '" title="Detay">' +
                '    <i class="fas fa-eye"></i>' +
                '  </button>' +
                '  <button class="btn-islem btn-nlp btnNlp ms-1" data-id="' + y.id + '" title="NLP Analiz Et"' +
                '    ' + (y.nlpIslendi ? 'style="opacity:.4" disabled' : '') + '>' +
                '    <i class="fas fa-robot"></i>' +
                '  </button>' +
                '</td>' +
                '</tr>'
            );
        });
    }

    // =========================================================
    // 6. NLP BULGULAR SEKMESİ
    // =========================================================
    function _nlpBulgulariOlustur(yorumlar) {
        _nlpBulgular = [];
        var gruplar  = {};

        yorumlar.filter(function (y) { return y.nlpIslendi && y.duygu; })
            .forEach(function (y) {
                var key = (y.duygu || 'Nötr');
                if (!gruplar[key]) gruplar[key] = [];
                gruplar[key].push(y);
            });

        Object.keys(gruplar).forEach(function (duygu) {
            _nlpBulgular.push({
                tema: duygu,
                sayi: gruplar[duygu].length,
                duygu: duygu,
                ornekler: gruplar[duygu].slice(0, 3)
            });
        });

        _nlpBulgulariRender(_nlpBulgular);
    }

    function _nlpBulgulariRender(bulgular) {
        var $grid = $('#nlpBulgularGrid').empty();

        if (!bulgular.length) {
            $grid.html(
                '<div class="col-12 text-center py-5 text-muted">' +
                '<i class="fas fa-brain fa-2x mb-2 d-block"></i>NLP analizi yapılmış yorum yok.</div>'
            );
            return;
        }

        bulgular.forEach(function (b) {
            var duyguCss = b.duygu === 'Olumlu' ? 'duygu-pozitif'
                         : b.duygu === 'Olumsuz' ? 'duygu-negatif'
                         : 'duygu-notr';

            $grid.append(
                '<div class="col-md-4">' +
                '  <div class="nlp-bulgu-kart">' +
                '    <div class="nlp-bulgu-header">' +
                '      <span class="nlp-tema">' + b.tema + '</span>' +
                '      <span class="nlp-badge ' + duyguCss + '">' + b.duygu + '</span>' +
                '    </div>' +
                '    <div class="nlp-bulgu-body">' +
                '      <div class="nlp-satir">' +
                '        <span class="nlp-satir-label">Yorum Sayısı</span>' +
                '        <span class="nlp-satir-deger">' + b.sayi + '</span>' +
                '      </div>' +
                '      <div class="nlp-oneri"><i class="fas fa-lightbulb"></i>' +
                        (b.duygu === 'Olumsuz' ? 'Olumsuz yorumlar incelenmeli, ürün bilgileri güncellenmeli.' :
                         b.duygu === 'Olumlu'  ? 'Müşteri memnuniyeti yüksek, bu ürün öne çıkarılabilir.' :
                         'Nötr geri bildirimler, ek bilgi sunulabilir.') +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '</div>'
            );
        });
    }

    // =========================================================
    // 7. FİLTRELEME
    // =========================================================
    function _filtreUygula() {
        var arama  = ($('#yorumArama').val() || '').toLowerCase();
        var magaza = $('#magazaFiltre').val();
        var puan   = $('#puanFiltre').val();
        var nlp    = $('#nlpFiltre').val();
        var sira   = $('#yorumSirala').val();

        var liste = _tumYorumlar.filter(function (y) {
            if (arama  && !(y.yorumMetni || '').toLowerCase().includes(arama)) return false;
            if (magaza && String(y.magazaId) !== magaza)                        return false;
            if (puan   && String(y.puan)     !== puan)                          return false;
            if (nlp === 'islendi'  && !y.nlpIslendi)  return false;
            if (nlp === 'bekliyor' &&  y.nlpIslendi)  return false;
            return true;
        });

        if (sira === 'puan_yuksek') liste.sort(function (a, b) { return (b.puan || 0) - (a.puan || 0); });
        if (sira === 'puan_dusuk')  liste.sort(function (a, b) { return (a.puan || 0) - (b.puan || 0); });

        _yorumlariRender(liste);
        $('#yorumKayitYazi').text(liste.length + ' kayıt');
    }

    // =========================================================
    // 8. OLAYLAR
    // =========================================================

    // Sekme geçişi
    $('#yorumTabs').on('click', '.analiz-nav-btn', function () {
        $('.analiz-nav-btn').removeClass('active');
        $(this).addClass('active');
        var tab = $(this).data('tab');
        $('.analiz-tab-icerik').hide();
        $('#tab-' + tab).show();
    });

    // Filtreler
    $('#yorumArama').on('input', _filtreUygula);
    $('#magazaFiltre, #puanFiltre, #nlpFiltre, #yorumSirala').on('change', _filtreUygula);
    $('#filtreTemizle').on('click', function () {
        $('#yorumArama').val('');
        $('#magazaFiltre, #puanFiltre, #nlpFiltre').val('');
        $('#yorumSirala').val('yeni');
        _yorumlariRender(_tumYorumlar);
        $('#yorumKayitYazi').text(_tumYorumlar.length + ' kayıt');
    });

    // Detay modal
    $(document).on('click', '.btnDetay', function () {
        var id    = parseInt($(this).data('id'));
        var yorum = _tumYorumlar.find(function (y) { return y.id === id; });
        if (!yorum) return;

        $('#yorumDetayIcerik').html(
            '<div class="yorum-detay-kart mb-3">' +
            '  <p class="mb-2"><strong>Yorum:</strong></p>' +
            '  <p class="mb-0">' + (yorum.yorumMetni || '') + '</p>' +
            '</div>' +
            '<div class="row g-2">' +
            '  <div class="col-6"><strong>Ürün:</strong> '   + (yorum.urunAdi   || '—') + '</div>' +
            '  <div class="col-6"><strong>Mağaza:</strong> ' + (yorum.magazaAdi || '—') + '</div>' +
            '  <div class="col-6"><strong>Puan:</strong> '   + (yorum.puan      || '—') + '</div>' +
            '  <div class="col-6"><strong>Duygu:</strong> '  + (yorum.duygu     || 'Analiz Bekleniyor') + '</div>' +
            '  <div class="col-6"><strong>Güven:</strong> '  + (yorum.guvenSkoru ? '%' + Math.round(yorum.guvenSkoru * 100) : '—') + '</div>' +
            '</div>'
        );
        new bootstrap.Modal(document.getElementById('yorumDetayModal')).show();
    });

    // Tekil NLP tetikleme
    $(document).on('click', '.btnNlp', function () {
        var $btn = $(this);
        var id   = parseInt($btn.data('id'));

        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        _yorumService.triggerNlp(id)
            .then(function (guncel) {
                // Local state güncelle
                var idx = _tumYorumlar.findIndex(function (y) { return y.id === id; });
                if (idx !== -1) _tumYorumlar[idx] = guncel;

                _kpiGuncelle();
                _filtreUygula();
                _nlpBulgulariOlustur(_tumYorumlar);
                abp.notify.success('NLP analizi tamamlandı: ' + (guncel.duygu || ''));
            })
            .catch(function () {
                abp.notify.error('NLP analizi başarısız.');
                $btn.prop('disabled', false).html('<i class="fas fa-robot"></i>');
            });
    });

    // =========================================================
    // 9. BAŞLANGIÇ
    // =========================================================
    _yorumlariYukle();
});