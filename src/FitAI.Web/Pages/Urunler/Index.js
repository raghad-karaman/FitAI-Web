// jQuery yüklendiğinde çalışacak fonksiyon
(function() {
    // jQuery'nin yüklenmesini bekle
    if (typeof $ === 'undefined') {
        console.log("jQuery henüz yüklenmedi, bekleniyor...");
        // 100ms aralıklarla jQuery kontrol et
        var checkInterval = setInterval(function() {
            if (typeof $ !== 'undefined') {
                console.log("jQuery yüklendi, başlatılıyor...");
                clearInterval(checkInterval);
                baslat();
            }
        }, 100);
        
        // 5 saniye timeout (sonsuz döngüye girmemek için)
        setTimeout(function() {
            clearInterval(checkInterval);
            if (typeof $ === 'undefined') {
                console.error("jQuery yüklenemedi!");
            }
        }, 5000);
    } else {
        baslat();
    }
    
    function baslat() {
        $(function() {
            console.log("Index.js başladı (jQuery hazır)");
            
            var tumUrunler = [];
            var duzenlenecekId = null;
            var silinecekId = null;
            
            // =============================================
            // Yardımcı fonksiyonlar
            // =============================================
            function kesimBadge(kesim) {
                if (!kesim) return '<span class="text-muted">—</span>';
                return '<span class="kesim-badge">' + kesim + '</span>';
            }
            
            function kumasBadge(esnek) {
                if (esnek === null || esnek === undefined) return '<span class="text-muted">—</span>';
                return esnek
                    ? '<span class="kumas-esnek"><i class="fas fa-expand-arrows-alt me-1"></i>Esnek</span>'
                    : '<span class="kumas-sert"><i class="fas fa-minus me-1"></i>Standart</span>';
            }
            
            function kisalt(metin, limit) {
                if (!metin) return '<span class="text-muted">—</span>';
                return metin.length > limit
                    ? '<span title="' + metin + '">' + metin.substring(0, limit) + '...</span>'
                    : metin;
            }
            
            // =============================================
            // KPI Güncelleme
            // =============================================
            function kpiGuncelle() {
                var esnek = tumUrunler.filter(function(u) { return u.kumasEsnek === true; }).length;
                var kesimler = [...new Set(tumUrunler.filter(function(u) { return u.kesimTuru; }).map(function(u) { return u.kesimTuru; }))].length;
                
                $('#toplamUrun').text(tumUrunler.length);
                $('#aktifUrun').text(tumUrunler.length);
                $('#eskekUrun').text(esnek);
                $('#kesimSayisi').text(kesimler);
            }
            
            // =============================================
            // Tablo Render
            // =============================================
            function tabloYenile() {
                var arama = $('#aramaInput').val().toLowerCase();
                var kesim = $('#kesimFiltre').val();
                var kumas = $('#kumasFiltre').val();
                
                var filtre = tumUrunler.filter(function(u) {
                    var aramaUyumu = !arama || u.ad.toLowerCase().includes(arama);
                    var kesimUyumu = !kesim || u.kesimTuru === kesim;
                    var kumasUyumu = !kumas ||
                        (kumas === 'esnek' && u.kumasEsnek === true) ||
                        (kumas === 'esnek_degil' && u.kumasEsnek === false);
                    return aramaUyumu && kesimUyumu && kumasUyumu;
                });
                
                var $tbody = $('#urunTablosu');
                $tbody.empty();
                
                if (filtre.length === 0) {
                    $tbody.html('<tr><td colspan="8" class="text-center py-4 text-muted">Sonuç bulunamadı.</td></tr>');
                    $('#toplamKayitYazi').text('0 sonuç');
                    return;
                }
                
                for (var i = 0; i < filtre.length; i++) {
                    var u = filtre[i];
                    $tbody.append(
                        '<tr>' +
                            '<td class="text-muted small">' + u.id + '</td>' +
                            '<td>' +
                                '<div class="urun-bilgi">' +
                                    '<div class="urun-ikon"><i class="fas fa-tshirt"></i></div>' +
                                    '<span class="urun-ad">' + (u.ad || '—') + '</span>' +
                                '</div>' +
                            '</td>' +
                            '<td class="text-muted small">' + (u.magazaAdi || '—') + '</td>' +
                            '<td>' + kesimBadge(u.kesimTuru) + '</td>' +
                            '<td>' + kumasBadge(u.kumasEsnek) + '</td>' +
                            '<td class="text-muted small">' + kisalt(u.aciklama, 40) + '</td>' +
                            '<td><span class="durum-aktif"><i class="fas fa-check me-1"></i>Aktif</span></td>' +
                            '<td class="text-center">' +
                                '<div class="d-flex gap-1 justify-content-center">' +
                                    '<button class="btn-islem btn-duzenle btn-duzenle-ac" data-id="' + u.id + '" title="Düzenle">' +
                                        '<i class="fas fa-pencil-alt"></i>' +
                                    '</button>' +
                                    '<button class="btn-islem btn-sil btn-sil-ac" data-id="' + u.id + '" data-ad="' + (u.ad || '') + '" title="Sil">' +
                                        '<i class="fas fa-trash"></i>' +
                                    '</button>' +
                                '</div>' +
                            '</td>' +
                        '</tr>'
                    );
                }
                
                // Gösterilen kayıt bilgisini güncelle
                $('#toplamKayitYazi').text(filtre.length + ' / ' + tumUrunler.length + ' ürün gösteriliyor');
            }
            
            // =============================================
            // VERİ ÇEKME
            // =============================================
            function yukleUrunler() {
                console.log("Ürünler yükleniyor...");
                
                fetch('/api/app/urun?maxResultCount=1000&skipCount=0', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(function(response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.json();
                })
                .then(function(result) {
                    console.log("Gelen veri:", result);
                    tumUrunler = (result && result.items) ? result.items : (Array.isArray(result) ? result : []);
                    console.log("Ürün sayısı:", tumUrunler.length);
                    
                    // Spinner temizliği
                    $('#urunTablosu').find('tr').filter(function() {
                        return $(this).find('.spinner-border').length > 0;
                    }).remove();
                    
                    tabloYenile();
                    kpiGuncelle();
                })
                .catch(function(err) {
                    console.error("API Hatası:", err);
                    $('#urunTablosu').html(
                        '<tr><td colspan="8" class="text-center py-4 text-danger">' +
                        '<i class="fas fa-exclamation-circle fa-2x mb-2 d-block"></i>' +
                        'API bağlantı hatası: ' + err.message +
                        '</td></tr>'
                    );
                });
            }
            
            // =============================================
            // Modal ve Form İşlemleri
            // =============================================
            function formTemizle() {
                $('#f_ad, #f_aciklama').val('');
                $('#f_magazaId, #f_kesimTuru').val('');
                $('#f_kumasEsnek').prop('checked', false);
                $('#aciklamaKarakter').text('0 karakter');
                $('#kesimBilgiKarti').hide();
                $('.is-invalid').removeClass('is-invalid');
            }
            
            // Yeni Ürün Ekle Butonu
            $('#yeniUrunBtn').on('click', function() {
                duzenlenecekId = null;
                formTemizle();
                $('#urunModalBaslik').html('<i class="fas fa-tshirt me-2 text-primary"></i>Yeni Ürün Ekle');
                
                var modalEl = document.getElementById('urunModal');
                var modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.show();
            });
            
            // Düzenle Butonu (Satır İçi)
            $(document).on('click', '.btn-duzenle-ac', function() {
                var id = $(this).data('id');
                var u = tumUrunler.find(function(x) { return x.id === id; });
                if (!u) return;
                
                duzenlenecekId = id;
                formTemizle();
                $('#urunModalBaslik').html('<i class="fas fa-tshirt me-2 text-warning"></i>Ürünü Düzenle');
                
                $('#f_ad').val(u.ad);
                $('#f_magazaId').val(u.magazaId);
                $('#f_kesimTuru').val(u.kesimTuru || '');
                $('#f_kumasEsnek').prop('checked', u.kumasEsnek === true);
                $('#f_aciklama').val(u.aciklama || '');
                $('#aciklamaKarakter').text((u.aciklama || '').length + ' karakter');
                
                // Mükerrer / Çift nesne oluşturma hatası giderildi:
                var modalEl = document.getElementById('urunModal');
                var modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.show();
            });
            
            // Kaydet / Güncelle Onay Butonu
       // =================================================================
// INDEX.JS İÇİNDE SADECE BU BUTON EVENTLERİNİ GÜNCELLEMENİZ YETERLİDİR
// =================================================================

// =================================================================
// KAYDET BUTONU - BACKEND ZORUNLU ALANLAR İÇİN DÜZENLENMİŞ VERSİYON
// =================================================================

$('#urunKaydetBtn').on('click', function() {
    var urunAdi = $('#f_ad').val().trim();
    var magazaId = $('#f_magazaId').val();
    
    if (!urunAdi) {
        abp.notify.warn('Ürün adı giriniz.');
        $('#f_ad').addClass('is-invalid');
        return;
    }
    $('#f_ad').removeClass('is-invalid');
    
    if (!magazaId) {
        abp.notify.warn('Mağaza seçiniz.');
        $('#f_magazaId').addClass('is-invalid');
        return;
    }
    $('#f_magazaId').removeClass('is-invalid');
    
    var token = $('input[name="__RequestVerificationToken"]').val();
    
    // ZORUNLU ALANLARI DOLDUR - Backend required olduğu için boş olamazlar
    var aciklamaDeger = $('#f_aciklama').val().trim();
    var kesimTuruDeger = $('#f_kesimTuru').val();
    
    var dto = {
        ad: urunAdi,
        magazaId: magazaId,
        // Aciklama: Boşsa varsayılan açıklama ekle
        aciklama: aciklamaDeger ? aciklamaDeger : "Açıklama girilmedi",
        // KesimTuru: Boşsa varsayılan değer olarak "Regular" gönder
        kesimTuru: kesimTuruDeger ? kesimTuruDeger : "Regular",
        kumasEsnek: $('#f_kumasEsnek').is(':checked')
    };
    
    console.log("Gönderilen DTO:", JSON.stringify(dto, null, 2));
    
    var url = duzenlenecekId ? '/api/app/urun/' + duzenlenecekId : '/api/app/urun';
    var method = duzenlenecekId ? 'PUT' : 'POST';
    
    var $btn = $(this);
    var originalText = $btn.html();
    $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i>Kaydediliyor...');
    
    fetch(url, {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'RequestVerificationToken': token
        },
        body: JSON.stringify(dto)
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(err) { 
                console.error("Hata Detayı:", err);
                
                if (err.error && err.error.validationErrors) {
                    var mesajlar = err.error.validationErrors.map(function(v) { 
                        return v.message; 
                    });
                    abp.notify.error(mesajlar.join('\n'), "Doğrulama Hatası");
                } else if (err.error && err.error.message) {
                    abp.notify.error(err.error.message, "Hata");
                } else {
                    abp.notify.error('Ürün kaydedilirken bir hata oluştu.', 'Hata');
                }
                throw new Error('HTTP ' + response.status);
            });
        }
        return response.json();
    })
    .then(function(data) {
        abp.notify.success(duzenlenecekId ? 'Ürün başarıyla güncellendi.' : 'Ürün başarıyla eklendi.', 'Başarılı');
        
        var modalEl = document.getElementById('urunModal');
        var modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }
        
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        
        setTimeout(function() {
            $('#yeniUrunBtn').focus();
            yukleUrunler();
        }, 200);
    })
    .catch(function(err) {
        console.error("Kayıt hatası:", err);
    })
    .finally(function() {
        $btn.prop('disabled', false).html(originalText);
    });
});    
            // Silme Modalı Açılış (Satır İçi)
            $(document).on('click', '.btn-sil-ac', function() {
                silinecekId = $(this).data('id');
                $('#silUrunAdi').text($(this).data('ad'));
                
                var modalEl = document.getElementById('silOnayModal');
                var modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.show();
            });
            
            // Silme Onay Butonu (Tekilleştirildi)
            $('#silOnayBtn').on('click', function() {
                if (!silinecekId) return;
                
                var token = $('input[name="__RequestVerificationToken"]').val();
                
                fetch('/api/app/urun/' + silinecekId, {
                    method: 'DELETE',
                    headers: {
                        'RequestVerificationToken': token
                    }
                })
                .then(function(response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    abp.notify.warn('Ürün silindi.', 'Silindi');
                    
                    var modalEl = document.getElementById('silOnayModal');
                    var modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                    
                    // aria-hidden engeline takılmamak için odağı arama kutusuna fırlatıyoruz
                    $('#aramaInput').focus();
                    
                    yukleUrunler();
                    silinecekId = null;
                })
                .catch(function(err) {
                    console.error("Silme hatası:", err);
                    abp.notify.error('Ürün silinirken hata oluştu.');
                });
            });
            
            // Filtreler
            $('#aramaInput').on('input', tabloYenile);
            $('#kesimFiltre, #kumasFiltre').on('change', tabloYenile);
            $('#filtreTemizle').on('click', function() {
                $('#aramaInput').val('');
                $('#kesimFiltre, #kumasFiltre').val('');
                tabloYenile();
            });
            
            // Karakter Sayacı (Açıklama alanı için dinamik takip)
            $('#f_aciklama').on('input', function() {
                var len = $(this).val().length;
                $('#aciklamaKarakter').text(len + ' karakter');
            });
            
            // İlk açılışta verileri çek
            yukleUrunler();
        });
    }
})();