$(function () {
    var komisyonService = fitAI.komisyonlar.komisyon;
    var l = abp.localization.getResource('FitAI');

    var createModal = new abp.ModalManager(abp.appPath + 'Komisyonlar/Index?handler=Create');
    var editModal   = new abp.ModalManager(abp.appPath + 'Komisyonlar/Index?handler=Update');

    // ── DataTable ──────────────────────────────────────────────────────────────
    var dataTable = $('#KomisyonTable').DataTable(
        abp.libs.datatables.normalizeConfiguration({
            serverSide: true,
            paging: true,
            order: [[8, 'desc']],
            searching: false,
            scrollX: true,
            ajax: abp.libs.datatables.createAjax(komisyonService.getList),
            columnDefs: [
                {
                    title: 'İşlemler',
                    rowAction: {
                        items: [
                            {
                                text: 'Düzenle',
                                icon: 'fa fa-pencil',
                                action: function (data) {
                                    editModal.open({ id: data.record.id });
                                }
                            },
                            {
                                text: 'Sil',
                                icon: 'fa fa-trash',
                                confirmMessage: function () {
                                    return 'Bu komisyon kaydını silmek istediğinize emin misiniz?';
                                },
                                action: function (data) {
                                    komisyonService
                                        .delete(data.record.id)
                                        .then(function () {
                                            abp.notify.success('Komisyon kaydı silindi.');
                                            dataTable.ajax.reload();
                                        });
                                }
                            }
                        ]
                    }
                },
                { title: 'Mağaza ID',        data: 'magazaId' },
                { title: 'Ürün ID',           data: 'urunId' },
                { title: 'Sipariş Kodu',      data: 'platformSiparisKodu' },
                {
                    title: 'Satış Tutarı',
                    data: 'satisTutari',
                    render: function (d) { return '₺' + d.toFixed(2); }
                },
                {
                    title: 'Komisyon Tutarı',
                    data: 'komisyonTutari',
                    render: function (d) { return '₺' + d.toFixed(2); }
                },
                {
                    title: 'Komisyon Oranı',
                    data: 'komisyonOrani',
                    render: function (d) { return '%' + d.toFixed(2); }
                },
                {
                    title: 'AI Attribution',
                    data: 'aIAttributionMi',
                    render: function (d) {
                        return d
                            ? '<span class="badge bg-success">Evet</span>'
                            : '<span class="badge bg-secondary">Hayır</span>';
                    }
                },
                {
                    title: 'İşlem Tarihi',
                    data: 'islemTarihi',
                    render: function (d) {
                        return luxon.DateTime.fromISO(d).toFormat('dd.MM.yyyy');
                    }
                },
                {
                    title: 'Dönem',
                    data: null,
                    render: function (d) {
                        return d.donemAy + '/' + d.donemYil;
                    }
                }
            ]
        })
    );

    // ── Yeni Kayıt ────────────────────────────────────────────────────────────
    $('#NewKomisyonButton').click(function () {
        createModal.open();
    });

    createModal.onResult(function () {
        dataTable.ajax.reload();
        abp.notify.success('Komisyon kaydı oluşturuldu.');
    });

    editModal.onResult(function () {
        dataTable.ajax.reload();
        abp.notify.success('Komisyon kaydı güncellendi.');
    });

    // ── Dönem Filtresi ────────────────────────────────────────────────────────
    $('#FilterButton').click(function () {
        var yil = $('#DonemYilFilter').val();
        var ay  = $('#DonemAyFilter').val();

        if (yil && ay) {
            komisyonService
                .getListByDonem(parseInt(yil), parseInt(ay))
                .then(function (result) {
                    // Manuel veri yükleme — sunucu tarafı paging'i bypass eder
                    dataTable.clear();
                    dataTable.rows.add(result.items);
                    dataTable.draw();
                });
        } else {
            dataTable.ajax.reload();
        }
    });
});














