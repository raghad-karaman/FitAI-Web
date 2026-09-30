$(function () {

    // =============================================
    // URL'den ID al
    // =============================================
    var pathParcalar = window.location.pathname.split('/');
    var urunId = parseInt(pathParcalar[pathParcalar.length - 1]) || 0;

    var renkler = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    function renk(id) { return renkler[id % renkler.length]; }

    function yildizlar(puan) {
        if (!puan) return '<span class="text-muted">—</span>';
        var html = '';
        for (var i = 1; i <= 5; i++) {
            html += '<i class="fas fa-star' + (i <= puan ? ' text-warning' : ' text-muted') + '"></i>';
        }
        return html;
    }

    // =============================================
    // Sayfa Yükle — API'den çek
    // =============================================
    function sayfaYukle() {
        if (!urunId) {
            $('#yukleniyor').hide();
            $('#bulunamadi').show();
            return;
        }

        // Ürün ve yorumları paralel çek
        Promise.all([
            fetch('/api/app/urun/' + urunId).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            }),
            fetch('/api/app/yorum?urunId=' + urunId + '&maxResultCount=1000').then(function(r) {
                if (!r.ok) return { items: [] }; // Yorum endpoint yoksa boş dön
                return r.json();
            })
        ])
        .then(function(sonuclar) {
            var urun    = sonuclar[0];
            var yorumlar = sonuclar[1].items || [];

            $('#yukleniyor').hide();
            $('#anaIcerik').show();
            urunGoster(urun, yorumlar);
        })
        .catch(function(err) {
            console.error('Veri yükleme hatası:', err);
            $('#yukleniyor').hide();
            $('#bulunamadi').show();
        });
    }

    // =============================================
    // Ürün Bilgilerini Doldur
    // =============================================
    var _urun    = null;
    var _yorumlar = [];

    function urunGoster(u, yorumlar) {
        _urun     = u;
        _yorumlar = yorumlar;

        var r = renk(u.id);

        // Başlık
        $('#baslikIkon').html(
            '<div style="width:56px;height:56px;border-radius:14px;background:' + r + '20;color:' + r +
            ';display:flex;align-items:center;justify-content:center;font-size:1.4rem">' +
            '<i class="fas fa-tshirt"></i></div>'
        );
        $('#baslikAd').text(u.ad);
        $('#baslikMagaza').html('<i class="fas fa-store me-1"></i>' + (u.magazaAdi || '—'));
        $('#duzenleBtn').attr('href', '/Urunler?id=' + u.id);

        // Bilgi satırları
        $('#bilgiId').text('#' + u.id);
        $('#bilgiMagaza').text(u.magazaAdi || '—');
        $('#bilgiKesim').html(u.kesimTuru
            ? '<span class="kesim-badge">' + u.kesimTuru + ' Fit</span>'
            : '<span class="text-muted">Belirtilmemiş</span>');
        $('#bilgiKumas').html(u.kumasEsnek === true
            ? '<span class="kumas-esnek-badge"><i class="fas fa-expand-arrows-alt me-1"></i>Esnek</span>'
            : u.kumasEsnek === false
                ? '<span class="text-muted small">Standart</span>'
                : '<span class="text-muted">—</span>');
        $('#bilgiDurum').html(u.silindiMi
            ? '<span class="durum-silindi"><i class="fas fa-times me-1"></i>Silinmiş</span>'
            : '<span class="durum-aktif"><i class="fas fa-check me-1"></i>Aktif</span>');

        // Açıklama
        $('#aciklamaMetni').text(u.aciklama || 'Bu ürün için açıklama eklenmemiş.');

        // İstatistikler
        var puanlar  = yorumlar.filter(function(y) { return y.puan; });
        var ortPuan  = puanlar.length
            ? (puanlar.reduce(function(t, y) { return t + y.puan; }, 0) / puanlar.length).toFixed(1)
            : null;
        var nlpSayisi = yorumlar.filter(function(y) { return y.nlpIslendi; }).length;

        $('#istatOrtPuan').html(ortPuan ? '★ ' + ortPuan : '—');
        $('#istatYorumSayisi').text(yorumlar.length);
        $('#istatNlpIslendi').text(nlpSayisi);
        $('#istatNlpBekliyor').text(yorumlar.length - nlpSayisi);
        $('#toplamYorumYazi').text(yorumlar.length + ' yorum');

        // Puan Dağılımı & Yorumlar
        puanDagilimGoster();
        yorumlariGoster();
    }

    // =============================================
    // Puan Dağılımı
    // =============================================
    function puanDagilimGoster() {
        var puanliYorumlar = _yorumlar.filter(function(y) { return y.puan; });
        var toplam = puanliYorumlar.length || 1;
        var $alan  = $('#puanDagilimi');
        $alan.empty();

        for (var puan = 5; puan >= 1; puan--) {
            var sayi  = puanliYorumlar.filter(function(y) { return y.puan === puan; }).length;
            var yuzde = Math.round((sayi / toplam) * 100);
            var yildiz = '';
            for (var i = 0; i < puan; i++) yildiz += '★';

            $alan.append(
                '<div class="puan-satir">' +
                    '<span class="puan-etiket text-warning fw-600">' + yildiz + '</span>' +
                    '<div class="puan-bar-wrapper">' +
                        '<div class="puan-bar" style="width:' + yuzde + '%"></div>' +
                    '</div>' +
                    '<span class="puan-adet text-muted">' + sayi + '</span>' +
                '</div>'
            );
        }
    }

    // =============================================
    // Yorum Listesi
    // =============================================
    function yorumlariGoster() {
        var filtre   = $('#yorumFiltre').val();
        var siralama = $('#yorumSirala').val();

        var yorumlar = _yorumlar.slice(); // kopya

        if (filtre === 'nlp_islendi')  yorumlar = yorumlar.filter(function(y) { return y.nlpIslendi; });
        if (filtre === 'nlp_bekliyor') yorumlar = yorumlar.filter(function(y) { return !y.nlpIslendi; });
        if (filtre === 'puan_5')       yorumlar = yorumlar.filter(function(y) { return y.puan === 5; });
        if (filtre === 'puan_1')       yorumlar = yorumlar.filter(function(y) { return y.puan === 1; });

        if (siralama === 'puan_yuksek') yorumlar.sort(function(a, b) { return (b.puan || 0) - (a.puan || 0); });
        else if (siralama === 'puan_dusuk') yorumlar.sort(function(a, b) { return (a.puan || 0) - (b.puan || 0); });
        else yorumlar.sort(function(a, b) { return b.id - a.id; });

        var $liste = $('#yorumListesi');
        $liste.empty();

        if (yorumlar.length === 0) {
            $liste.html(
                '<div class="text-center text-muted py-4">' +
                '<i class="fas fa-comment-slash fa-2x mb-2 d-block"></i>Bu filtreye uygun yorum bulunamadı.</div>'
            );
            return;
        }

        yorumlar.forEach(function(y) {
            var nlpHtml = y.nlpIslendi
                ? '<span class="yorum-nlp-tag nlp-islendi"><i class="fas fa-robot me-1"></i>NLP Analiz Edildi</span>'
                : '<span class="yorum-nlp-tag nlp-bekliyor"><i class="fas fa-clock me-1"></i>NLP Bekliyor</span>';

            $liste.append(
                '<div class="yorum-item">' +
                    '<div class="d-flex align-items-center justify-content-between mb-1">' +
                        '<span>' + yildizlar(y.puan) + '</span>' +
                        nlpHtml +
                    '</div>' +
                    '<div class="yorum-metin">"' + y.yorumMetni + '"</div>' +
                '</div>'
            );
        });
    }

    $('#yorumFiltre, #yorumSirala').on('change', function() {
        yorumlariGoster();
    });

    // =============================================
    // Silme
    // =============================================
    $('#silBtn').on('click', function() {
        new bootstrap.Modal(document.getElementById('silOnayModal')).show();
    });

    $('#silOnayBtn').on('click', function() {
        fetch('/api/app/urun/' + urunId, {
            method: 'DELETE',
            headers: {
                'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
            }
        })
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            abp.notify.warn('Ürün silindi.', 'Silindi');
            bootstrap.Modal.getInstance(document.getElementById('silOnayModal')).hide();
            setTimeout(function() { window.location.href = '/Urunler'; }, 1000);
        })
        .catch(function(err) {
            console.error('Silme hatası:', err);
            abp.notify.error('Ürün silinirken hata oluştu.');
        });
    });

    // =============================================
    // Başlat
    // =============================================
    sayfaYukle();
});