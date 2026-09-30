// FitAI.Web/Pages/Talimatlar/Index.js
// Gerçek API'ye bağlı versiyon — mock data tamamen kaldırıldı.
$(function () {

    // =============================================
    // Sabitler & Durum
    // =============================================
    var API_BASE       = '/api/ai';
    var sayfaBoyutu    = 10;
    var aktifSayfa     = 1;
    var aktifDurumFiltre = 'all';
    var aramaKelimesi  = '';
    var talimatlar     = [];          // API'den yüklenen liste

    // =============================================
    // Yardımcı: API çağrısı
    // =============================================
    function apiGet(path) {
        return $.ajax({ url: API_BASE + path, method: 'GET', headers: abpHeaders() });
    }
    function apiPost(path, data) {
        return $.ajax({ url: API_BASE + path, method: 'POST', contentType: 'application/json', data: JSON.stringify(data), headers: abpHeaders() });
    }
    function apiPut(path, data) {
        return $.ajax({ url: API_BASE + path, method: 'PUT', contentType: 'application/json', data: JSON.stringify(data), headers: abpHeaders() });
    }
    function apiDelete(path) {
        return $.ajax({ url: API_BASE + path, method: 'DELETE', headers: abpHeaders() });
    }

    // ABP anti-forgery token başlığı
    function abpHeaders() {
        return { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() || '' };
    }

    // =============================================
    // Talimatları Yükle
    // =============================================
    function talimatlarYukle() {
        $('#talimatListesiTablosu').html(
            '<tr class="loading-row"><td colspan="7">' +
            '<div class="d-flex justify-content-center py-5">' +
            '<div class="spinner-border text-primary" role="status"></div>' +
            '<span class="ms-2 text-muted">Yükleniyor...</span></div></td></tr>'
        );

        apiGet('/talimatlar')
            .done(function (data) {
                talimatlar = data;
                kpiGuncelle();
                talimatTablosunuRender();
            })
            .fail(function (xhr) {
                var msg = xhr.responseJSON?.error?.message || 'Talimatlar yüklenemedi.';
                abp.message.error(msg, 'Hata');
                $('#talimatListesiTablosu').html(
                    '<tr><td colspan="7" class="text-center text-danger py-4">' +
                    '<i class="fas fa-exclamation-triangle me-2"></i>' + escapeHtml(msg) + '</td></tr>'
                );
            });
    }

    // =============================================
    // KPI Kartları
    // =============================================
    function kpiGuncelle() {
        var toplam     = talimatlar.length;
        var aktif      = talimatlar.filter(function(t) { return t.durum === 'aktif'; }).length;
        var beklemede  = talimatlar.filter(function(t) { return t.durum === 'beklemede'; }).length;
        var bugun      = new Date().toISOString().slice(0, 10);
        var bugunCalis = talimatlar.filter(function(t) {
            return t.sonCalisma && t.sonCalisma.startsWith(bugun);
        }).length;

        $('#toplamTalimat').text(toplam);
        $('#aktifTalimat').text(aktif);
        $('#bekleyenTalimat').text(beklemede);
        $('#bugunCalisan').text(bugunCalis);
    }

    // =============================================
    // Filtreleme
    // =============================================
    function filtrelenmisTalimatlar() {
        var list = talimatlar.slice();
        if (aktifDurumFiltre !== 'all') {
            list = list.filter(function(t) { return t.durum === aktifDurumFiltre; });
        }
        if (aramaKelimesi.trim()) {
            var q = aramaKelimesi.toLowerCase();
            list = list.filter(function(t) {
                return (t.ad || '').toLowerCase().includes(q) ||
                       (t.aciklama || '').toLowerCase().includes(q);
            });
        }
        return list;
    }

    // =============================================
    // Tablo Render
    // =============================================
    function tetikleyiciText(v) {
        if (v === 'zamanli') return '⏰ Zamanlı';
        if (v === 'olay')    return '⚡ Olay';
        return '👆 Manuel';
    }
    function durumText(v) {
        if (v === 'aktif')      return 'Aktif';
        if (v === 'beklemede')  return 'Beklemede';
        return 'Pasif';
    }

    function talimatTablosunuRender() {
        var filtered    = filtrelenmisTalimatlar();
        var toplamSayfa = Math.max(1, Math.ceil(filtered.length / sayfaBoyutu));
        if (aktifSayfa > toplamSayfa) aktifSayfa = 1;

        var start            = (aktifSayfa - 1) * sayfaBoyutu;
        var sayfaTalimatlar  = filtered.slice(start, start + sayfaBoyutu);
        var $tbody           = $('#talimatListesiTablosu');
        $tbody.empty();

        if (!sayfaTalimatlar.length) {
            $tbody.html(
                '<tr class="empty-row"><td colspan="7" class="text-center py-5">' +
                '<i class="fas fa-inbox fa-2x text-muted mb-2 d-block"></i>' +
                '<span class="text-muted">Talimat bulunamadı</span></td></tr>'
            );
            $('#talimatSayac').text('0 talimat gösteriliyor');
            return;
        }

        sayfaTalimatlar.forEach(function(t) {
            var durumClass = t.durum === 'aktif'     ? 'durum-aktif'
                           : t.durum === 'beklemede' ? 'durum-beklemede'
                           : 'durum-pasif';
            var durumIcon  = t.durum === 'aktif'     ? 'fa-check-circle'
                           : t.durum === 'beklemede' ? 'fa-clock'
                           : 'fa-pause-circle';
            var cronText   = (t.cron && t.cron !== '-') ? t.cron : '—';
            var scText     = t.sonCalisma || '—';
            var acikShort  = (t.aciklama || '').length > 35
                            ? t.aciklama.substring(0, 35) + '...'
                            : (t.aciklama || '');

            $tbody.append(
                '<tr data-id="' + t.id + '">' +
                    '<td><strong>' + escapeHtml(t.ad) + '</strong></td>' +
                    '<td class="text-muted small">' + escapeHtml(acikShort) + '</td>' +
                    '<td>' + tetikleyiciText(t.tetikleyici) + '</td>' +
                    '<td class="font-monospace small">' + escapeHtml(cronText) + '</td>' +
                    '<td><span class="durum-badge ' + durumClass + '">' +
                        '<i class="fas ' + durumIcon + ' me-1"></i>' + durumText(t.durum) +
                    '</span></td>' +
                    '<td class="small">' + escapeHtml(scText) + '</td>' +
                    '<td class="text-center">' +
                        '<div class="talimat-aksiyon">' +
                            '<button class="aksiyon-btn detay"    data-id="' + t.id + '" data-aksiyon="detay"    title="Detay"><i class="fas fa-eye"></i></button>' +
                            '<button class="aksiyon-btn calistir" data-id="' + t.id + '" data-aksiyon="calistir" title="Çalıştır"><i class="fas fa-play"></i></button>' +
                            '<button class="aksiyon-btn duzenle" data-id="' + t.id + '" data-aksiyon="duzenle"  title="Düzenle"><i class="fas fa-edit"></i></button>' +
                            '<button class="aksiyon-btn sil"     data-id="' + t.id + '" data-aksiyon="sil"      title="Sil"><i class="fas fa-trash"></i></button>' +
                        '</div>' +
                    '</td>' +
                '</tr>'
            );
        });

        $('#talimatSayac').text(sayfaTalimatlar.length + ' talimat gösteriliyor (toplam ' + filtered.length + ')');
        paginationRender(toplamSayfa);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(m) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m];
        });
    }

    // =============================================
    // Pagination
    // =============================================
    function paginationRender(toplamSayfa) {
        var $pag = $('#talimatPagination');
        $pag.empty();
        if (toplamSayfa <= 1) return;

        if (aktifSayfa > 1)
            $pag.append('<li class="page-item"><a class="page-link" href="#" data-page="prev"><i class="fas fa-chevron-left"></i></a></li>');

        var sp = Math.max(1, aktifSayfa - 2);
        var ep = Math.min(toplamSayfa, sp + 4);
        if (ep - sp < 4 && sp > 1) sp = Math.max(1, ep - 4);

        for (var i = sp; i <= ep; i++) {
            $pag.append('<li class="page-item ' + (i === aktifSayfa ? 'active' : '') + '">' +
                '<a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>');
        }

        if (aktifSayfa < toplamSayfa)
            $pag.append('<li class="page-item"><a class="page-link" href="#" data-page="next"><i class="fas fa-chevron-right"></i></a></li>');

        $pag.find('.page-link').on('click', function(e) {
            e.preventDefault();
            var page = $(this).data('page');
            if (page === 'prev' && aktifSayfa > 1)              aktifSayfa--;
            else if (page === 'next' && aktifSayfa < toplamSayfa) aktifSayfa++;
            else if (!isNaN(parseInt(page)))                      aktifSayfa = parseInt(page);
            else return;
            talimatTablosunuRender();
        });
    }

    // =============================================
    // Filtreleme Event'leri
    // =============================================
    $('#talimatAra').on('keyup', function() {
        aramaKelimesi = $(this).val();
        aktifSayfa = 1;
        talimatTablosunuRender();
    });
    $('#durumFiltre').on('change', function() {
        aktifDurumFiltre = $(this).val();
        aktifSayfa = 1;
        talimatTablosunuRender();
    });

    // =============================================
    // Yeni Talimat — Modal & Kaydet
    // =============================================
    var yeniModal;

    $('#yeniTalimatBtn').on('click', function() {
        $('#talimatForm')[0].reset();
        $('#talimatKaydetBtn').data('mode', 'create').data('id', null);
        $('#yeniTalimatModalLabel, .modal-title').html('<i class="fas fa-plus-circle me-2 text-primary"></i>Yeni AI Talimatı Oluştur');
        yeniModal = new bootstrap.Modal(document.getElementById('yeniTalimatModal'));
        yeniModal.show();
        document.getElementById('yeniTalimatModal').addEventListener('hidden.bs.modal', function () {
            document.activeElement?.blur();
        }, { once: true });
    });

    $('#talimatKaydetBtn').on('click', function() {
        var ad = $('#talimatAd').val().trim();
        if (!ad) { abp.message.warning('Lütfen talimat adını girin.', 'Uyarı'); return; }

        var payload = {
            ad:          ad,
            aciklama:    $('#talimatAciklama').val().trim(),
            tetikleyici: $('#talimatTetikleyici').val(),
            cron:        $('#talimatCron').val().trim() || '-',
            prompt:      $('#talimatPrompt').val().trim()
        };

        var mode = $(this).data('mode');
        var id   = $(this).data('id');
        var req  = (mode === 'edit' && id)
                   ? apiPut('/talimatlar/' + id, payload)
                   : apiPost('/talimatlar', payload);

        $('#talimatKaydetBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span>Kaydediliyor...');

        req.done(function() {
            yeniModal.hide();
            abp.message.success(mode === 'edit' ? 'Talimat güncellendi.' : 'Yeni talimat oluşturuldu.', 'Başarılı');
            console.log("Index.js başlatıldı, talimatlarYukle çağrılıyor");

            talimatlarYukle();
        })
        .fail(function(xhr) {
            var msg = xhr.responseJSON?.error?.message || 'Kayıt başarısız.';
            abp.message.error(msg, 'Hata');
        })
        .always(function() {
            $('#talimatKaydetBtn').prop('disabled', false).html('<i class="fas fa-save me-1"></i>Kaydet');
        });
    });

    // =============================================
    // Aksiyon Butonları (Detay / Çalıştır / Düzenle / Sil)
    // =============================================
    $(document).on('click', '.aksiyon-btn', function() {
        var id      = parseInt($(this).data('id'));
        var aksiyon = $(this).data('aksiyon');
        var talimat = talimatlar.find(function(t) { return t.id === id; });
        if (!talimat) return;

        // ── Detay ──────────────────────────────
        if (aksiyon === 'detay') {
            $('#talimatDetayIcerik').html(
                '<div class="talimat-detay-bilgi">' +
                    '<p><strong>Talimat Adı:</strong> '      + escapeHtml(talimat.ad)          + '</p>' +
                    '<p><strong>Açıklama:</strong> '         + escapeHtml(talimat.aciklama||'—')+ '</p>' +
                    '<p><strong>Tetikleyici:</strong> '      + tetikleyiciText(talimat.tetikleyici) + '</p>' +
                    '<p><strong>Çalışma Zamanı:</strong> '   + escapeHtml((talimat.cron !== '-' && talimat.cron) ? talimat.cron : '—') + '</p>' +
                    '<p><strong>Durum:</strong> '            + durumText(talimat.durum)         + '</p>' +
                    '<p><strong>Son Çalışma:</strong> '      + escapeHtml(talimat.sonCalisma||'—')+ '</p>' +
                    '<p><strong>AI Prompt:</strong></p>'     +
                    '<pre>' + escapeHtml(talimat.prompt||'—') + '</pre>' +
                '</div>'
            );
            $('#talimatTestEtBtn').data('id', id).show();
            var detayModal = new bootstrap.Modal(document.getElementById('talimatDetayModal'));
            detayModal.show();
            document.getElementById('talimatDetayModal').addEventListener('hidden.bs.modal', function () {
                document.activeElement?.blur();
            }, { once: true });
        }

        // ── Çalıştır ───────────────────────────
        else if (aksiyon === 'calistir') {
            var $btn = $(this);
            $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

            apiPost('/talimatlar/' + id + '/calistir', {})
                .done(function(sonuc) {
                    // Son çalışma zamanını local'de güncelle
                    talimat.sonCalisma = new Date().toISOString().slice(0,19).replace('T',' ');
                    talimatTablosunuRender();
                    kpiGuncelle();
                    calistirSonucGoster(talimat.ad, sonuc);
                })
                .fail(function(xhr) {
                    var msg = xhr.responseJSON?.error?.message || 'AI servisi yanıt vermedi.';
                    abp.message.error(msg, 'Hata');
                })
                .always(function() {
                    $btn.prop('disabled', false).html('<i class="fas fa-play"></i>');
                });
        }

        // ── Düzenle ────────────────────────────
        else if (aksiyon === 'duzenle') {
            $('#talimatAd').val(talimat.ad);
            $('#talimatAciklama').val(talimat.aciklama);
            $('#talimatTetikleyici').val(talimat.tetikleyici);
            $('#talimatCron').val(talimat.cron !== '-' ? talimat.cron : '');
            $('#talimatPrompt').val(talimat.prompt);
            $('#talimatKaydetBtn').data('mode', 'edit').data('id', id);
            $('.modal-title').html('<i class="fas fa-edit me-2 text-warning"></i>Talimatı Düzenle');
            yeniModal = new bootstrap.Modal(document.getElementById('yeniTalimatModal'));
            yeniModal.show();
            document.getElementById('yeniTalimatModal').addEventListener('hidden.bs.modal', function () {
                document.activeElement?.blur();
            }, { once: true });
        }

        // ── Sil ────────────────────────────────
        else if (aksiyon === 'sil') {
            abp.message.confirm('"' + talimat.ad + '" talimatını silmek istiyor musunuz?', 'Onay')
                .then(function(confirmed) {
                    if (!confirmed) return;
                    apiDelete('/talimatlar/' + id)
                        .done(function() {
                            abp.message.success('Talimat silindi.', 'Başarılı');
                            talimatlarYukle();
                        })
                        .fail(function(xhr) {
                            var msg = xhr.responseJSON?.error?.message || 'Silme başarısız.';
                            abp.message.error(msg, 'Hata');
                        });
                });
        }
    });

    // =============================================
    // "Test Et" butonu (detay modalında)
    // =============================================
    $('#talimatTestEtBtn').on('click', function() {
        var id = $(this).data('id');
        var modal = bootstrap.Modal.getInstance(document.getElementById('talimatDetayModal'));
        if (modal) modal.hide();

        if (!id) { abp.message.info('Test edilecek talimat seçilmedi.', 'Bilgi'); return; }

        abp.message.info('Talimat test modunda çalıştırılıyor...', 'Test');
        apiPost('/talimatlar/' + id + '/calistir', {})
            .done(function(sonuc) {
                var detay = JSON.stringify(sonuc, null, 2);
                abp.message.success('<pre class="text-start small">' + escapeHtml(detay) + '</pre>', 'Test Sonucu');
            })
            .fail(function(xhr) {
                var msg = xhr.responseJSON?.error?.message || 'Test başarısız.';
                abp.message.error(msg, 'Test Hatası');
            });
    });

    // =============================================
    // Undo — Son Talimatı Geri Al
    // =============================================
    $('#talimatUndoBtn').on('click', function() {
        var $btn = $(this);
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span>Geri alınıyor...');

        apiPost('/talimatlar/undo', {})
            .done(function(sonuc) {
                if (sonuc.durum === 'Boş') {
                    abp.message.info('Geri alınacak talimat yok.', 'Bilgi');
                } else {
                    var geriAlinan = (sonuc.geriAlinanTalimat && sonuc.geriAlinanTalimat.talimat) || '—';
                    abp.message.success('"' + escapeHtml(geriAlinan) + '" talimatı geri alındı.', 'Geri Alındı');
                    talimatlarYukle();
                }
            })
            .fail(function(xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) || 'Geri alma başarısız.';
                abp.message.error(msg, 'Hata');
            })
            .always(function() {
                $btn.prop('disabled', false).html('<i class="fas fa-undo me-1"></i>Geri Al');
            });
    });

    // =============================================
    // Çalıştır Sonucu — Detaylı Modal
    // =============================================
    function calistirSonucGoster(talimatAd, sonuc) {
        var etkilenen = sonuc.etkilenen || 0;
        var anlasilan = sonuc.anlasilan || '—';
        var liste     = sonuc.sonuclar || [];

        var satirlar = '';
        liste.forEach(function(s) {
            var degisimClass = s.degisim > 0 ? 'text-success' : s.degisim < 0 ? 'text-danger' : 'text-secondary';
            var degisimIcon  = s.degisim > 0 ? 'fa-arrow-up' : s.degisim < 0 ? 'fa-arrow-down' : 'fa-minus';
            satirlar +=
                '<tr>' +
                    '<td>' + escapeHtml(s.vucutTipi || '') + '</td>' +
                    '<td>' + escapeHtml(s.urunKesim || '') + '</td>' +
                    '<td>' + (s.eskiSkor != null ? s.eskiSkor : '—') + '</td>' +
                    '<td>' + (s.yeniSkor != null ? s.yeniSkor : '—') + '</td>' +
                    '<td class="' + degisimClass + ' fw-semibold">' +
                        '<i class="fas ' + degisimIcon + ' me-1"></i>' +
                        (s.degisim != null ? (s.degisim > 0 ? '+' : '') + s.degisim : '—') +
                    '</td>' +
                '</tr>';
        });

        var icerik =
            '<div class="mb-3 d-flex gap-3">' +
                '<div class="result-chip flex-fill text-center">' +
                    '<div class="small text-muted">Anlasılan</div>' +
                    '<div class="fw-semibold">' + escapeHtml(anlasilan) + '</div>' +
                '</div>' +
                '<div class="result-chip flex-fill text-center">' +
                    '<div class="small text-muted">Etkilenen Kayıt</div>' +
                    '<div class="fw-semibold text-primary">' + etkilenen + '</div>' +
                '</div>' +
                '<div class="result-chip flex-fill text-center">' +
                    '<div class="small text-muted">Durum</div>' +
                    '<div class="fw-semibold text-success">' + escapeHtml(sonuc.durum || '—') + '</div>' +
                '</div>' +
            '</div>';

        if (satirlar) {
            icerik +=
                '<div class="table-responsive" style="max-height:340px;overflow-y:auto;">' +
                '<table class="table table-sm table-bordered table-hover mb-0">' +
                    '<thead class="table-light sticky-top"><tr>' +
                        '<th>Vücut Tipi</th><th>Kesim</th>' +
                        '<th>Eski Skor</th><th>Yeni Skor</th><th>Değişim</th>' +
                    '</tr></thead>' +
                    '<tbody>' + satirlar + '</tbody>' +
                '</table></div>';
        } else {
            icerik += '<p class="text-muted text-center py-3">Etkilenen kayıt bulunamadı.</p>';
        }

        $('#talimatDetayIcerik').html(
            '<h6 class="mb-3"><i class="fas fa-play-circle text-primary me-2"></i>' +
            escapeHtml(talimatAd) + ' — Çalıştırma Sonucu</h6>' + icerik
        );
        $('#talimatTestEtBtn').hide();
        var sonucModal = new bootstrap.Modal(document.getElementById('talimatDetayModal'));
        sonucModal.show();
        document.getElementById('talimatDetayModal').addEventListener('hidden.bs.modal', function () {
            document.activeElement?.blur();
        }, { once: true });
    }

    // =============================================
    // Başlangıç
    // =============================================
    talimatlarYukle();
});