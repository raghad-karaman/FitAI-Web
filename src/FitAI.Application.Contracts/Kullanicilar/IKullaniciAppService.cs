using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace FitAI.Kullanicilar
{
    public interface IKullaniciAppService :
        ICrudAppService<KullaniciDto, int, PagedAndSortedResultRequestDto, CreateUpdateKullaniciDto>
    {
        Task<List<KullaniciDto>> GetListByMagazaIdAsync(int magazaId);
        Task<List<KullaniciDto>> GetListByRolAsync(string rol);
    }
}