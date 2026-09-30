$(function () {

    // =============================================
    // MAĞAZA ID YÖNETİMİ
    // URL'de ?magazaId=X varsa onu, yoksa 1 kullan.
    // =============================================
    var currentMagazaId = parseInt(
        new URLSearchParams(window.location.search).get('magazaId') || '1'
    );

    // =============================================
    // Sekme Yönetimi
    // =============================================
    var aktifTab = 'gelir';
    var grafiklerYuklendi = {};

    $('.analiz-nav-btn').on('click', function () {
        var tab = $(this).data('tab');
        if (tab === aktifTab) return;

        $('.analiz-nav-btn').removeClass('active');
        $(this).addClass('active');

        $('.analiz-tab-icerik').hide();
        $('#tab-' + tab).show();

        aktifTab = tab;

        if (!grafiklerYuklendi[tab]) {
            grafiklerYuklendi[tab] = true;
            setTimeout(function () { tabGrafikleriniYukle(tab); }, 50);
        }
    });

    function tabGrafikleriniYukle(tab) {
        if (tab === 'gelir')    yukleGelirTab();
        if (tab === 'nlp')      yukleNlpTab();
        if (tab === 'magaza')   yukleMagazaTab();
        if (tab === 'aktivite') yukleAktiviteTab();
    }

    $('#donemFiltre').on('change', function () {
        grafiklerYuklendi = {};
        tabGrafikleriniYukle(aktifTab);
        grafiklerYuklendi[aktifTab] = true;
    });

    $('#yenileBtn').on('click', function () {
        var $ikon = $(this).find('i');
        $ikon.addClass('fa-spin');
        setTimeout(function () {
            $ikon.removeClass('fa-spin');
            tabGrafikleriniYukle(aktifTab);
        }, 800);
    });

    // =============================================
    // SEKME 1: GELİR ANALİZİ
    // =============================================
    var gelirZamanChart = null;
    var gelirPaketChart = null;

    function yukleGelirTab() {
        $('#gelir_toplamKomisyon').text('₺ 412.800');
        $('#gelir_ortKomisyon').text('₺ 13.760');
        $('#gelir_enIyiMagaza').text('SportZone TR');
        $('#gelir_ortOran').text('%6.8');

        yukleGelirZamanChart('line');
        yukleGelirPaketChart();
    }

    // Global tanım: cshtml'deki onclick="gelirGrafikiDegistir(...)" çağrıları için
    window.gelirGrafikiDegistir = function (tip, btn) {
        // Aktif butonu güncelle
        $(btn).closest('.d-flex').find('.btn').removeClass('active');
        $(btn).addClass('active');
        yukleGelirZamanChart(tip);
    };

    function yukleGelirZamanChart(tip) {
        var ctx = document.getElementById('gelirZamanChart');
        if (!ctx) return;
        if (gelirZamanChart) gelirZamanChart.destroy();

        var etiketler = [
            '1 May','3 May','5 May','7 May','9 May','11 May',
            '13 May','15 May','17 May','19 May','21 May','23 May',
            '25 May','27 May','29 May','31 May'
        ];
        var veriler = [8200,9400,7800,11200,10500,13800,12400,15600,14200,16800,15900,18200,17400,19800,18600,21200];

        gelirZamanChart = new Chart(ctx, {
            type: tip,
            data: {
                labels: etiketler,
                datasets: [{
                    label: 'Komisyon Geliri (₺)',
                    data: veriler,
                    borderColor: '#4f46e5',
                    backgroundColor: tip === 'line'
                        ? 'rgba(79,70,229,0.07)'
                        : 'rgba(79,70,229,0.18)',
                    borderWidth: 2.5,
                    fill: tip === 'line',
                    tension: 0.4,
                    pointRadius: tip === 'line' ? 3 : 0,
                    pointBackgroundColor: '#4f46e5',
                    borderRadius: tip === 'bar' ? 5 : 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                return '₺ ' + c.raw.toLocaleString('tr-TR');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: {
                            callback: function (v) {
                                return '₺' + (v / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function yukleGelirPaketChart() {
        var ctx = document.getElementById('gelirPaketChart');
        if (!ctx) return;
        if (gelirPaketChart) gelirPaketChart.destroy();

        var paketler = ['Premium', 'Standart', 'Başlangıç'];
        var veriler  = [245600, 132400, 34800];
        var toplam   = veriler.reduce(function (t, v) { return t + v; }, 0);

        gelirPaketChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: paketler,
                datasets: [{
                    data: veriler,
                    backgroundColor: ['#4f46e5', '#10b981', '#6b7280'],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: false,
                cutout: '68%',
                plugins: { legend: { display: false } }
            }
        });

        $('#gelirPaketToplam').text('₺' + (toplam / 1000).toFixed(0) + 'K');

        var $leg = $('#gelirPaketLegend');
        $leg.empty();
        paketler.forEach(function (p, i) {
            var pct  = ((veriler[i] / toplam) * 100).toFixed(1);
            var renk = ['#4f46e5', '#10b981', '#6b7280'][i];
            $leg.append(
                '<div class="legend-item">' +
                    '<div class="legend-sol">' +
                        '<div class="legend-renk" style="background:' + renk + '"></div>' +
                        '<span class="legend-ad">' + p + '</span>' +
                    '</div>' +
                    '<span class="legend-deger">%' + pct + '</span>' +
                '</div>'
            );
        });
    }

    // =============================================
    // SEKME 2: NLP & DUYGU
    // =============================================
    var aktifDuyguFiltre      = 'all';
    var gosterilecekYorumSayisi = 5;
    var nlpDuyguChartInstance  = null;

    function yukleNlpTab() {
        yukleMagazaOzeti();
        yukleDuyguDagilimi();
        yukleTopTemalar();
        yukleNlpTrendChart();
        yukleKategoriMemnuniyetChart();
        yorumListesiniRender('all', 5);
        nlpOzetiniGuncelle($('#urunSecici').val());
    }

    // ─── GET /api/app/analytics/store-summary?magazaId=1 ───

    function yukleMagazaOzeti() {
        abp.ajax({
            url: abp.appPath + 'api/app/analytics/store-summary',
            type: 'GET',
            data: { magazaId: currentMagazaId }
        }).done(function (result) {
            // result property isimleri ABP tarafından camelCase'e çevrilir:
            // ToplamYorumSayisi → toplamYorumSayisi
            $('#nlp_toplam').text((result.toplamYorumSayisi || 0).toLocaleString('tr-TR'));
            $('#nlp_pozitif').text('—');   // duygu dağılımı ayrı endpoint'ten gelecek
            $('#nlp_negatif').text('—');
            $('#nlp_notr').text('—');
        }).fail(function (err) {
            console.error('Mağaza özeti yüklenemedi:', err);
            $('#nlp_toplam').text('—');
        });
    }

    // ─── GET /api/app/analytics/sentiment-distribution?magazaId=1 ───

    function yukleDuyguDagilimi() {
        abp.ajax({
            url: abp.appPath + 'api/app/analytics/sentiment-distribution',
            type: 'GET',
            data: { magazaId: currentMagazaId }
        }).done(function (result) {
            yukleNlpDuyguChart(result);

            // KPI kartlarını güncelle (etiket: "Pozitif" / "Negatif" / "Belirsiz")
            result.forEach(function (item) {
                var etiket = (item.etiket || '').toLowerCase();
                if (etiket === 'pozitif')          $('#nlp_pozitif').text((item.sayi || 0).toLocaleString('tr-TR'));
                else if (etiket === 'negatif')     $('#nlp_negatif').text((item.sayi || 0).toLocaleString('tr-TR'));
                else if (etiket === 'belirsiz' ||
                         etiket === 'nötr' ||
                         etiket === 'notr')        $('#nlp_notr').text((item.sayi || 0).toLocaleString('tr-TR'));
            });
        }).fail(function (err) {
            console.error('Duygu dağılımı yüklenemedi:', err);
            yukleNlpDuyguChart([
                { etiket: 'Pozitif',  sayi: 0, yuzde: 0 },
                { etiket: 'Negatif',  sayi: 0, yuzde: 0 },
                { etiket: 'Belirsiz', sayi: 0, yuzde: 0 }
            ]);
        });
    }

    // ─── GET /api/app/analytics/top-themes?magazaId=1 ───

    function yukleTopTemalar() {
        abp.ajax({
            url: abp.appPath + 'api/app/analytics/top-themes',
            type: 'GET',
            data: { magazaId: currentMagazaId }
        }).done(function (result) {
            yukleKelimeBulutuFromBackend(result);
        }).fail(function (err) {
            console.error('Tema verileri yüklenemedi:', err);
        });
    }

    // ─── NLP Grafikleri ──────────────────────────────────────

    function yukleNlpTrendChart() {
        var ctx = document.getElementById('nlpTrendChart');
        if (!ctx) return;

        var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: aylar,
                datasets: [
                    {
                        label: 'Pozitif',
                        data: [1200, 1450, 1380, 1620, 1890, 1780],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.08)',
                        fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3
                    },
                    {
                        label: 'Negatif',
                        data: [420, 380, 450, 310, 290, 340],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.06)',
                        fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3
                    },
                    {
                        label: 'Nötr',
                        data: [380, 320, 410, 380, 420, 390],
                        borderColor: '#6b7280',
                        backgroundColor: 'rgba(107,114,128,0.05)',
                        fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3,
                        borderDash: [4, 3]
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function yukleNlpDuyguChart(backendData) {
        var ctx = document.getElementById('nlpDuyguChart');
        if (!ctx) return;
        if (nlpDuyguChartInstance) nlpDuyguChartInstance.destroy();

        var renkMap = {
            'pozitif':  '#10b981',
            'negatif':  '#ef4444',
            'nötr':     '#9ca3af',
            'notr':     '#9ca3af',
            'belirsiz': '#9ca3af'
        };

        var duygular = backendData.map(function (item) {
            return {
                ad:   item.etiket,
                deger: item.sayi,
                renk: renkMap[(item.etiket || '').toLowerCase()] || '#6b7280'
            };
        });

        var toplam = duygular.reduce(function (t, d) { return t + d.deger; }, 0);

        // Donut merkez: en büyük dilimin yüzdesi
        var enBuyuk = duygular.reduce(function (max, d) { return d.deger > max.deger ? d : max; }, duygular[0] || { deger: 0 });
        var merkezYuzde = toplam > 0 ? ((enBuyuk.deger / toplam) * 100).toFixed(0) : '0';
        var merkezRenk  = enBuyuk ? (renkMap[(enBuyuk.ad || '').toLowerCase()] || '#4f46e5') : '#4f46e5';

        $('#nlpDuyguChart').closest('.donut-wrapper').find('.donut-merkez-deger')
            .text('%' + merkezYuzde)
            .css('color', merkezRenk);
        $('#nlpDuyguChart').closest('.donut-wrapper').find('.donut-merkez-etiket')
            .text(enBuyuk ? enBuyuk.ad : 'Veri yok');

        nlpDuyguChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: duygular.map(function (d) { return d.ad; }),
                datasets: [{
                    data: duygular.map(function (d) { return d.deger; }),
                    backgroundColor: duygular.map(function (d) { return d.renk; }),
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: { responsive: false, cutout: '68%', plugins: { legend: { display: false } } }
        });

        var $leg = $('#nlpDuyguLegend');
        $leg.empty();
        duygular.forEach(function (d) {
            var pct = toplam > 0 ? ((d.deger / toplam) * 100).toFixed(1) : '0.0';
            $leg.append(
                '<div class="legend-item">' +
                    '<div class="legend-sol">' +
                        '<div class="legend-renk" style="background:' + d.renk + '"></div>' +
                        '<span class="legend-ad">' + d.ad + '</span>' +
                    '</div>' +
                    '<span class="legend-deger">%' + pct + '</span>' +
                '</div>'
            );
        });
    }

    function yukleKelimeBulutuFromBackend(temalar) {
        var $konteyner = $('#kelimeBulutu');
        $konteyner.empty();

        if (!temalar || temalar.length === 0) {
            $konteyner.append('<p class="text-muted text-center w-100">Henüz tema verisi yok.</p>');
            return;
        }

        var renkler = ['#4f46e5', '#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444'];
        var boyutlar = [1.1, 1.0, 0.9, 0.85, 0.8];

        temalar.forEach(function (tema, index) {
            var fontSize = boyutlar[Math.min(index, 4)];
            var renk     = renkler[index % renkler.length];
            $konteyner.append(
                '<span class="kelime-chip" style="font-size:' + fontSize + 'rem;' +
                    'background:' + renk + '1A;color:' + renk + ';" ' +
                    'title="' + tema.sayi + ' yorumda (%' + tema.yuzde + ')">' +
                    tema.etiket +
                '</span>'
            );
        });
    }

    function yukleKategoriMemnuniyetChart() {
        var ctx = document.getElementById('kategoriMemnuniyetChart');
        if (!ctx) return;

        var kategoriler = ['Üst Giyim', 'Alt Giyim', 'Spor', 'Aksesuar', 'Dış Giyim'];
        var skorlar     = [4.3, 3.9, 4.6, 4.1, 3.7];
        var renkler     = skorlar.map(function (s) {
            if (s >= 4.4) return 'rgba(16,185,129,0.8)';
            if (s >= 4.0) return 'rgba(79,70,229,0.7)';
            return 'rgba(245,158,11,0.7)';
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: kategoriler,
                datasets: [{
                    label: 'Ort. Memnuniyet',
                    data: skorlar,
                    backgroundColor: renkler,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: function (c) { return '★ ' + c.raw + ' / 5.0'; } } }
                },
                scales: {
                    x: { min: 3, max: 5, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: function (v) { return '★' + v; } } },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    // ─── GET /api/app/analytics/reviews ─────────────────────

    function yorumListesiniRender(duygu, limit) {
        var $liste = $('#yorumListesi');
        $liste.html(
            '<div class="text-center py-3 text-muted">' +
                '<i class="fas fa-spinner fa-pulse me-2"></i>Yükleniyor...' +
            '</div>'
        );

        var params = { magazaId: currentMagazaId, maxSayi: limit };
        if (duygu !== 'all') params.duyguEtiketi = duygu.charAt(0).toUpperCase() + duygu.slice(1);

        var urunId = $('#urunSecici').val();
        if (urunId !== 'all') params.urunId = parseInt(urunId);

        abp.ajax({
            url: abp.appPath + 'api/app/analytics/reviews',
            type: 'GET',
            data: params
        }).done(function (yorumlar) {
            $liste.empty();

            if (!yorumlar || yorumlar.length === 0) {
                $liste.html('<p class="text-muted text-center py-3">Bu filtre için yorum bulunamadı.</p>');
                $('#dahaFazlaYorumBtn').hide();
                return;
            }

            yorumlar.forEach(function (yorum) {
                var yildizHtml = '';
                for (var i = 0; i < 5; i++) {
                    yildizHtml += i < yorum.yildiz
                        ? '<i class="fas fa-star text-warning" style="font-size:.7rem"></i>'
                        : '<i class="far fa-star text-muted"  style="font-size:.7rem"></i>';
                }

                var etiket = (yorum.duyguEtiketi || '').toLowerCase();
                var duyguBadge =
                    (etiket === 'olumlu' || etiket === 'pozitif')
                        ? '<span class="badge bg-success-soft text-success"><i class="fas fa-smile me-1"></i>Pozitif</span>'
                    : (etiket === 'olumsuz' || etiket === 'negatif')
                        ? '<span class="badge bg-danger-soft text-danger"><i class="fas fa-frown me-1"></i>Negatif</span>'
                        : '<span class="badge bg-secondary-soft text-secondary"><i class="fas fa-meh me-1"></i>Nötr</span>';

                // ABP'nin toUserTime ile UTC → kullanıcı saatine çevir
                var zaman = yorum.zaman
                    ? (abp.timing && abp.timing.toUserTime
                        ? abp.timing.toUserTime(new Date(yorum.zaman)).toLocaleDateString('tr-TR')
                        : new Date(yorum.zaman).toLocaleDateString('tr-TR'))
                    : '';

                $liste.append(
                    '<div class="yorum-item" data-id="' + yorum.id + '">' +
                        '<div class="yorum-icerik">' +
                            '<div class="yorum-ust">' +
                                '<span class="yorum-kullanici">' + yorum.kullanici + '</span>' +
                                '<span class="ms-2">' + yildizHtml + '</span>' +
                                '<span class="ms-2">' + duyguBadge + '</span>' +
                                '<span class="yorum-tarih ms-auto">' + zaman + '</span>' +
                            '</div>' +
                            '<p class="yorum-metin mb-0">' + yorum.metin + '</p>' +
                            '<div class="yorum-analiz">' +
                                '<span class="badge">Tema: ' + yorum.tema + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );
            });

            $('#dahaFazlaYorumBtn').toggle(yorumlar.length >= limit);
        }).fail(function () {
            $liste.html(
                '<p class="text-danger text-center py-3">' +
                    '<i class="fas fa-exclamation-circle me-2"></i>Yorumlar yüklenemedi.' +
                '</p>'
            );
        });
    }

    // ─── GET /api/app/analytics/top-themes (özet paneli için) ───

    function nlpOzetiniGuncelle(urunId) {
        var params = { magazaId: currentMagazaId };
        if (urunId && urunId !== 'all') params.urunId = parseInt(urunId);

        abp.ajax({
            url: abp.appPath + 'api/app/analytics/top-themes',
            type: 'GET',
            data: params
        }).done(function (temalar) {
            var $liste = $('#ozetListesi');
            $liste.empty();

            var oneriMap = {
                'beden':  'Beden tablosunu güncelleyin ve farklı bedenler için ölçü rehberi ekleyin.',
                'kumas':  'Kumaş kalitesi açıklamasını detaylandırın, bakım talimatları ekleyin.',
                'iade':   'İade oranı yüksek; ürün açıklaması ve görseller gözden geçirilmeli.',
                'kalip':  'Kalıp bilgisi ürün detayına eklenmeli, model ölçüleri paylaşılmalı.',
                'genel':  'Genel müşteri geri bildirimlerini düzenli olarak inceleyin.'
            };

            if (temalar && temalar.length > 0) {
                temalar.forEach(function (tema) {
                    $liste.append(
                        '<li><i class="fas fa-chart-line text-primary me-2"></i>' +
                        tema.etiket + ' — ' + tema.sayi + ' yorum (%' + tema.yuzde + ')</li>'
                    );
                });
                var enCok = temalar[0];
                var oneri = oneriMap[(enCok.etiket || '').toLowerCase()] || oneriMap['genel'];
                $('.ozet-oneri span').text('AI Önerisi: ' + oneri);
            } else {
                $liste.append('<li class="text-muted">Henüz tema verisi yok.</li>');
                $('.ozet-oneri span').text('AI Önerisi: Yeterli veri birikmesi bekleniyor.');
            }
        }).fail(function () {
            $('#ozetListesi').html('<li class="text-danger">Veriler yüklenemedi.</li>');
        });
    }

    // ─── Filtreler ───────────────────────────────────────────

    $('#duyguFiltreBtnGrubu .btn').on('click', function () {
        $('#duyguFiltreBtnGrubu .btn').removeClass('active');
        $(this).addClass('active');
        aktifDuyguFiltre = $(this).data('duygu');
        gosterilecekYorumSayisi = 5;
        yorumListesiniRender(aktifDuyguFiltre, gosterilecekYorumSayisi);
    });

    $('#dahaFazlaYorumBtn button').on('click', function () {
        gosterilecekYorumSayisi += 5;
        yorumListesiniRender(aktifDuyguFiltre, gosterilecekYorumSayisi);
    });

    $(document).on('click', '.yorum-item', function () {
        var metin     = $(this).find('.yorum-metin').text();
        var kullanici = $(this).find('.yorum-kullanici').text();
        abp.message.info('"' + metin + '"', kullanici + ' - Yorum Detayı');
    });

    // =============================================
    // SEKME 3: MAĞAZA KARŞILAŞTIRMA
    // =============================================
    var magazaKarsilastirmaChart = null;

    function yukleMagazaTab() {
        yukleRadarChart();
        yukleMagazaKarsilastirmaChart('komisyon');
        yukleMagazaSiralamaTablosu();
        $('#magazaMetrikSecim').off('change').on('change', function () {
            yukleMagazaKarsilastirmaChart($(this).val());
        });
    }

    function yukleRadarChart() {
        var ctx = document.getElementById('magazaRadarChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Komisyon', 'Ürün Sayısı', 'Yorum Puanı', 'AI Skoru', 'Aktiflik'],
                datasets: [
                    { label: 'SportZone TR', data: [90,85,78,92,95], borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.12)', pointBackgroundColor: '#4f46e5', borderWidth: 2 },
                    { label: 'FashionHub',   data: [70,92,88,74,80], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)',  pointBackgroundColor: '#10b981', borderWidth: 2 },
                    { label: 'ActiveWear',   data: [60,68,82,65,70], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', pointBackgroundColor: '#f59e0b', borderWidth: 2 }
                ]
            },
            options: {
                responsive: false,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } } },
                scales: {
                    r: {
                        beginAtZero: true, max: 100,
                        ticks: { stepSize: 25, font: { size: 10 } },
                        grid: { color: 'rgba(0,0,0,0.06)' },
                        pointLabels: { font: { size: 11 } }
                    }
                }
            }
        });
    }

    function yukleMagazaKarsilastirmaChart(metrik) {
        var ctx = document.getElementById('magazaKarsilastirmaChart');
        if (!ctx) return;
        if (magazaKarsilastirmaChart) magazaKarsilastirmaChart.destroy();

        var veriSet = {
            komisyon: { etiketler: ['SportZone TR','FashionHub','ActiveWear','FitStyle','RunnerShop'], veriler: [82400,61200,48700,39600,31800], birim: '₺', renk: '#4f46e5' },
            urun:     { etiketler: ['SportZone TR','FashionHub','ActiveWear','FitStyle','RunnerShop'], veriler: [1840,2210,980,760,620],           birim: '',  renk: '#f59e0b' },
            yorum:    { etiketler: ['SportZone TR','FashionHub','ActiveWear','FitStyle','RunnerShop'], veriler: [3240,4180,1820,1390,980],          birim: '',  renk: '#10b981' }
        };
        var d = veriSet[metrik];

        magazaKarsilastirmaChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: d.etiketler,
                datasets: [{ label: $('#magazaMetrikSecim option:selected').text(), data: d.veriler, backgroundColor: d.renk + '33', borderColor: d.renk, borderWidth: 2, borderRadius: 6 }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return d.birim + c.raw.toLocaleString('tr-TR'); } } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: function (v) { return d.birim ? d.birim + (v/1000).toFixed(0) + 'K' : v; } } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function yukleMagazaSiralamaTablosu() {
        var magazalar = [
            { sira:1, ad:'SportZone TR', paket:'Premium',   komisyon:'₺82.400', urun:1840, yorum:3240, memnuniyet:4.6, puan:92 },
            { sira:2, ad:'FashionHub',   paket:'Standart',  komisyon:'₺61.200', urun:2210, yorum:4180, memnuniyet:4.2, puan:80 },
            { sira:3, ad:'ActiveWear',   paket:'Premium',   komisyon:'₺48.700', urun:980,  yorum:1820, memnuniyet:4.4, puan:74 },
            { sira:4, ad:'FitStyle',     paket:'Standart',  komisyon:'₺39.600', urun:760,  yorum:1390, memnuniyet:3.9, puan:62 },
            { sira:5, ad:'RunnerShop',   paket:'Başlangıç', komisyon:'₺31.800', urun:620,  yorum:980,  memnuniyet:4.1, puan:55 }
        ];
        var $tbody = $('#magazaSiralamaTablosu');
        $tbody.empty();
        magazalar.forEach(function (m) {
            var siraSinif = ['','sira-1','sira-2','sira-3'][m.sira] || 'sira-diger';
            var paketBadge =
                m.paket === 'Premium'
                    ? '<span class="badge bg-warning-soft text-warning"><i class="fas fa-crown me-1" style="font-size:.6rem"></i>' + m.paket + '</span>'
                : m.paket === 'Standart'
                    ? '<span class="badge bg-primary-soft text-primary">' + m.paket + '</span>'
                    : '<span class="badge bg-secondary-soft text-secondary">' + m.paket + '</span>';
            $tbody.append(
                '<tr><td><span class="sira-rozeti ' + siraSinif + '">' + m.sira + '</span></td>' +
                '<td><strong>' + m.ad + '</strong></td><td>' + paketBadge + '</td>' +
                '<td><strong>' + m.komisyon + '</strong></td>' +
                '<td>' + m.urun.toLocaleString('tr-TR') + '</td>' +
                '<td>' + m.yorum.toLocaleString('tr-TR') + '</td>' +
                '<td><span class="text-warning">★</span> ' + m.memnuniyet.toFixed(1) + '</td>' +
                '<td><div class="performans-bar"><div class="performans-bar-dolu" style="width:' + m.puan + '%"></div></div></td></tr>'
            );
        });
    }

    // =============================================
    // SEKME 4: AKTİVİTE HARİTASI
    // =============================================
    function yukleAktiviteTab() {
        var gunler = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
        var saatler = ['08','10','12','14','16','18','20','22'];
        var veri = [
            [10,15,20,18,22,8,5],
            [25,40,52,48,55,18,12],
            [60,72,85,80,78,35,22],
            [75,88,95,92,90,48,30],
            [82,90,88,85,80,55,38],
            [65,70,72,68,65,42,28],
            [45,50,55,52,48,30,18],
            [20,25,28,26,22,15,8]
        ];
        var $konteyner = $('#heatmapKonteyner');
        $konteyner.empty();

        saatler.forEach(function (saat, si) {
            var $satir = $('<div class="heatmap-satir"></div>');
            $satir.append('<span class="heatmap-saat-etiket">' + saat + ':00</span>');
            gunler.forEach(function (gun, gi) {
                var yogunluk = veri[si][gi];
                var alfa = 0.08 + (yogunluk / 100) * 0.92;
                $satir.append(
                    '<div class="heatmap-hucre" ' +
                        'style="background:rgba(79,70,229,' + alfa.toFixed(2) + ')" ' +
                        'title="' + gun + ' ' + saat + ':00 — ' + yogunluk + ' sorgu"></div>'
                );
            });
            $konteyner.append($satir);
        });

        var $gunEtiketleri = $('#heatmapGunEtiketleri');
        $gunEtiketleri.empty();
        $gunEtiketleri.append('<span class="heatmap-saat-etiket" style="visibility:hidden"></span>');
        gunler.forEach(function (gun) {
            $gunEtiketleri.append('<span class="heatmap-gun-ad">' + gun + '</span>');
        });

        yukleSaatlikAktiviteChart();
        yukleGunlukAktiviteChart();
    }

    function yukleSaatlikAktiviteChart() {
        var ctx = document.getElementById('saatlikAktiviteChart');
        if (!ctx) return;
        var saatVeriler = [120,280,520,680,740,820,890,850,810,760,640,480,320,180,90];
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'],
                datasets: [{
                    label: 'Widget Sorgu',
                    data: saatVeriler,
                    backgroundColor: saatVeriler.map(function (v) {
                        return 'rgba(14,165,233,' + (0.15 + (v / 890) * 0.65).toFixed(2) + ')';
                    }),
                    borderColor: '#0ea5e9', borderWidth: 1.5, borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } }
            }
        });
    }

    function yukleGunlukAktiviteChart() {
        var ctx = document.getElementById('gunlukAktiviteChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'],
                datasets: [{
                    label: 'Günlük Sorgu',
                    data: [4820,5340,5980,5620,5180,3240,2180],
                    backgroundColor: ['rgba(16,185,129,0.7)','rgba(16,185,129,0.7)','rgba(16,185,129,0.7)','rgba(16,185,129,0.7)','rgba(16,185,129,0.7)','rgba(107,114,128,0.5)','rgba(107,114,128,0.5)'],
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return c.raw.toLocaleString('tr-TR') + ' sorgu'; } } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: function (v) { return (v/1000).toFixed(0) + 'K'; } } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // =============================================
    // Ürün Seçici
    // =============================================
    $('#urunSecici').on('change', function () {
        var urunId = $(this).val();
        var urunAd = $(this).find('option:selected').text();

        if (urunId !== 'all') {
            $('#urunDetayKarti').show();
            $('#urunAdi').text(urunAd);

            var urunVerileri = {
                1: { kategori:'Spor',     stok:1240, fiyat:'₺ 1,299', skor:86, durum:'Stokta Var' },
                2: { kategori:'Fitness',  stok:580,  fiyat:'₺ 899',   skor:79, durum:'Stokta Var' },
                3: { kategori:'Aksesuar', stok:2100, fiyat:'₺ 349',   skor:82, durum:'Stokta Var' },
                4: { kategori:'Aksesuar', stok:95,   fiyat:'₺ 129',   skor:85, durum:'Son 5 Ürün!' }
            };
            var data = urunVerileri[parseInt(urunId)];
            if (data) {
                $('#urunKategori').text(data.kategori);
                $('#urunStok').text(data.stok.toLocaleString('tr-TR'));
                $('#urunFiyat').text(data.fiyat);
                $('#aiPerformansSkoru').text(data.skor);
                $('#aiSkorProgress').css('width', data.skor + '%');
                $('#urunStokDurumu').text(data.durum);
                if (data.durum.includes('Son'))
                    $('#urunStokDurumu').removeClass('bg-success-soft text-success').addClass('bg-warning-soft text-warning');
                else
                    $('#urunStokDurumu').removeClass('bg-warning-soft text-warning').addClass('bg-success-soft text-success');
            }
            if (aktifTab === 'nlp') {
                nlpOzetiniGuncelle(urunId);
                yorumListesiniRender(aktifDuyguFiltre, gosterilecekYorumSayisi);
            }
        } else {
            $('#urunDetayKarti').hide();
            if (aktifTab === 'nlp') {
                nlpOzetiniGuncelle('all');
                yorumListesiniRender(aktifDuyguFiltre, gosterilecekYorumSayisi);
            }
        }
    });

    setTimeout(function () {
        if ($('#urunSecici').val() !== 'all') $('#urunDetayKarti').show();
    }, 100);

    // =============================================
    // Aksiyon Butonları
    // =============================================
    $('#exportPdfBtn').on('click', function () {
        abp.message.info('PDF raporu hazırlanıyor...', 'Rapor Dışa Aktar');
    });
    $('#exportExcelBtn').on('click', function () {
        abp.message.info('Excel raporu hazırlanıyor...', 'Rapor Dışa Aktar');
    });
    $('#shareReportBtn').on('click', function () {
        abp.message.info('Rapor paylaşım linki oluşturuluyor...', 'Paylaş');
    });

    // =============================================
    // Tam Ekran Modal
    // =============================================
    $('.fullscreen-chart-btn').on('click', function () {
        var targetId = $(this).data('target');
        if (!targetId) return;
        var $element = $('#' + targetId);
        if (!$element.length) return;

        var $modal = $('<div class="chart-fullscreen-modal"></div>');
        var $clone = $element.clone();
        $clone.css({ 'max-width': '90%', 'max-height': '90%' });
        $modal.append($clone);
        $('body').append($modal);

        $modal.on('click', function () { $modal.remove(); $(document).off('keyup.chartFullscreen'); });
        $(document).on('keyup.chartFullscreen', function (e) {
            if (e.key === 'Escape') { $modal.remove(); $(document).off('keyup.chartFullscreen'); }
        });
    });

    // =============================================
    // Başlangıç
    // =============================================
    grafiklerYuklendi['gelir'] = true;
    yukleGelirTab();
});