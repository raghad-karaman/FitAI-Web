using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace FitAI.Bildirimler;

public interface IBildirimAppService : IApplicationService
{
    Task<List<BildirimDto>> GetListAsync();

    Task<BildirimDto> GetAsync(int id);

    Task<List<BildirimDto>> GetByMagazaAsync(int magazaId);

    Task<List<BildirimDto>> GetByKullaniciAsync(int kullaniciId);

    Task<List<BildirimDto>> GetByKanalAsync(string kanal);

    Task OkunduIsaretle(int id);

    Task TumunuOkunduIsaretle(int kullaniciId);

    Task<BildirimDto> CreateAsync(CreateBildirimDto input);

    Task DeleteAsync(int id);
}