using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FitAI.Domain.Notifications;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace FitAI.Bildirimler;

public class BildirimAppService : ApplicationService, IBildirimAppService
{
    private readonly IRepository<Bildirim, int> _bildirimRepository;

    public BildirimAppService(IRepository<Bildirim, int> bildirimRepository)
    {
        _bildirimRepository = bildirimRepository;
    }

    public async Task<List<BildirimDto>> GetListAsync()
    {
        var bildirimler = await _bildirimRepository.GetListAsync();
        return ObjectMapper.Map<List<Bildirim>, List<BildirimDto>>(bildirimler);
    }

    public async Task<BildirimDto> GetAsync(int id)
    {
        var bildirim = await _bildirimRepository.GetAsync(id);
        return ObjectMapper.Map<Bildirim, BildirimDto>(bildirim);
    }

    public async Task<List<BildirimDto>> GetByMagazaAsync(int magazaId)
    {
        var bildirimler = await _bildirimRepository.GetListAsync(
            b => b.MagazaId == magazaId
        );
        return ObjectMapper.Map<List<Bildirim>, List<BildirimDto>>(bildirimler);
    }

    public async Task<List<BildirimDto>> GetByKullaniciAsync(int kullaniciId)
    {
        var bildirimler = await _bildirimRepository.GetListAsync(
            b => b.KullaniciId == kullaniciId
        );
        return ObjectMapper.Map<List<Bildirim>, List<BildirimDto>>(bildirimler);
    }

    public async Task<List<BildirimDto>> GetByKanalAsync(string kanal)
    {
        var bildirimler = await _bildirimRepository.GetListAsync(
            b => b.Kanal == kanal
        );
        return ObjectMapper.Map<List<Bildirim>, List<BildirimDto>>(bildirimler);
    }

    public async Task OkunduIsaretle(int id)
    {
        var bildirim = await _bildirimRepository.GetAsync(id);
        bildirim.OkunduMu = true;
        bildirim.OkunmaTarihi = DateTime.UtcNow;
        await _bildirimRepository.UpdateAsync(bildirim);
    }

    public async Task TumunuOkunduIsaretle(int kullaniciId)
    {
        var bildirimler = await _bildirimRepository.GetListAsync(
            b => b.KullaniciId == kullaniciId && !b.OkunduMu
        );

        foreach (var bildirim in bildirimler)
        {
            bildirim.OkunduMu = true;
            bildirim.OkunmaTarihi = DateTime.UtcNow;
            await _bildirimRepository.UpdateAsync(bildirim);
        }
    }

    public async Task<BildirimDto> CreateAsync(CreateBildirimDto input)
    {
        var bildirim = ObjectMapper.Map<CreateBildirimDto, Bildirim>(input);
        bildirim = await _bildirimRepository.InsertAsync(bildirim, autoSave: true);
        return ObjectMapper.Map<Bildirim, BildirimDto>(bildirim);
    }

    public async Task DeleteAsync(int id)
    {
        await _bildirimRepository.DeleteAsync(id);
    }
}