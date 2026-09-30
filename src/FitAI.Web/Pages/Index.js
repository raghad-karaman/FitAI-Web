$(function () {

    // =============================================
    // Tarih Gösterimi
    // =============================================
    function tarihGoster() {
        var tr = new Date().toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        $('#currentDate').text(tr);
    }
    tarihGoster();

    // =============================================
    // Örnek Veriler (API'den gelecek)
    // =============================================
    var dashboardVerileri = {
        toplamMagaza: 12,
        toplamKullanici: 845,
        toplamUrun: 1240,
        buAyKomisyon: 189500,
        ortalamaUyum: 86.5,
        widgetSorgu: 18750,
        donusumOrani: 24.8,
        aiAttributionSatis: 62400
    };

    var magazalar = [
        { ad: 'SportZone TR', paket: 'Premium', komisyon: 82400, durum: 'aktif' },
        { ad: 'FashionHub', paket: 'Standart', komisyon: 61200, durum: 'aktif' },
        { ad: 'ActiveWear', paket: 'Premium', komisyon: 48700, durum: 'aktif' },
        { ad: 'FitStyle', paket: 'Standart', komisyon: 39600, durum: 'pasif' },
        { ad: 'RunnerShop', paket: 'Baslangic', komisyon: 31800, durum: 'aktif' }
    ];

    var bildirimler = [
        { baslik: 'SportZone TR mağazası için yeni yorum analizi tamamlandı.', zaman: '2 dakika önce', icon: 'fas fa-robot', renk: 'info' },
        { baslik: 'Aylık komisyon raporu hazırlandı. PDF olarak indirebilirsiniz.', zaman: '1 saat önce', icon: 'fas fa-file-alt', renk: 'primary' },
        { baslik: 'Premium pakete geçiş yapan mağazalar: ActiveWear, FitStyle', zaman: '3 saat önce', icon: 'fas fa-crown', renk: 'warning' },
        { baslik: 'NLP analizinde %78 pozitif yorum oranı yakalandı.', zaman: '5 saat önce', icon: 'fas fa-brain', renk: 'success' },
        { baslik: 'Yeni ürün ekleme limiti güncellendi. Detaylar için tıklayın.', zaman: '1 gün önce', icon: 'fas fa-info-circle', renk: 'secondary' }
    ];

    // KPI Güncelle
    function kpiGuncelle() {
        $('#toplamMagaza').text(dashboardVerileri.toplamMagaza);
        $('#toplamKullanici').text(dashboardVerileri.toplamKullanici.toLocaleString('tr-TR'));
        $('#toplamUrun').text(dashboardVerileri.toplamUrun.toLocaleString('tr-TR'));
        $('#toplamKomisyon').text('₺ ' + dashboardVerileri.buAyKomisyon.toLocaleString('tr-TR'));

        $('#ortalamaUyumSkoru').text(dashboardVerileri.ortalamaUyum.toFixed(1) + '/100');
        $('#uyumSkoruBar').css('width', dashboardVerileri.ortalamaUyum + '%');

        $('#widgetSorguSayisi').text(dashboardVerileri.widgetSorgu.toLocaleString('tr-TR'));
        $('#satinAlmaOrani').text('%' + dashboardVerileri.donusumOrani);
        $('#aiAttributionSayi').text('₺ ' + dashboardVerileri.aiAttributionSatis.toLocaleString('tr-TR'));
    }

    // Grafik - Aylık Komisyon
    var komisyonChart = null;

    function komisyonGrafikYukle() {
        var ctx = document.getElementById('komisyonChart');
        if (!ctx) return;
        if (komisyonChart) komisyonChart.destroy();

        var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        var veriler = [152000, 168000, 185000, 198000, 212000, 234000];

        komisyonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: aylar,
                datasets: [{
                    label: 'Komisyon Geliri (₺)',
                    data: veriler,
                    backgroundColor: 'rgba(79, 70, 229, 0.3)',
                    borderColor: '#4f46e5',
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.65,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(c) {
                                return '₺ ' + c.raw.toLocaleString('tr-TR');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: {
                            callback: function(v) {
                                return '₺' + (v / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Mağaza Tablosu
    function magazaTablosuRender() {
        var $tbody = $('#magazaTablosu');
        $tbody.empty();

        if (magazalar.length === 0) {
            $tbody.html('<tr><td colspan="4" class="text-center py-4 text-muted">Veri bulunamadı</td></tr>');
            return;
        }

        magazalar.forEach(function(m) {
            var paketBadge = m.paket === 'Premium' 
                ? '<span class="badge bg-warning-soft text-warning"><i class="fas fa-crown me-1"></i>' + m.paket + '</span>'
                : m.paket === 'Standart'
                ? '<span class="badge bg-primary-soft text-primary">' + m.paket + '</span>'
                : '<span class="badge bg-secondary-soft text-secondary">' + m.paket + '</span>';
            
            var durumBadge = m.durum === 'aktif'
                ? '<span class="badge bg-success-soft text-success"><i class="fas fa-circle me-1" style="font-size:0.4rem"></i>Aktif</span>'
                : '<span class="badge bg-secondary-soft text-secondary">Pasif</span>';

            $tbody.append(
                '<tr>' +
                    '<td class="fw-semibold">' + m.ad + '</td>' +
                    '<td>' + paketBadge + '</td>' +
                    '<td class="fw-semibold">₺ ' + m.komisyon.toLocaleString('tr-TR') + '</td>' +
                    '<td>' + durumBadge + '</td>' +
                '</tr>'
            );
        });
    }

    // Bildirim Listesi
    function bildirimListesiRender() {
        var $liste = $('#bildirimListesi');
        $liste.empty();

        if (bildirimler.length === 0) {
            $liste.html('<li class="bildirim-item"><div class="text-muted">Bildirim bulunmuyor</div></li>');
            return;
        }

        bildirimler.forEach(function(b) {
            var iconClass = b.renk === 'primary' ? 'text-primary' 
                          : b.renk === 'success' ? 'text-success'
                          : b.renk === 'warning' ? 'text-warning'
                          : b.renk === 'info' ? 'text-info'
                          : 'text-secondary';
            $liste.append(
                '<li class="bildirim-item">' +
                    '<div class="bildirim-icon bg-' + b.renk + '-soft">' +
                        '<i class="' + b.icon + ' ' + iconClass + '"></i>' +
                    '</div>' +
                    '<div class="bildirim-icerik">' +
                        '<div class="bildirim-baslik">' + b.baslik + '</div>' +
                        '<div class="bildirim-zaman text-muted">' + b.zaman + '</div>' +
                    '</div>' +
                '</li>'
            );
        });
    }

    // Yenileme Butonu
    $('#refreshDashboardBtn').on('click', function() {
        var $btn = $(this);
        $btn.find('i').addClass('fa-spin');
        
        setTimeout(function() {
            komisyonGrafikYukle();
            kpiGuncelle();
            magazaTablosuRender();
            bildirimListesiRender();
            $btn.find('i').removeClass('fa-spin');
            alert('Dashboard yenilendi.'); // ABP mesaj yerine basit alert
        }, 800);
    });

    // Rapor indirme simülasyonu
    $('#exportDashboardBtn').on('click', function() {
        alert('Dashboard raporu hazırlanıyor...');
    });

    // =============================================
    // AI - Vücut Uyum Skoru Analizi
    // =============================================
    $('#aiAnalizBtn').on('click', function () {
        var vucutTipi  = $('#aiVucutTipi').val();
        var urunKesim  = $('#aiUrunKesim').val();
        var kumasEsnek = parseInt($('#aiKumasEsnek').val());
        var beden      = $('#aiMevcutBeden').val();
        var yorumOzeti = $('#aiYorumOzeti').val().trim() || null;

        $('#aiAnalizSonuc, #aiAnalizHata').hide();
        $('#aiAnalizYukleniyor').show();
        $('#aiAnalizBtn').prop('disabled', true);

        $.ajax({
            url: '/api/ai/uyum-skoru',
            type: 'POST',
            contentType: 'application/json',
            timeout: 15000,
            headers: {
    'RequestVerificationToken': abp.security.antiForgery.getToken()
            },
            data: JSON.stringify({
                vucutTipi:   vucutTipi,
                urunKesim:   urunKesim,
                kumasEsnek:  kumasEsnek,
                mevcutBeden: beden,
                yorumOzeti:  yorumOzeti
            }),
            success: function (r) {
                $('#aiAnalizYukleniyor').hide();
                $('#aiAnalizBtn').prop('disabled', false);

                var skor = r.uyumSkoru || 0;
                $('#aiUyumSkoru').text(skor + ' / 100');
                $('#aiUyumSkoruBar').css('width', skor + '%');

                var riskRenk = r.iadeRiski === 'Düşük' ? 'text-success'
                             : r.iadeRiski === 'Orta'  ? 'text-warning'
                             :                           'text-danger';
                $('#aiIadeRiski').removeClass('text-success text-warning text-danger')
                                 .addClass(riskRenk).text(r.iadeRiski || '—');
                $('#aiOngBeden').text(r.recommendedSize || '—');
                $('#aiTavsiye').text(r.tavsiye || '');
                $('#aiAnalizHata').hide();
                $('#aiAnalizSonuc').fadeIn(300);
            },
            error: function (xhr, status) {
                $('#aiAnalizYukleniyor').hide();
                $('#aiAnalizBtn').prop('disabled', false);
                $('#aiAnalizSonuc').hide();

                var msg;
                if (status === 'timeout') {
                    msg = 'AI servisi yanıt vermedi (zaman aşımı). Lütfen tekrar deneyin.';
                } else if (xhr.status === 401) {
                    msg = 'Oturum süresi dolmuş, lütfen sayfayı yenileyip tekrar deneyin.';
                } else if (xhr.status === 400) {
                    msg = (xhr.responseJSON && xhr.responseJSON.detail) || 'Geçersiz veri gönderildi.';
                } else if (xhr.status === 0) {
                    msg = 'AI servisine bağlanılamadı. Servisin çalıştığını kontrol edin.';
                } else {
                    msg = (xhr.responseJSON && xhr.responseJSON.detail) || 'AI servisinde beklenmeyen bir hata oluştu.';
                }
                $('#aiAnalizHata').text(msg).show();
            }
        });
    });

    // =============================================
    // AI - NLP Toplu Yorum Analizi
    // =============================================
    $('#nlpAnalizBtn').on('click', function () {
        var satirlar = $('#nlpYorumlar').val().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        if (satirlar.length === 0) {
            alert('Lütfen en az bir yorum girin.');
            return;
        }
        var urunId   = parseInt($('#nlpUrunId').val()) || 1;
        var magazaId = parseInt($('#nlpMagazaId').val()) || 1;

        var yorumlar = satirlar.map(function (s) {
            return { yorumMetni: s, urunId: urunId, magazaId: magazaId };
        });

        $('#nlpSonucListesi, #nlpAnalizHata, #nlpUyarilar').hide();
        $('#nlpAnalizYukleniyor').show();
        $('#nlpAnalizBtn').prop('disabled', true);

        $.ajax({
            url: '/api/ai/yorum-analiz/toplu',
            type: 'POST',
            contentType: 'application/json',
            timeout: 20000,
            headers: {
                'RequestVerificationToken': abp.security.antiForgery.getToken()
            },
            data: JSON.stringify({ yorumlar: yorumlar }),
            success: function (r) {
                $('#nlpAnalizYukleniyor').hide();
                $('#nlpAnalizBtn').prop('disabled', false);

                if (r.uyarilar && r.uyarilar.length > 0) {
                    $('#nlpUyarilar').html(r.uyarilar.join('<br>')).show();
                }

                var sonuclar = r.analizSonuclari || [];
                if (sonuclar.length === 0) {
                    $('#nlpAnalizHata').text('Analiz sonucu döndürülmedi.').show();
                    return;
                }

                var $ul = $('#nlpSonuclar').empty();
                sonuclar.forEach(function (s) {
                    var duyguRenk = s.duyguEtiketi === 'Olumlu' ? 'text-success'
                                  : s.duyguEtiketi === 'Olumsuz' ? 'text-danger'
                                  : 'text-secondary';
                    var duyguIcon = s.duyguEtiketi === 'Olumlu' ? 'fa-smile'
                                  : s.duyguEtiketi === 'Olumsuz' ? 'fa-frown'
                                  : 'fa-meh';
                    var skor = (typeof s.duyguSkoru === 'number') ? s.duyguSkoru.toFixed(2) : '—';
                    $ul.append(
                        '<li class="nlp-sonuc-item mb-2 p-2 rounded border">' +
                            '<div class="d-flex justify-content-between align-items-start">' +
                                '<span class="small">"' + $('<span>').text(s.yorum).html() + '"</span>' +
                                '<span class="' + duyguRenk + ' ms-2 flex-shrink-0"><i class="fas ' + duyguIcon + '"></i> ' + (s.duyguEtiketi || '—') + '</span>' +
                            '</div>' +
                            '<div class="d-flex gap-2 mt-1">' +
                                '<span class="badge bg-secondary-soft text-secondary small">Tema: ' + (s.tema || 'genel') + '</span>' +
                                '<span class="badge bg-light text-dark small">Skor: ' + skor + '</span>' +
                            '</div>' +
                            '<div class="small text-muted mt-1"><i class="fas fa-lightbulb me-1 text-warning"></i>' + (s.oneriMetni || '') + '</div>' +
                        '</li>'
                    );
                });
                $('#nlpAnalizHata').hide();
                $('#nlpSonucListesi').fadeIn(300);
            },
            error: function (xhr, status) {
                $('#nlpAnalizYukleniyor').hide();
                $('#nlpAnalizBtn').prop('disabled', false);

                var msg;
                if (status === 'timeout') {
                    msg = 'NLP servisi yanıt vermedi (zaman aşımı). Lütfen tekrar deneyin.';
                } else if (xhr.status === 401) {
                    msg = 'Oturum süresi dolmuş, lütfen sayfayı yenileyip tekrar deneyin.';
                } else if (xhr.status === 400) {
                    msg = (xhr.responseJSON && xhr.responseJSON.detail) || 'Geçersiz yorum verisi gönderildi.';
                } else if (xhr.status === 0) {
                    msg = 'NLP servisine bağlanılamadı. Servisin çalıştığını kontrol edin.';
                } else {
                    msg = (xhr.responseJSON && xhr.responseJSON.detail) || 'NLP servisinde beklenmeyen bir hata oluştu.';
                }
                $('#nlpAnalizHata').text(msg).show();
            }
        });
    });

    // =============================================
    // Başlangıç
    // =============================================
    komisyonGrafikYukle();
    kpiGuncelle();
    magazaTablosuRender();
    bildirimListesiRender();

});