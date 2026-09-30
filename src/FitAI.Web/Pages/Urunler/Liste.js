$(function () {

    // =============================================
    // Yardımcı Fonksiyonlar
    // =============================================
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

    function nlpBadge(islendi) {
        return islendi
            ? '<span class="nlp-badge nlp-islendi"><i class="fas fa-robot me-1"></i>NLP Analiz Edildi</span>'
            : '<span class="nlp-badge nlp-bekliyor"><i class="fas fa-clock me-1"></i>NLP Bekliyor</span>';
    }

    // =============================================
    // State
    // =============================================
    var tumUrunler   = [];
    var tumYorumlar  = [];
    var aktifUrunId  = null; // Modal için aktif ürün id'si

    // =============================================
    // Veri Çekme — fetch API (güvenilir)
    // =============================================
    function yukleVeriler() {
        $('#urunKartlari').html(
            '<div class="col-12 text-center py-5">' +
            '<div class="spinner-border text-primary"></div>' +
            '</div>'
        );

        var urunPromise  = fetch('/api/app/urun?maxResultCount=1000&skipCount=0')
            .then(function(r) { if (!r.ok) throw new Error('Ürün API hatası: ' + r.status); return r.json(); });

        var yorumPromise = fetch('/api/app/yorum?maxResultCount=10000&skipCount=0')
            .then(function(r) { if (!r.ok) return { items: [] }; return r.json(); })
            .catch(function() { return { items: [] }; }); // Yorum endpoint yoksa devam et

        Promise.all([urunPromise, yorumPromise])
            .then(function(sonuclar) {
                tumUrunler  = sonuclar[0].items || [];
                tumYorumlar = sonuclar[1].items || [];
                console.log('Ürün:', tumUrunler.length, '| Yorum:', tumYorumlar.length);
                magazaFiltreDoldur();
                tabloYenile();
            })
            .catch(function(err) {
                console.error('Veri yükleme hatası:', err);
                $('#urunKartlari').html(
                    '<div class="col-12 text-center py-5 text-danger">' +
                    '<i class="fas fa-exclamation-circle fa-2x mb-2 d-block"></i>' +
                    'Veriler yüklenemedi: ' + err.message + '</div>'
                );
            });
    }

    // Mağaza filtresini API'den gelen gerçek mağazalarla doldur
    function magazaFiltreDoldur() {
        var magazalar = {};
        tumUrunler.forEach(function(u) {
            if (u.magazaId && u.magazaAdi) magazalar[u.magazaId] = u.magazaAdi;
        });
        var $select = $('#magazaFiltre');
        $select.find('option:not(:first)').remove();
        Object.keys(magazalar).forEach(function(id) {
            $select.append('<option value="' + id + '">' + magazalar[id] + '</option>');
        });
    }

    // =============================================
    // Yorum İstatistikleri
    // =============================================
    function urunYorumIstatistik(urunId) {
        var yorumlar  = tumYorumlar.filter(function(y) { return y.urunId === urunId; });
        var puanlar   = yorumlar.filter(function(y) { return y.puan; });
        var nlpSayisi = yorumlar.filter(function(y) { return y.nlpIslendi; }).length;
        var ortPuan   = puanlar.length
            ? (puanlar.reduce(function(t, y) { return t + y.puan; }, 0) / puanlar.length).toFixed(1)
            : null;
        return {
            toplam:   yorumlar.length,
            ortPuan:  ortPuan,
            nlpSayisi: nlpSayisi,
            bekleyen: yorumlar.length - nlpSayisi
        };
    }

    // =============================================
    // Filtreleme & Sıralama
    // =============================================
    function filtreliUrunler() {
        var arama    = $('#aramaInput').val().toLowerCase();
        var magaza   = $('#magazaFiltre').val();
        var kumas    = $('input[name="kumasRadio"]:checked').val();
        var nlp      = $('#nlpFiltre').val();
        var siralama = $('#siralamaSelect').val();

        var seciliKesimler = [];
        $('.kesim-check:checked').each(function() { seciliKesimler.push($(this).val()); });

        var filtre = tumUrunler.filter(function(u) {
            var aramaUyumu  = !arama  || (u.ad || '').toLowerCase().includes(arama);
            var magazaUyumu = !magaza || String(u.magazaId) === String(magaza);
            var kesimUyumu  = seciliKesimler.length === 0 || seciliKesimler.includes(u.kesimTuru);
            var kumasUyumu  = !kumas
                || (kumas === 'esnek'    && u.kumasEsnek === true)
                || (kumas === 'standart' && u.kumasEsnek === false);

            var nlpUyumu = true;
            if (nlp) {
                var ist = urunYorumIstatistik(u.id);
                nlpUyumu = nlp === 'islendi'   ? ist.nlpSayisi > 0
                         : nlp === 'islenmedi' ? ist.bekleyen  > 0
                         : true;
            }

            return aramaUyumu && magazaUyumu && kesimUyumu && kumasUyumu && nlpUyumu;
        });

        if (siralama === 'ad') {
            filtre.sort(function(a, b) { return (a.ad || '').localeCompare(b.ad || '', 'tr'); });
        } else if (siralama === 'puan') {
            filtre.sort(function(a, b) {
                return (urunYorumIstatistik(b.id).ortPuan || 0) - (urunYorumIstatistik(a.id).ortPuan || 0);
            });
        } else if (siralama === 'kesim') {
            filtre.sort(function(a, b) { return (a.kesimTuru || '').localeCompare(b.kesimTuru || '', 'tr'); });
        }

        return filtre;
    }

    // =============================================
    // Kart Render
    // =============================================
    function kartRender(urunler) {
        var $alan = $('#urunKartlari');
        $alan.empty();

        if (urunler.length === 0) {
            $alan.html('<div class="col-12 text-center py-5 text-muted"><i class="fas fa-search fa-2x mb-2 d-block"></i>Sonuç bulunamadı.</div>');
            return;
        }

        urunler.forEach(function(u) {
            var ist      = urunYorumIstatistik(u.id);
            var r        = renk(u.id);
            var badgeler = '';
            if (u.kesimTuru)    badgeler += '<span class="kesim-badge">' + u.kesimTuru + ' Fit</span>';
            if (u.kumasEsnek)   badgeler += '<span class="kumas-esnek-badge"><i class="fas fa-expand-arrows-alt me-1"></i>Esnek</span>';
            if (ist.nlpSayisi)  badgeler += '<span class="nlp-badge nlp-islendi"><i class="fas fa-robot me-1"></i>NLP</span>';
            else if (ist.toplam) badgeler += '<span class="nlp-badge nlp-bekliyor"><i class="fas fa-clock me-1"></i>NLP Bekliyor</span>';

            $alan.append(
                '<div class="col-xl-4 col-md-6">' +
                    '<div class="urun-kart' + (u.silindiMi ? ' silindi' : '') + ' urun-kart-ac" data-id="' + u.id + '">' +
                        '<div class="urun-kart-header">' +
                            '<div class="urun-kart-ikon" style="background:' + r + '20;color:' + r + '">' +
                                '<i class="fas fa-tshirt"></i>' +
                            '</div>' +
                            '<div>' +
                                '<div class="urun-kart-ad">' + (u.ad || '—') + '</div>' +
                                '<div class="urun-kart-magaza"><i class="fas fa-store me-1"></i>' + (u.magazaAdi || '—') + '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="urun-kart-body">' +
                            '<div class="urun-kart-aciklama">' + (u.aciklama ? u.aciklama.substring(0, 80) + (u.aciklama.length > 80 ? '...' : '') : '<span class="text-muted fst-italic">Açıklama eklenmemiş.</span>') + '</div>' +
                            '<div class="urun-kart-badgeler">' + badgeler + '</div>' +
                        '</div>' +
                        '<div class="urun-kart-footer">' +
                            '<div>' + yildizlar(ist.ortPuan) + '</div>' +
                            '<span class="yorum-sayisi"><i class="fas fa-comment me-1"></i>' + ist.toplam + ' yorum</span>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        });
    }

    // =============================================
    // Liste Tablo Render
    // =============================================
    function listeRender(urunler) {
        var $tbody = $('#urunListeTablosu');
        $tbody.empty();

        if (urunler.length === 0) {
            $tbody.html('<tr><td colspan="8" class="text-center py-4 text-muted">Sonuç bulunamadı.</td></tr>');
            return;
        }

        urunler.forEach(function(u) {
            var ist = urunYorumIstatistik(u.id);
            $tbody.append(
                '<tr class="urun-kart-ac" data-id="' + u.id + '" style="cursor:pointer">' +
                    '<td><strong>' + (u.ad || '—') + '</strong></td>' +
                    '<td class="text-muted small">' + (u.magazaAdi || '—') + '</td>' +
                    '<td>' + (u.kesimTuru ? '<span class="kesim-badge">' + u.kesimTuru + '</span>' : '—') + '</td>' +
                    '<td>' + (u.kumasEsnek === true ? '<span class="kumas-esnek-badge">Esnek</span>' : '<span class="text-muted small">Standart</span>') + '</td>' +
                    '<td>' + yildizlar(ist.ortPuan) + '</td>' +
                    '<td class="text-muted small">' + ist.toplam + '</td>' +
                    '<td>' + (ist.nlpSayisi > 0
                        ? '<span class="nlp-badge nlp-islendi">' + ist.nlpSayisi + ' analiz</span>'
                        : '<span class="nlp-badge nlp-bekliyor">Bekliyor</span>') + '</td>' +
                    '<td><i class="fas fa-chevron-right text-muted small"></i></td>' +
                '</tr>'
            );
        });
    }

    // =============================================
    // Detay Modal
    // =============================================
    $(document).on('click', '.urun-kart-ac', function() {
        var id = parseInt($(this).data('id'));
        var u  = tumUrunler.find(function(x) { return x.id === id; });
        if (!u) return;

        aktifUrunId = id; // Global state'e kaydet
        var ist = urunYorumIstatistik(id);
        var r   = renk(id);

        $('#detayModalBaslik').html('<i class="fas fa-tshirt me-2" style="color:' + r + '"></i>' + u.ad);
        $('#detayIkon').html('<div style="width:64px;height:64px;border-radius:14px;background:' + r + '20;color:' + r + ';display:flex;align-items:center;justify-content:center;font-size:1.6rem"><i class="fas fa-tshirt"></i></div>');
        $('#detayAd').text(u.ad);
        $('#detayMagaza').html('<i class="fas fa-store me-1"></i>' + (u.magazaAdi || '—'));
        $('#detayOrtPuan').text(ist.ortPuan ? '★ ' + ist.ortPuan : '—');
        $('#detayYorumSayisi').text(ist.toplam);
        $('#detayNlpSayisi').text(ist.nlpSayisi);
        $('#detayBekleyenNlp').text(ist.bekleyen);
        $('#detayDuzenleBtn').attr('href', '/Urunler/Detay/' + u.id);

        var b = '';
        if (u.kesimTuru)        b += '<span class="kesim-badge">' + u.kesimTuru + ' Fit</span>';
        if (u.kumasEsnek === true) b += '<span class="kumas-esnek-badge"><i class="fas fa-expand-arrows-alt me-1"></i>Esnek Kumaş</span>';
        if (u.silindiMi)        b += '<span class="badge bg-danger-soft text-danger">Silinmiş</span>';
        $('#detayBadgeler').html(b);
        $('#detayAciklama').text(u.aciklama || 'Bu ürün için açıklama eklenmemiş.');

        $('#yorumSirala').val('yeni');
        yorumlariGoster(id, 'yeni');

        new bootstrap.Modal(document.getElementById('urunDetayModal')).show();
    });

    function yorumlariGoster(urunId, siralama) {
        var yorumlar = tumYorumlar.filter(function(y) { return y.urunId === urunId; });

        if (siralama === 'puan_yuksek') yorumlar.sort(function(a, b) { return (b.puan || 0) - (a.puan || 0); });
        else if (siralama === 'puan_dusuk') yorumlar.sort(function(a, b) { return (a.puan || 0) - (b.puan || 0); });
        else if (siralama === 'nlp') yorumlar.sort(function(a, b) { return (b.nlpIslendi ? 1 : 0) - (a.nlpIslendi ? 1 : 0); });
        else yorumlar.sort(function(a, b) { return b.id - a.id; }); // yeni

        var $liste = $('#yorumListesi');
        $liste.empty();

        if (yorumlar.length === 0) {
            $liste.html('<div class="text-center text-muted py-4"><i class="fas fa-comment-slash fa-2x mb-2 d-block"></i>Henüz yorum yok.</div>');
            return;
        }

        yorumlar.forEach(function(y) {
            $liste.append(
                '<div class="yorum-kart">' +
                    '<div class="d-flex align-items-center justify-content-between mb-1">' +
                        '<span>' + yildizlar(y.puan) + '</span>' +
                        nlpBadge(y.nlpIslendi) +
                    '</div>' +
                    '<div class="yorum-metin">"' + y.yorumMetni + '"</div>' +
                '</div>'
            );
        });
    }

    // Sıralama değişince aktif ürünün yorumlarını yenile (güvenli yöntem)
    $('#yorumSirala').on('change', function() {
        if (aktifUrunId) yorumlariGoster(aktifUrunId, $(this).val());
    });

    // =============================================
    // Görünüm Değiştir
    // =============================================
    $('#kartGorunumBtn').on('click', function() {
        $(this).addClass('active');
        $('#listeGorunumBtn').removeClass('active');
        $('#kartGorunum').show();
        $('#listeGorunum').hide();
    });

    $('#listeGorunumBtn').on('click', function() {
        $(this).addClass('active');
        $('#kartGorunumBtn').removeClass('active');
        $('#listeGorunum').show();
        $('#kartGorunum').hide();
    });

    // =============================================
    // Ana Render
    // =============================================
    function tabloYenile() {
        var filtre = filtreliUrunler();
        $('#sonucYazi').text(filtre.length + ' ürün gösteriliyor');
        kartRender(filtre);
        listeRender(filtre);
    }

    // =============================================
    // Filtre Dinleyicileri
    // =============================================
    $('#aramaInput').on('input', tabloYenile);
    $('#magazaFiltre, #nlpFiltre, #siralamaSelect').on('change', tabloYenile);
    $('input[name="kumasRadio"]').on('change', tabloYenile);
    $('.kesim-check').on('change', tabloYenile);
    $('#filtreTemizle').on('click', function() {
        $('#aramaInput').val('');
        $('#magazaFiltre, #nlpFiltre, #siralamaSelect').val('');
        $('input[name="kumasRadio"]').first().prop('checked', true);
        $('.kesim-check').prop('checked', false);
        tabloYenile();
    });

    // =============================================
    // Başlat
    // =============================================
    yukleVeriler();
});